"""
AquaShield AI - 1-Click Python Launcher
Installs dependencies if missing, starts the server, and opens the browser.
"""
import sys
import os
import subprocess
import webbrowser
import time

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(base_dir)
    backend_dir = os.path.join(base_dir, "backend")
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    
    print("=" * 60)
    print("  🌊 AQUASHIELD AI - COASTAL DISASTER INTELLIGENCE PLATFORM")
    print("=" * 60)
    print("\n[1/3] Checking dependencies...")
    
    try:
        import fastapi
        import uvicorn
        import pydantic_settings
        import sqlalchemy
        import aiosqlite
    except ImportError:
        print("  -> Installing required packages...")
        subprocess.check_call([
            sys.executable, "-m", "pip", "install",
            "fastapi", "uvicorn", "pydantic", "pydantic-settings",
            "sqlalchemy", "aiosqlite", "python-multipart"
        ])
        print("  -> Installation complete!")

    print("\n[2/3] Preparing AquaShield AI Server...")
    server_port = 8000
    app_url = f"http://127.0.0.1:{server_port}"
    
    import threading
    def open_browser():
        time.sleep(1.5)
        print(f"\n[3/3] Opening browser at {app_url} ...")
        try:
            webbrowser.open(app_url)
        except Exception:
            pass
    
    threading.Thread(target=open_browser, daemon=True).start()
    
    print(f"\n🚀 AquaShield AI Live at: {app_url}")
    print("💡 Press Ctrl+C in this terminal to stop the server anytime.\n")
    
    import uvicorn
    from app.main import app
    uvicorn.run(app, host="127.0.0.1", port=server_port, log_level="info")

if __name__ == "__main__":
    main()
