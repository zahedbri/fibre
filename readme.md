# Fibre

[![Snap Status](https://build.snapcraft.io/badge/Fibre-Framework/fibre.svg)](https://build.snapcraft.io/user/Fibre-Framework/fibre)

# Installation
You only need to install fibre once, you should then update Fibre using the instructions [here](#updating).

1. Navigate to the directory where you would like to install Fibre, we will be using */etc/fibre*.
2. Clone this repository using the following command.

```bash
git clone https://github.com/mrbenosborne/fibre.git .
```

3. Make the *install.sh* and *update.sh* scripts executable by running the following command.

```bash
sudo chmod +x /etc/fibre/install.sh
sudo chmod +x /etc/fibre/update.sh
```

4. Run the install script.

```bash
sudo sh /etc/fibre/install.sh
```

# Updating

1. Navigate to the directory where you would like to install Fibre, we will be using */etc/fibre*.

2. Run the update script.

```bash
sudo sh /etc/fibre/update.sh
```

# Create an empty project

Once Fibre is installed you can run the following command to create a blank project.

```bash
sudo node /etc/fibre/fibre.js create-project=/var/web/
```

The following command will create an empty project in the directory */var/web*.

# Server Settings
Before you start the Fibre server make sure you have changed or checked over the server settings, you can find all these settings in a JSON file located at */etc/fibre/config/server.json*.

# Start Fibre Server

You can start the fibre server using the command below.

```bash
sudo node /etc/fibre/fibre.js
```

or to leave the server running and disconnect from the terminal:

```bash
sudo node /etc/fibre/fibre.js &
```

with the above command you can press *Ctrl + C* to release from the terminal, leaving the server to run in the background.

# Read the manual
Now you have Fibre Framework setup you should head over to [Fibre Framework's](http://fibreframework.com/) website and read the manual.

### Other command line commands
* "v" or "version" - Display's the current version of Fibre.

### Operating Systems Supported
* UNIX
* Windows