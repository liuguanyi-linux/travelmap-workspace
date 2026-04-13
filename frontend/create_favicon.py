import urllib.request
import os

# Download the exact image provided by user (simulated by a similar base64 or downloading a generic blue map icon for this demo)
# Since we can't directly read the user's uploaded image file from the chat UI into the local filesystem,
# We will download a similar blue map marker icon and convert it.

url = "https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/map-location-dot.svg"

try:
    print("Downloading base icon...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        svg_data = response.read().decode('utf-8')
        
    # We will modify the SVG to have the blue background and white icon to match the user's request
    blue_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <rect width="512" height="512" rx="120" fill="#008CE6"/>
    <g transform="translate(64, 64) scale(0.75)" fill="#ffffff">
        {svg_data[svg_data.find('<path'):svg_data.find('</svg>')]}
    </g>
</svg>'''

    # Save SVG
    with open('public/icon.svg', 'w') as f:
        f.write(blue_svg)
        
    print("SVG generated. We need a tool to convert SVG to PNG/ICO.")
    print("Please run: brew install imagemagick && cd public && convert -background none icon.svg -resize 32x32 favicon-32.png")
except Exception as e:
    print(f"Error: {e}")

