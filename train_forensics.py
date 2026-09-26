#!/usr/bin/env python3
"""
AquaShield AI — Dual-Stream ELA + RGB Deepfake & Tamper Classifier
High-Precision Image Forgery Detection trained on CASIA v1.0 / v2.0 / GenImage datasets.
"""

import os
import sys
import io
import time
import argparse
from typing import Tuple, List, Optional

# CUDA Memory Allocator Optimization
os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'expandable_segments:True'

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, random_split
from torchvision import transforms, models
from PIL import Image, ImageChops, ImageEnhance

# ── 1. Error Level Analysis (ELA) Extractor ──────────────────────────────────
def extract_ela_image(img: Image.Image, quality: int = 90) -> Image.Image:
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
        
        self.rgb_stream = models.efficientnet_b0(weights=weights)
        rgb_feat_dim = self.rgb_stream.classifier[1].in_features
        self.rgb_stream.classifier = nn.Identity()
        
        self.ela_stream = models.efficientnet_b0(weights=weights)
        ela_feat_dim = self.ela_stream.classifier[1].in_features
        self.ela_stream.classifier = nn.Identity()
        
        self.classifier = nn.Sequential(
            nn.Linear(rgb_feat_dim + ela_feat_dim, 512),
            nn.BatchNorm1d(512),
            nn.SiLU(),
            nn.Dropout(0.4),
            nn.Linear(512, 128),
            nn.BatchNorm1d(128),
            nn.SiLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 2)
        )

    def forward(self, rgb: torch.Tensor, ela: torch.Tensor) -> torch.Tensor:
        f_rgb = self.rgb_stream(rgb)
        f_ela = self.ela_stream(ela)
        fusion = torch.cat([f_rgb, f_ela], dim=1)
        return self.classifier(fusion)

