import json
import os
import platform
import socket
import subprocess
import hashlib
import time
import requests

# --- CONFIGURATION ---
API_ENDPOINT = "http://localhost:3001/api/report"
CHECK_INTERVAL_SECONDS = 30  # 30 seconds for testing
STATE_FILE_NAME = "state.json"

# --- HELPER FUNCTIONS ---

def get_machine_id():
    """Generates a unique and stable ID for the machine based on its hostname."""
    hostname = socket.gethostname()
    return hashlib.sha256(hostname.encode()).hexdigest()

def save_state(state):
    """Saves the current system info state to a JSON file."""
    try:
        with open(STATE_FILE_NAME, 'w') as f:
            json.dump(state, f, indent=2)
    except Exception as e:
        print(f"Error saving state: {e}")

def load_state():
    """Loads the last known system info state from the JSON file."""
    if not os.path.exists(STATE_FILE_NAME):
        return None
    try:
        with open(STATE_FILE_NAME, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading state: {e}")
        return None

# --- SYSTEM CHECKS ---

def check_disk_encryption():
    """Checks disk encryption status. NOTE: This is a simplified check."""
    system = platform.system()
    try:
        if system == "Windows":
            result = subprocess.run(
                ["manage-bde", "-status", "C:"],
                capture_output=True, text=True, check=True, shell=True
            )
            return "Protection On" in result.stdout
        elif system == "Darwin": # macOS
            result = subprocess.run(
                ["fdesetup", "status"],
                capture_output=True, text=True, check=True
            )
            return "FileVault is On." in result.stdout
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False
    return False

def check_antivirus():
    """Checks for common antivirus processes. NOTE: This is a simplified check."""
    system = platform.system()
    antivirus_processes = []
    if system == "Windows":
        antivirus_processes = ["MsMpEng.exe", "avgsvc.exe", "avguard.exe", "bdagent.exe"]
        cmd = 'tasklist'
    elif system == "Darwin": # macOS
        antivirus_processes = ["Avast", "AVG", "Bitdefender", "Sophos"]
        cmd = 'ps aux'
    else: # Linux
        return False

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True, shell=True)
        running_processes = result.stdout
        for av in antivirus_processes:
            if av.lower() in running_processes.lower():
                return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False
    return False

def check_sleep_settings():
    """Checks if inactivity sleep is <= 10 minutes. NOTE: This is a simplified check."""
    system = platform.system()
    try:
        if system == "Windows":
            result = subprocess.run(
                ["powercfg", "/q"],
                capture_output=True, text=True, check=True, shell=True
            )
            for line in result.stdout.splitlines():
                if "SUB_SLEEP" in line and "hibernate" not in line.lower():
                    parts = line.split()
                    hex_val = parts[-1]
                    seconds = int(hex_val, 16)
                    minutes = seconds / 60
                    return minutes <= 10
        elif system == "Darwin": # macOS
            result = subprocess.run(
                ["pmset", "-g"],
                capture_output=True, text=True, check=True
            )
            for line in result.stdout.splitlines():
                if " sleep" in line and "displaysleep" not in line:
                    parts = line.strip().split()
                    minutes = int(parts[1])
                    return minutes > 0 and minutes <= 10
    except (subprocess.CalledProcessError, FileNotFoundError, ValueError):
        return False
    return False

def run_all_checks():
    """Runs all system health checks and returns a dictionary."""
    print("Running checks...")
    info = {
        "is_encrypted": check_disk_encryption(),
        "os_version": f"{platform.system()} {platform.release()}",
        "is_antivirus_running": check_antivirus(),
        "sleep_minutes_compliant": check_sleep_settings(),
    }
    print(f"Checks complete: {info}")
    return info


# --- MAIN DAEMON LOOP (UPDATED) ---

def main():
    """The main function that runs the daemon loop."""
    print("--- System Health Utility (Always Reporting) ---")
    machine_id = get_machine_id()
    print(f"Machine ID: {machine_id}")
    
    while True:
        current_state = run_all_checks()

        # The check 'if current_state != last_state:' has been removed.
        # This block will now run every time.
        print("Reporting to server...")
        payload = {
            "machine_id": machine_id,
            "os": platform.system(),
            "system_info": current_state
        }
        try:
            response = requests.post(API_ENDPOINT, json=payload)
            response.raise_for_status()
            print(f"Successfully reported to server. Status: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"ERROR: Could not report to server. {e}")

        print(f"Waiting for {CHECK_INTERVAL_SECONDS} seconds before next check.")
        time.sleep(CHECK_INTERVAL_SECONDS)

if __name__ == "__main__":
    main()
