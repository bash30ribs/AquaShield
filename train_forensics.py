#!/usr/bin/env python3
"""
AquaShield AI — Dual-Stream ELA + RGB Deepfake & Tamper Classifier
High-Precision Image Forgery Detection trained on CASIA v1.0 / v2.0 / GenImage datasets.

Architecture:
- Stream 1: RGB Optical Texture Stream (EfficientNet-B0 / ResNet)
- Stream 2: Error Level Analysis (ELA) Compression Artifact Stream
- Fusion Head: Cross-attention residual concatenation for binary classification (Authentic vs Tampered)
"""

import os
import sys
import io
import time
import argparse
from typing import Tuple, List, Optional

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, random_split
from torchvision import transforms, models
from PIL import Image, ImageChops, ImageEnhance

# ── 1. Error Level Analysis (ELA) Extractor ──────────────────────────────────
def extract_ela_image(img: Image.Image, quality: int = 90) -> Image.Image:
    """
    Computes the localized pixel compression delta against a 90% JPEG recompression.
    Amplifies digital editing artifacts and splicing boundaries.
    """
    rgb = img.convert('RGB')
    buffer = io.BytesIO()
    rgb.save(buffer, 'JPEG', quality=quality)
    buffer.seek(0)
    recompressed = Image.open(buffer)
    
    diff = ImageChops.difference(rgb, recompressed)
    extrema = diff.getextrema()
    max_diff = max([ex[1] for ex in extrema]) if extrema else 1
    if max_diff == 0:
        max_diff = 1
    scale = 255.0 / max_diff
    diff = ImageEnhance.Brightness(diff).enhance(scale)
    return diff

# ── 2. CASIA & Custom Image Forensics Dataset ─────────────────────────────────
class ForensicDataset(Dataset):
    def __init__(self, root_dir: str, transform=None):
        self.samples: List[Tuple[str, int]] = []
        self.transform = transform
        
        # Search for authentic (0) and tampered (1) directories
        auth_names = ['au', 'authentic', 'real', 'pristine', 'nature']
        tamp_names = ['tp', 'tampered', 'fake', 'spliced', 'copymove', 'synthetic']
        
        found_folders = False
        for root, dirs, files in os.walk(root_dir):
            for d in dirs:
                d_lower = d.lower()
                target_label = None
                if any(k == d_lower or k in d_lower for k in auth_names):
                    target_label = 0
                elif any(k == d_lower or k in d_lower for k in tamp_names):
                    target_label = 1
                
                if target_label is not None:
                    found_folders = True
                    target_dir = os.path.join(root, d)
                    for fname in os.listdir(target_dir):
                        if fname.lower().endswith(('.jpg', '.jpeg', '.png', '.tif', '.bmp')):
                            self.samples.append((os.path.join(target_dir, fname), target_label))

        if not found_folders:
            # Fallback: scan root directory directly for standard CASIA structure
            for label, folder in [(0, 'Au'), (1, 'Tp'), (0, 'authentic'), (1, 'tampered')]:
                fpath = os.path.join(root_dir, folder)
                if os.path.exists(fpath):
                    for fname in os.listdir(fpath):
                        if fname.lower().endswith(('.jpg', '.jpeg', '.png', '.tif', '.bmp')):
                            self.samples.append((os.path.join(fpath, fname), label))

        print(f"[*] Indexed {len(self.samples)} total forensic images from {root_dir}")
        auth_count = sum(1 for _, l in self.samples if l == 0)
        tamp_count = sum(1 for _, l in self.samples if l == 1)
        print(f"    -> Authentic: {auth_count} samples | Tampered: {tamp_count} samples")

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int):
        path, label = self.samples[idx]
        try:
            img = Image.open(path).convert('RGB')
            ela = extract_ela_image(img)
        except Exception:
            # Handle corrupted or unreadable images gracefully
            img = Image.new('RGB', (224, 224), color=(0, 0, 0))
            ela = Image.new('RGB', (224, 224), color=(0, 0, 0))

        if self.transform:
            img_tensor = self.transform(img)
            ela_tensor = self.transform(ela)
        else:
            default_tf = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
            img_tensor = default_tf(img)
            ela_tensor = default_tf(ela)

        return img_tensor, ela_tensor, torch.tensor(label, dtype=torch.long)

# ── 3. Dual-Stream Forensic Deep Neural Network ──────────────────────────────
class DualStreamForensicNet(nn.Module):
    def __init__(self, pretrained: bool = True):
        super().__init__()
        weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
        
        # Stream 1: RGB Optical Texture Stream
        self.rgb_stream = models.efficientnet_b0(weights=weights)
        rgb_feat_dim = self.rgb_stream.classifier[1].in_features
        self.rgb_stream.classifier = nn.Identity()
        
        # Stream 2: ELA Compression Residual Stream
        self.ela_stream = models.efficientnet_b0(weights=weights)
        ela_feat_dim = self.ela_stream.classifier[1].in_features
        self.ela_stream.classifier = nn.Identity()
        
        # Cross-Stream Fusion Classifier Head
        self.classifier = nn.Sequential(
            nn.Linear(rgb_feat_dim + ela_feat_dim, 512),
            nn.BatchNorm1d(512),
            nn.SiLU(),
            nn.Dropout(0.4),
            nn.Linear(512, 128),
            nn.BatchNorm1d(128),
            nn.SiLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 2)  # 0: Authentic, 1: Tampered/Fake
        )

    def forward(self, rgb: torch.Tensor, ela: torch.Tensor) -> torch.Tensor:
        f_rgb = self.rgb_stream(rgb)
        f_ela = self.ela_stream(ela)
        fusion = torch.cat([f_rgb, f_ela], dim=1)
        return self.classifier(fusion)

