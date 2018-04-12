#!/bin/bash

# Log
echo ""
echo "-> Updating Fibre..."

# Set repository URL
repo_url="https://github.com/Fibre-Framework/fibre.git"

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

        # Copy node_modules
        cp -R fibre/node_modules/. node_modules/

        # Copy version file
        cp fibre/version.txt version.txt

fi

# Remove fibre folder
rm -R fibre/

# Get version number
if [ -f "version.txt" ]; then
        version=$(cat "version.txt")
else
        version="UNKNOWN"
fi

# Install done
echo "-> Fibre has been updated successfully to version [$version]!"
echo "-> Enjoy!"
