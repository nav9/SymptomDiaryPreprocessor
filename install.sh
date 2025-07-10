#!/usr/bin/env bash
set -e
# Symptom Diary Data Processor - Library Installer for offline use
mkdir -p static
mkdir -p css
mkdir -p webfonts # Create directory for local fonts

download() {
  local url=$1; local dest=$2
  if [[ -f $dest ]]; then
    echo "$dest already exists, skipping"
  else
    echo "Downloading $dest..."
    curl -sL "$url" -o "$dest" && echo "OK"
  fi
}

# JS Libraries
download https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js static/jquery.min.js
download https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js static/moment.min.js

# Spectre CSS
download https://unpkg.com/spectre.css/dist/spectre.min.css static/spectre.min.css

# Font Awesome CSS and a new relative path for the fonts
download https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css static/all.min.css

# Font Awesome FONT FILES (This is the fix)
download https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/webfonts/fa-solid-900.woff2 webfonts/fa-solid-900.woff2
download https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/webfonts/fa-brands-400.woff2 webfonts/fa-brands-400.woff2
download https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/webfonts/fa-regular-400.woff2 webfonts/fa-regular-400.woff2


# Create CSS and JS files
touch css/style.css
touch index.html app.js
touch validate.html validation.js
touch define.html expand.html visualize.html encrypt.html faq.html contact.html

echo "Setup complete. Open index.html in your browser."