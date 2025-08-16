#!/bin/bash

# A script to set up the Symptom Diary Visualizer project structure and download dependencies.

echo "Starting project setup..."

# --- Configuration ---
# Using specific versions for stability, but you can change them to 'latest' if needed.
BOOTSTRAP_VERSION="5.3.3"
JQUERY_VERSION="3.7.1"
JQUERY_UI_VERSION="1.13.2"
FONT_AWESOME_VERSION="6.5.2"

# --- Directory Creation ---
echo "Creating project directories..."
mkdir -p css js data lib/bootstrap lib/jquery lib/fontawesome
mkdir -p js/controllers js/services js/ui js/utils
echo "Directories created successfully."

# --- Helper Function for Downloading ---
download_file() {
    local url=$1
    local destination=$2
    local filename=$(basename "$destination")

    if [ -f "$destination" ]; then
        echo "$filename already exists. Skipping download."
    else
        echo "Downloading $filename from $url..."
        if curl -f -L "$url" -o "$destination"; then
            echo "$filename downloaded successfully."
        else
            echo "ERROR: Failed to download $filename from $url."
            echo "Please check your internet connection or the URL."
            exit 1
        fi
    fi
}

# --- Download Dependencies ---

# 1. Bootstrap (CSS and JS Bundle)
echo -e "\n--- Handling Bootstrap ---"
BS_CSS_URL="https://cdn.jsdelivr.net/npm/bootstrap@$BOOTSTRAP_VERSION/dist/css/bootstrap.min.css"
BS_JS_URL="https://cdn.jsdelivr.net/npm/bootstrap@$BOOTSTRAP_VERSION/dist/js/bootstrap.bundle.min.js"
download_file "$BS_CSS_URL" "lib/bootstrap/bootstrap.min.css"
download_file "$BS_JS_URL" "lib/bootstrap/bootstrap.bundle.min.js"

# 2. jQuery
echo -e "\n--- Handling jQuery ---"
#https://code.jquery.com/jquery-3.7.1.min.js
JQUERY_URL="https://code.jquery.com/jquery-$JQUERY_VERSION.min.js"
download_file "$JQUERY_URL" "lib/jquery/jquery.min.js"


#download jQuery UI
JQUERY_UI_VERSION="1.13.2"
download_file "https://code.jquery.com/ui/$JQUERY_UI_VERSION/jquery-ui.min.js" "lib/jquery/jquery-ui.min.js"
download_file "https://code.jquery.com/ui/$JQUERY_UI_VERSION/themes/base/jquery-ui.css" "lib/jquery/jquery-ui.css"


# 3. Font Awesome (CSS and Webfonts)
echo -e "\n--- Handling Font Awesome ---"
FA_CSS_URL="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@$FONT_AWESOME_VERSION/css/all.min.css"
FA_WEBFONTS_URL="https://github.com/FortAwesome/Font-Awesome/archive/refs/tags/$FONT_AWESOME_VERSION.zip"
FA_ZIP_FILE="lib/fontawesome/fontawesome.zip"
FA_EXTRACT_DIR="lib/fontawesome/temp_fa"
FA_FINAL_FONTS_DIR="lib/fontawesome/webfonts"

download_file "$FA_CSS_URL" "lib/fontawesome/all.min.css"

# Download and extract webfonts
if [ -d "$FA_FINAL_FONTS_DIR" ]; then
    echo "Font Awesome webfonts directory already exists. Skipping download."
else
    echo "Downloading Font Awesome webfonts..."
    if curl -f -L "$FA_WEBFONTS_URL" -o "$FA_ZIP_FILE"; then
        echo "Extracting webfonts..."
        mkdir -p "$FA_EXTRACT_DIR"
        unzip -q "$FA_ZIP_FILE" -d "$FA_EXTRACT_DIR"
        # The unzipped folder has a name like Font-Awesome-6.5.2
        EXTRACTED_FOLDER=$(find "$FA_EXTRACT_DIR" -type d -name "Font-Awesome-*" -print -quit)
        if [ -d "$EXTRACTED_FOLDER/webfonts" ]; then
            mv "$EXTRACTED_FOLDER/webfonts" "$FA_FINAL_FONTS_DIR"
            echo "Webfonts moved to $FA_FINAL_FONTS_DIR."
        else
            echo "ERROR: Could not find webfonts directory in the downloaded zip."
        fi
        rm "$FA_ZIP_FILE"
        rm -rf "$FA_EXTRACT_DIR"
    else
        echo "ERROR: Failed to download Font Awesome webfonts."
        echo "You may need to download them manually from https://fontawesome.com/download"
    fi
fi


# --- Create Placeholder Files ---
echo -e "\n--- Creating placeholder files ---"
touch css/style.css

# Main JS files
mkdir -p js/controllers
mkdir -p js/services
mkdir -p js/ui
mkdir -p js/utils

touch js/logger.js
touch js/state.js
touch js/controllers/appController.js # Main orchestrator
touch js/controllers/step1Controller.js # Logic for Step 1
touch js/controllers/step2Controller.js # Logic for Step 2
touch js/controllers/step3Controller.js 
touch js/controllers/step4Controller.js
touch js/services/lineRecognizerService.js
touch js/services/validatorService.js
touch js/services/phraseService.js
touch js/services/knowledgeBaseService.js
touch js/ui/uiService.js # For modals, notifications, etc.
touch js/utils/date-parser.js # For robust date parsing
touch js/dummy-data.js

touch index.html faq.html contact.html app.html
echo "Placeholder files created."


echo -e "\n\nSetup complete. You can now start building the application."
