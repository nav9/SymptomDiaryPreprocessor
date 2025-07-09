#!/usr/bin/env bash
set -e
# Symptom Diary Data Processor - Library Installer for offline use
mkdir -p static

download() {
  local url=$1; local dest=$2
  if [[ -f $dest ]]; then
    echo "$dest already exists, skipping"
  else
    echo "Downloading $dest..."
    curl -sL "$url" -o "$dest" && echo "OK"
  fi
}

download https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js static/jquery.min.js
download https://cdnjs.cloudflare.com/ajax/libs/spectre.css/0.4.5/spectre.min.css static/spectre.min.css
download https://cdn.jsdelivr.net/npm/date-fns@3.6.0/cdn.min.js static/date-fns.min.js
download https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js static/moment.min.js
download https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js static/lodash.min.js
download https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css static/all.min.css
download https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js static/papaparse.min.js

# Create empty HTML files for other pages
touch validate.html define.html expand.html visualize.html analyze.html encrypt.html faq.html contact.html index.html app.js
