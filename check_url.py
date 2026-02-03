import urllib.request
import sys

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

if __name__ == "__main__":
    url = "https://travelmap-mobile-v4-10124.surge.sh"
    check_url(url)
