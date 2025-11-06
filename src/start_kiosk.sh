#!/bin/bash

# Define necessary variables explicitly
export DISPLAY=:0
export XAUTHORITY=/home/pi/.Xauthority


echo "Waiting for valid IP address..."
while true; do
    # Gets the first non-loopback, IPv4 address
    IP=$(ip addr show | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d/ -f1 | head -n 1)

    if [ -n "$IP" ]; then
        echo "Found IP: $IP. Starting Chromium."
        break
    fi
    sleep 5 # Wait 5 seconds before checking again
done
# --- End Wait Loop ---

# Use the validated IP here
# Command to run Chromium

CHROMIUM_CMD="/usr/bin/chromium --password-store=basic --start-fullscreen \
    --no-default-browser-check \
    --disable-session-crashed-bubble \
    --disable-infobars \
    --disable-features=TranslateUI,RendererCodeIntegrity --app=http://$IP:8765"


echo "Chromium will open URL: http://$IP:8765" >> /tmp/kiosk_startup_check.log

while true
do
  # Start Chromium and wait for it to exit
  $CHROMIUM_CMD

  # If Chromium is killed (e.g., manually, or it crashes), wait a short time
  # before relaunching to avoid a rapid crash-loop.
  sleep 5

  echo "Chromium crashed or was closed. Relaunching in 5 seconds..." >> /tmp/kiosk_restart.log
done