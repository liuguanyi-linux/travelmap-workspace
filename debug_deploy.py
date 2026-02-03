import urllib.request
import subprocess
import sys
import os

def check_url(url):
    print(f"Checking {url}...")
    try:
        req = urllib.request.Request(url, method='HEAD')
        with urllib.request.urlopen(req) as response:
            print(f"Status for {url}: {response.status}")
    except urllib.error.HTTPError as e:
        print(f"HTTPError checking {url}: {e.code}")
    except Exception as e:
        print(f"Error checking {url}: {e}")

def run_surge():
    print("Running surge...")
    try:
        # Run surge and redirect output to files
        # We need to be in frontend dir for the command to find node_modules if we use relative path
        # But my script assumes we are in workspace root and calling into frontend
        
        # Let's verify we are in workspace root
        cwd = os.getcwd()
        print(f"Current working directory: {cwd}")
        
        frontend_dir = os.path.join(cwd, 'frontend')
        
        # Check if node_modules exists
        if not os.path.exists(os.path.join(frontend_dir, 'node_modules')):
            print("Error: node_modules not found in frontend")
            return

        with open('surge_out.txt', 'w') as fout, open('surge_err.txt', 'w') as ferr:
            result = subprocess.run(
                ['node', 'node_modules/surge/bin/surge', 'dist'], 
                cwd=frontend_dir,
                stdout=fout,
                stderr=ferr,
                shell=True
            )
        print(f"Surge exit code: {result.returncode}")
        
        print("--- STDOUT ---")
        if os.path.exists('surge_out.txt'):
            with open('surge_out.txt', 'r') as f:
                print(f.read())
        
        print("--- STDERR ---")
        if os.path.exists('surge_err.txt'):
            with open('surge_err.txt', 'r') as f:
                print(f.read())
            
    except Exception as e:
        print(f"Failed to run surge: {e}")

if __name__ == "__main__":
    url = "https://travelmap-final-fix-10124.surge.sh"
    check_url(url)
    run_surge()
    check_url(url)
