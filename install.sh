#!/usr/bin/env bash
set -e
# Symptom Diary Data Processor - Library Installer for offline use
mkdir -p static
mkdir -p css

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

# Spectre CSS Framework
download https://unpkg.com/spectre.css/dist/spectre.min.css static/spectre.min.css
download https://unpkg.com/spectre.css/dist/spectre-exp.min.css static/spectre-exp.min.css
download https://unpkg.com/spectre.css/dist/spectre-icons.min.css static/spectre-icons.min.css

# Font Awesome
download https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css static/all.min.css

# Create CSS and JS files
touch css/style.css
touch index.html app.js
touch validate.html validation.js
touch define.html expand.html visualize.html analyze.html encrypt.html faq.html contact.html

echo "Setup complete. Open index.html in your browser."