# ── 4. Training Engine ────────────────────────────────────────────────────────
def train_model(
    data_dir: str,
    epochs: int = 15,
    batch_size: int = 32,
    lr: float = 1e-4,
    export_path: str = "backend/app/models/aquashield_forensic_dualstream.pth",
    device: Optional[str] = None
):
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
    device = torch.device(device)
    print(f"\n🌊 AquaShield Sentinel — Training Dual-Stream Forensic Net on [{device}]")

    # Data Transforms with Forensic Augmentation
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    dataset = ForensicDataset(data_dir, transform=train_transform)
    if len(dataset) == 0:
        print(f"[!] Error: No valid image samples found in '{data_dir}'")
        print("    Ensure your dataset contains 'Au/' (Authentic) and 'Tp/' (Tampered) subdirectories.")
        sys.exit(1)

    # Train/Validation Split (85% Train, 15% Validation)
    val_size = int(0.15 * len(dataset))
    train_size = len(dataset) - val_size
    train_dataset, val_dataset = random_split(dataset, [train_size, val_size])

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=2, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=2, pin_memory=True)

    model = DualStreamForensicNet(pretrained=True).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_val_acc = 0.0
    os.makedirs(os.path.dirname(export_path), exist_ok=True)

    print(f"\n[*] Starting training loop for {epochs} epochs...")
    print("=" * 70)

    for epoch in range(1, epochs + 1):
        start_time = time.time()
        
        # Training Phase
        model.train()
        train_loss = 0.0
        train_correct = 0
        total_train = 0

        for batch_idx, (rgb, ela, labels) in enumerate(train_loader):
            rgb, ela, labels = rgb.to(device), ela.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(rgb, ela)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            train_loss += loss.item() * rgb.size(0)
            _, preds = torch.max(outputs, 1)
            train_correct += (preds == labels).sum().item()
            total_train += rgb.size(0)

        scheduler.step()
        epoch_train_loss = train_loss / total_train
        epoch_train_acc = (train_correct / total_train) * 100.0

        # Validation Phase
        model.eval()
        val_loss = 0.0
        val_correct = 0
        total_val = 0

        with torch.no_grad():
            for rgb, ela, labels in val_loader:
                rgb, ela, labels = rgb.to(device), ela.to(device), labels.to(device)
                outputs = model(rgb, ela)
                loss = criterion(outputs, labels)

                val_loss += loss.item() * rgb.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += (preds == labels).sum().item()
                total_val += rgb.size(0)

        epoch_val_loss = val_loss / total_val if total_val > 0 else 0
        epoch_val_acc = (val_correct / total_val) * 100.0 if total_val > 0 else 0
        elapsed = time.time() - start_time

        print(f"Epoch [{epoch:02d}/{epochs:02d}] ({elapsed:.1f}s) "
              f"Train Loss: {epoch_train_loss:.4f} | Acc: {epoch_train_acc:.2f}%  ||  "
              f"Val Loss: {epoch_val_loss:.4f} | Val Acc: {epoch_val_acc:.2f}%")

        # Save Best Checkpoint
        if epoch_val_acc > best_val_acc:
            best_val_acc = epoch_val_acc
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'val_acc': epoch_val_acc,
                'architecture': 'DualStream_EfficientNet_ELA_RGB',
            }, export_path)
            print(f"  --> Saved Best Model Checkpoint to: {export_path} (Acc: {best_val_acc:.2f}%)")

    print("=" * 70)
    print(f"\n[✓] Training Complete! Peak Validation Accuracy: {best_val_acc:.2f}%")
    print(f"[✓] Production Weights Ready at: {export_path}\n")

# ── 5. CLI Entrypoint ─────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train AquaShield Dual-Stream Forensic Net on CASIA")
    parser.add_argument("--data-dir", type=str, default="dataset/CASIA2", help="Path to extracted CASIA dataset directory")
    parser.add_argument("--epochs", type=int, default=15, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size for training")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate")
    parser.add_argument("--export-path", type=str, default="backend/app/models/aquashield_forensic_dualstream.pth", help="Path to save trained weights")
    parser.add_argument("--device", type=str, default=None, help="Device to use ('cuda', 'cpu', or None for auto)")

    args = parser.parse_args()
    train_model(
        data_dir=args.data_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        export_path=args.export_path,
        device=args.device
    )
