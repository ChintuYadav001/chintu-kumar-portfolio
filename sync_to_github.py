import os
import sys
import shutil
import subprocess
import time
from datetime import datetime

GIT_EXE = os.path.expanduser(r"~\AppData\Local\Programs\Git\cmd\git.exe")
if not os.path.exists(GIT_EXE):
    GIT_EXE = shutil.which("git") or "git"

SRC_DIR = r"D:\antigrevity_project\Portfolio" if os.path.exists(r"D:\antigrevity_project\Portfolio\index.html") else r"D:\antigrevity_project"
REPO_DIR = os.path.expanduser(r"~\AppData\Local\portfolio_git_repo")
REPO_URL = "https://github.com/ChintuYadav001/portfolio.git"

IGNORE_ITEMS = {
    ".git", ".system_generated", "scratch", "__pycache__", 
    ".tempmediaStorage", "Thumbs.db", "desktop.ini", "sync_to_github.py"
}

def run_cmd(cmd, cwd=None):
    print(f"Running: {' '.join(cmd)}")
    res = subprocess.run(cmd, cwd=cwd, text=True)
    return res.returncode == 0

def sync():
    print("=" * 60)
    print("  AUTOMATED PORTFOLIO SYNC TO GITHUB & NETLIFY")
    print("=" * 60)
    
    # 1. Check or clone repo
    if not os.path.exists(os.path.join(REPO_DIR, ".git")):
        print(f"\n1. Initializing local clone of {REPO_URL}...")
        if os.path.exists(REPO_DIR):
            shutil.rmtree(REPO_DIR, ignore_errors=True)
        if not run_cmd([GIT_EXE, "clone", REPO_URL, REPO_DIR]):
            print("Failed to clone repository.")
            return False
    else:
        print("\n1. Pulling latest changes from GitHub...")
        run_cmd([GIT_EXE, "pull", "origin", "main"], cwd=REPO_DIR)
        
    # 2. Copy updated files from D:\antigrevity_project to repo/antigrevity_project
    dest_proj_dir = os.path.join(REPO_DIR, "antigrevity_project")
    os.makedirs(dest_proj_dir, exist_ok=True)
    
    print(f"\n2. Syncing updated files from {SRC_DIR} to GitHub folder...")
    copied_count = 0
    for root, dirs, files in os.walk(SRC_DIR):
        # Skip ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_ITEMS]
        
        rel_path = os.path.relpath(root, SRC_DIR)
        target_dir = dest_proj_dir if rel_path == "." else os.path.join(dest_proj_dir, rel_path)
        os.makedirs(target_dir, exist_ok=True)
        
        for f in files:
            if f in IGNORE_ITEMS or f.endswith(".pyc") or f.startswith("."):
                continue
            src_file = os.path.join(root, f)
            dest_file = os.path.join(target_dir, f)
            
            # Copy if missing or modified
            if not os.path.exists(dest_file) or os.path.getmtime(src_file) > os.path.getmtime(dest_file):
                shutil.copy2(src_file, dest_file)
                copied_count += 1

    print(f"Synced {copied_count} files.")
    
    # 3. Create root redirect index.html so both URLs work without 404
    root_index = os.path.join(REPO_DIR, "index.html")
    with open(root_index, "w", encoding="utf-8") as f:
        f.write("""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=antigrevity_project/">
  <title>Chintu Kumar Portfolio</title>
  <script>window.location.replace("antigrevity_project/");</script>
</head>
<body style="background:#05080f;color:#38bdf8;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <p>Loading Chintu Kumar's Portfolio... <a href="antigrevity_project/" style="color:#00f2fe;">Click here if not redirected</a>.</p>
</body>
</html>
""")

    # 4. Check git status
    status_proc = subprocess.run([GIT_EXE, "status", "--porcelain"], cwd=REPO_DIR, capture_output=True, text=True)
    if not status_proc.stdout.strip():
        print("\nEverything is already up to date! No new changes to push.")
        return True
        
    print("\n3. Staging and committing changes...")
    run_cmd([GIT_EXE, "add", "-A"], cwd=REPO_DIR)
    
    timestamp = datetime.now().strftime("%Y-%m-%d %I:%M %p")
    commit_msg = f"Auto-update: Portfolio updates, cookies & location telemetry ({timestamp})"
    run_cmd([GIT_EXE, "commit", "-m", commit_msg], cwd=REPO_DIR)
    
    # 5. Push to GitHub
    print("\n4. Pushing changes to GitHub main branch...")
    print("*(If this is your first push, a browser login window will appear - click 'Sign in with your browser')*")
    
    push_success = run_cmd([GIT_EXE, "push", "origin", "main"], cwd=REPO_DIR)
    
    if push_success:
        print("\n" + "=" * 60)
        print("SUCCESS! All updates have been pushed to GitHub!")
        print("Netlify will auto-update in ~10 seconds.")
        print("GitHub Pages will auto-update in ~30 seconds.")
        print("=" * 60)
        return True
    else:
        print("\nPush did not finish. Please check authentication.")
        return False

if __name__ == "__main__":
    success = sync()
    if not success and sys.stdout.isatty():
        input("\nPress Enter to exit...")