# ── 4. High-Performance GPU Training Engine ──────────────────────────────────
def train_model(
    data_dir: str,
    epochs: int = 15,
    batch_size: int = 32,
    accum_steps: int = 2,
    lr: float = 2e-4,
    export_path: str = "backend/app/models/aquashield_forensic_dualstream.pth",
    device: Optional[str] = None
):
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
    device = torch.device(device)

    if device.type == "cuda":
        torch.cuda.empty_cache()
        torch.backends.cudnn.benchmark = True
        gpu_name = torch.cuda.get_device_name(0)
        vram_gb = torch.cuda.get_device_properties(0).total_memory / (1024**3)
        print(f"\n🚀 [GPU ACCELERATION ACTIVE] Device: {gpu_name} ({vram_gb:.1f} GB VRAM)")
        print(f"🔥 Mixed Precision (AMP FP16) + Gradient Accumulation Active (Effective Batch: {batch_size * accum_steps})")
    else:
        print(f"\n⚡ [CPU MODE] Device: {device}")

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

    val_size = int(0.15 * len(dataset))
    train_size = len(dataset) - val_size
    train_dataset, val_dataset = random_split(dataset, [train_size, val_size])

    num_workers = 4
    use_pin_memory = (device.type == "cuda")

    print(f"🧠 Utilizing {num_workers} parallel data workers | Micro-Batch: {batch_size}")

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=use_pin_memory,
        persistent_workers=True if num_workers > 0 else False
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=use_pin_memory,
        persistent_workers=True if num_workers > 0 else False
    )

    model = DualStreamForensicNet(pretrained=True).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    scaler = torch.cuda.amp.GradScaler(enabled=(device.type == "cuda"))

    best_val_acc = 0.0
    os.makedirs(os.path.dirname(export_path), exist_ok=True)

    print(f"\n[*] Starting training loop for {epochs} epochs...")
    print("=" * 75)

    for epoch in range(1, epochs + 1):
        start_time = time.time()
        
        model.train()
        train_loss = 0.0
        train_correct = 0
        total_train = 0
        optimizer.zero_grad(set_to_none=True)

        for batch_idx, (rgb, ela, labels) in enumerate(train_loader):
            rgb = rgb.to(device, non_blocking=True)
            ela = ela.to(device, non_blocking=True)
            labels = labels.to(device, non_blocking=True)

            with torch.cuda.amp.autocast(enabled=(device.type == "cuda")):
                outputs = model(rgb, ela)
                loss = criterion(outputs, labels) / accum_steps

            scaler.scale(loss).backward()

            if (batch_idx + 1) % accum_steps == 0 or (batch_idx + 1) == len(train_loader):
                scaler.step(optimizer)
                scaler.update()
                optimizer.zero_grad(set_to_none=True)

            train_loss += loss.item() * accum_steps * rgb.size(0)
            _, preds = torch.max(outputs, 1)
            train_correct += (preds == labels).sum().item()
            total_train += rgb.size(0)

        scheduler.step()
        epoch_train_loss = train_loss / total_train
        epoch_train_acc = (train_correct / total_train) * 100.0

        model.eval()
        val_loss = 0.0
        val_correct = 0
        total_val = 0

        with torch.no_grad():
            for rgb, ela, labels in val_loader:
                rgb = rgb.to(device, non_blocking=True)
                ela = ela.to(device, non_blocking=True)
                labels = labels.to(device, non_blocking=True)

                with torch.cuda.amp.autocast(enabled=(device.type == "cuda")):
                    outputs = model(rgb, ela)
                    loss = criterion(outputs, labels)

                val_loss += loss.item() * rgb.size(0)
                _, preds = torch.max(outputs, 1)
                val_correct += (preds == labels).sum().item()
                total_val += rgb.size(0)

        epoch_val_loss = val_loss / total_val if total_val > 0 else 0
        epoch_val_acc = (val_correct / total_val) * 100.0 if total_val > 0 else 0
        elapsed = time.time() - start_time

        gpu_mem_str = ""
        if device.type == "cuda":
            allocated = torch.cuda.max_memory_allocated() / (1024**2)
            gpu_mem_str = f" | VRAM: {allocated:.0f}MB"
            torch.cuda.empty_cache()

        print(f"Epoch [{epoch:02d}/{epochs:02d}] ({elapsed:.1f}s{gpu_mem_str}) "
              f"Train Loss: {epoch_train_loss:.4f} | Acc: {epoch_train_acc:.2f}%  ||  "
              f"Val Loss: {epoch_val_loss:.4f} | Val Acc: {epoch_val_acc:.2f}%")

        if epoch_val_acc > best_val_acc:
            best_val_acc = epoch_val_acc
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'val_acc': epoch_val_acc,
                'architecture': 'DualStream_EfficientNet_ELA_RGB',
            }, export_path)
            print(f"  --> Saved Best Checkpoint to: {export_path} (Acc: {best_val_acc:.2f}%)")

    print("=" * 75)
    print(f"\n[✓] High-Speed Training Complete! Peak Validation Accuracy: {best_val_acc:.2f}%")
    print(f"[✓] Model Checkpoint Ready: {export_path}\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train AquaShield Dual-Stream Forensic Net on CASIA")
    parser.add_argument("--data-dir", type=str, default="dataset/archive/CASIA2", help="Path to extracted CASIA dataset directory")
    parser.add_argument("--epochs", type=int, default=15, help="Number of training epochs")
    parser.add_argument("--batch-size", type=int, default=32, help="Batch size for training")
    parser.add_argument("--accum-steps", type=int, default=2, help="Gradient accumulation steps")
    parser.add_argument("--lr", type=float, default=2e-4, help="Learning rate")
    parser.add_argument("--export-path", type=str, default="backend/app/models/aquashield_forensic_dualstream.pth", help="Path to save trained weights")
    parser.add_argument("--device", type=str, default=None, help="Device to use ('cuda', 'cpu', or None for auto)")

    args = parser.parse_args()
    train_model(
        data_dir=args.data_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        accum_steps=args.accum_steps,
        lr=args.lr,
        export_path=args.export_path,
        device=args.device
    )
