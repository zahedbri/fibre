# Fibre

[![Snap Status](https://build.snapcraft.io/badge/Fibre-Framework/fibre.svg)](https://build.snapcraft.io/user/Fibre-Framework/fibre)

# Installation

Run the following command to install via Ubuntu Snap.

```
sudo snap install fibre-framework
```

# Updating

Run the following command.

```
sudo snap refresh fibre-framework
```

# Create an empty project

Once Fibre is installed you can **cd** to /var/snap/fibre-framework/current/sites/, create a new directory where you want your website to be hosted, download the project skeleton from:

```
https://github.com/Fibre-Framework/fibre/tree/master/core/storage/project-skeleton
```

and place all the files inside your new website directory for example:

```
/var/snap/fibre-framework/current/sites/my-website/
```

Next, edit your server.json file to refelect your new website directory, you can edit the file at:

```
sudo nano /var/snap/fibre-framework/current/server.json
```

# Server Settings
Before you start the Fibre server make sure you have changed or checked over the server settings, you can find all these settings in a JSON file located at */etc/fibre/config/server.json*.

# Start Fibre Server

You can start the fibre server using the command below.

```bash
sudo systemctl start snap.fibre-framework.server
```

# Stopping the server

```bash
sudo systemctl stop snap.fibre-framework.server
```

# Checking the status of the server

```bash
sudo systemctl status snap.fibre-framework.server
```

with the above command you can press *Ctrl + C* to release from the terminal, leaving the server to run in the background.

# Read the manual
Now you have Fibre Framework setup you should head over to [Fibre Framework's](http://fibreframework.com/) website and read the manual.

### Operating Systems Supported
* Ubuntu/Linux via Snap