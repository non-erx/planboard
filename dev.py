import subprocess
import sys
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND = os.path.join(ROOT, "backend")
FRONTEND = os.path.join(ROOT, "frontend")

def run():
    print("Starting backend on http://localhost:5000 ...")
    backend = subprocess.Popen(
        [sys.executable, "-m", "flask", "run", "--port", "5000", "--debug"],
        cwd=BACKEND,
        env={**os.environ, "FLASK_APP": "app.py"},
    )

    print("Starting frontend on http://localhost:3000 ...")
    npm = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend = subprocess.Popen(
        [npm, "run", "dev"],
        cwd=FRONTEND,
    )

    print("\nOpen http://localhost:3000 in your browser.\nPress Ctrl+C to stop.\n")

    try:
        frontend.wait()
    except KeyboardInterrupt:
        pass
    finally:
        backend.terminate()
        frontend.terminate()
        backend.wait()
        frontend.wait()
        print("Stopped.")

if __name__ == "__main__":
    run()
