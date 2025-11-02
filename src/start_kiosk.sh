#!/bin/bash

# Define necessary variables explicitly
export DISPLAY=:0
export XAUTHORITY=/home/pi/.Xauthority

# Command to run Chromium
CHROMIUM_CMD="/usr/bin/chromium --no-sandbox --password-store=basic --start-fullscreen --kiosk --incognito http://raspberrypi.local:8765"

while true
do
  # Start Chromium and wait for it to exit
  $CHROMIUM_CMD

  # If Chromium is killed (e.g., manually, or it crashes), wait a short time 
  # before relaunching to avoid a rapid crash-loop.
  sleep 5

  echo "Chromium crashed or was closed. Relaunching in 5 seconds..." >> /tmp/kiosk_restart.log
done
