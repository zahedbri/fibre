# Fibre


[![Snap Status](https://build.snapcraft.io/badge/Fibre-Framework/fibre.svg)](https://build.snapcraft.io/user/Fibre-Framework/fibre)

# Installation

## Installing via Snap

Take a look at [Fibre Framework on the Snap Store](https://snapcraft.io/fibre-framework).

Run the following command to install via Ubuntu Snap.

```
sudo snap install fibre-framework
```

## Updating

Run the following command.

```
sudo snap refresh fibre-framework
```

# Server Commands

## Create an empty website

Once Fibre is installed you can create a new website using the following command, you might need to run this command as "root".

```
sudo fibre-framework.manage create-website=hello-world
```

Next, edit your server.json file to reflect your new website directory, you can edit the file at:

```
sudo nano /var/snap/fibre-framework/current/server.json
```

## Start Fibre Server

You can start the fibre server using the command below.

```bash
sudo systemctl start snap.fibre-framework.server
```

## Stopping the server

```bash
sudo systemctl stop snap.fibre-framework.server
```

## Checking the status of the server

```bash
sudo systemctl status snap.fibre-framework.server
```

# Read the manual


### Operating Systems Supported
* Ubuntu/Linux via Snap