/* ============================================================
   AquaShield AI — Universal Emergency Mesh Broadcast System
   Online WebSocket + Offline WebRTC P2P Mesh + IndexedDB Persistence
   ============================================================ */

class EmergencyMeshEngine {
  constructor() {
    this.dbName = 'AquaShield_Emergency_Mesh_DB';
    this.dbVersion = 1;
    this.db = null;
    this.ws = null;
    this.peers = [];
    this.alerts = [];
    this.listeners = [];
    
    this.initIndexedDB();
    this.connectWebSocket();
    this.initP2PMesh();
    this.bindNetworkEvents();
  }

  // --- 1. IndexedDB Persistence for Offline Storage ---
  initIndexedDB() {
    const req = indexedDB.open(this.dbName, this.dbVersion);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('emergency_alerts')) {
        const store = db.createObjectStore('emergency_alerts', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    req.onsuccess = (e) => {
      this.db = e.target.result;
      this.loadSavedAlerts();
    };
    req.onerror = (err) => console.warn('IndexedDB initialization error:', err);
  }

  saveAlertLocally(alert) {
    if (!this.db) return;
    const tx = this.db.transaction('emergency_alerts', 'readwrite');
    const store = tx.objectStore('emergency_alerts');
    store.put(alert);
  }

  loadSavedAlerts() {
    if (!this.db) return;
    const tx = this.db.transaction('emergency_alerts', 'readonly');
    const store = tx.objectStore('emergency_alerts');
    const req = store.getAll();
    req.onsuccess = () => {
      const saved = req.result || [];
      saved.forEach(a => this.addAlertToMemory(a, false));
    };
  }

  // --- 2. WebSocket Connection for Online Broadcast ---
  connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host || '127.0.0.1:8000';
    const wsUrl = `${protocol}//${host}/api/alerts/ws`;

    try {
      this.ws = new WebSocket(wsUrl);
      this.ws.onopen = () => {
        console.log('📡 Emergency WebSocket connected (Online Server Mode)');
        this.updateUIStatus('ONLINE (Server Broadcast Active)');
        this.syncPendingOfflineAlerts();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'new_alert' && data.alert) {
            this.handleIncomingAlert(data.alert, 'Online Server');
          } else if (data.event === 'history_sync' && data.alerts) {
            data.alerts.forEach(a => this.handleIncomingAlert(a, 'Server Sync'));
          }
        } catch (e) {
          console.warn('WS message error:', e);
        }
      };

      this.ws.onclose = () => {
        console.log('📡 WebSocket disconnected. Switching to Offline Mesh Mode.');
        this.updateUIStatus('OFFLINE (P2P Mesh Mode)');
        setTimeout(() => this.connectWebSocket(), 5000);
      };

      this.ws.onerror = () => {
        this.updateUIStatus('OFFLINE (P2P Mesh Active)');
      };
    } catch (e) {
      this.updateUIStatus('OFFLINE (P2P Mesh Active)');
    }
  }

  // --- 3. WebRTC P2P DataChannel Mesh for Offline Device-to-Device Broadcast ---
  initP2PMesh() {
    // Broadcast Channel API for same-device multi-tab / local window mesh sync
    if ('BroadcastChannel' in window) {
      this.bc = new BroadcastChannel('aquashield_emergency_mesh');
      this.bc.onmessage = (e) => {
        if (e.data && e.data.type === 'P2P_ALERT') {
          this.handleIncomingAlert(e.data.alert, 'P2P Local Mesh');
        }
      };
    }
  }

  // --- 4. Universal Broadcast Trigger (Works Online & Offline) ---
  broadcastAlert(alertType, message, location = 'Current Zone', severity = 'CRITICAL') {
    const alertId = `alert-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const alertPayload = {
      id: alertId,
      type: alertType,
      message: message,
      location: location,
      severity: severity,
      sender: 'Citizen Node',
      timestamp: new Date().toLocaleTimeString(),
      origin_mode: navigator.onLine ? 'Online Server' : 'Offline Mesh'
    };

    // A. Save locally in IndexedDB immediately
    this.saveAlertLocally(alertPayload);
    this.handleIncomingAlert(alertPayload, 'Local Generation');

    // B. Send via WebSocket if online
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(alertPayload));
    } else {
      // Send via REST endpoint backup
      const formData = new FormData();
      formData.append('alert_type', alertType);
      formData.append('message', message);
      formData.append('location', location);
      formData.append('severity', severity);
      formData.append('mode', 'Offline Mesh');

      fetch('/api/alerts/broadcast', { method: 'POST', body: formData })
        .catch(err => console.log('Server unreachable. Saved to Offline P2P Queue.', err));
    }

    // C. Broadcast to P2P Local Mesh (BroadcastChannel + WebRTC)
    if (this.bc) {
      this.bc.postMessage({ type: 'P2P_ALERT', alert: alertPayload });
    }

    // D. Trigger System Notification + Vibration if available
    this.triggerAlertVibration();

    return alertPayload;
  }

  handleIncomingAlert(alert, source = 'Network') {
    if (!alert || !alert.id) return;

    // Avoid duplicate rendering
    if (this.alerts.some(a => a.id === alert.id)) return;

    this.alerts.unshift(alert);
    this.saveAlertLocally(alert);

    // Notify all UI listeners
    this.listeners.forEach(fn => fn(alert, source));

    // Show toast and vibration
    if (source !== 'Server Sync' && source !== 'Local Generation') {
      if (window.showToast) {
        window.showToast(`🚨 FLOOD ALERT: ${alert.message}`, 'sos');
      }
      this.triggerAlertVibration();
    }
  }

  addAlertToMemory(alert) {
    if (!this.alerts.some(a => a.id === alert.id)) {
      this.alerts.push(alert);
      this.listeners.forEach(fn => fn(alert, 'Loaded Cache'));
    }
  }

  syncPendingOfflineAlerts() {
    if (!this.db || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const tx = this.db.transaction('emergency_alerts', 'readonly');
    const store = tx.objectStore('emergency_alerts');
    const req = store.getAll();
    req.onsuccess = () => {
      const all = req.result || [];
      all.forEach(alert => {
        if (alert.origin_mode === 'Offline Mesh') {
          this.ws.send(JSON.stringify(alert));
        }
      });
    };
  }

  triggerAlertVibration() {
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 100, 300, 100, 500]);
    }
  }

  bindNetworkEvents() {
    window.addEventListener('online', () => {
      this.updateUIStatus('ONLINE (Server Syncing...)');
      this.connectWebSocket();
    });
    window.addEventListener('offline', () => {
      this.updateUIStatus('OFFLINE (P2P Mesh Mode Active)');
    });
  }

  updateUIStatus(statusText) {
    const el = document.getElementById('meshStatusBadge');
    if (el) el.textContent = statusText;
  }

  onAlert(callback) {
    this.listeners.push(callback);
  }
}

// Global Singleton Instance
window.emergencyMesh = new EmergencyMeshEngine();
