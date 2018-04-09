#!/bin/bash

# Log
echo ""
echo "-> Installing Fibre [1.0.0]..."

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

        # Copy files into working directory
        cp -R fibre/. .

fi

# Remove fibre folder
rm -R fibre/

# Create a web folder in var
mkdir /var/web/

# Install done
echo "-> Fibre has been installed successfully!"
echo "-> Enjoy!"
