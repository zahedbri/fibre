#!/bin/bash

# Log
echo ""
echo "-> Updating Fibre from [1.0.1] to [1.0.1]..."

# Set repository URL
repo_url="https://github.com/Fibre-Framework/fibre/releases/latest"

# Remove old fibre directory if still exists
if [ -d "fibre" ]; then
        rm -R fibre/
fi

# Clone the repository
git clone --quiet $repo_url;

# Check if clone was success
if [ -d "fibre" ]; then

        # Copy core files
        cp -R fibre/core/. core/

        # Copy fibre.js
        cp fibre/fibre.js fibre.js

        # Copy update and install scripts
        cp fibre/install.sh install.sh
        cp fibre/update.sh update.sh

fi

# Remove fibre folder
rm -R fibre/

# Install done
echo "-> Fibre has been updated successfully!"
echo "-> Enjoy!"
