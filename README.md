# MotionEye Automation Template

A lightweight, configurable Raspberry Pi automation system for multi-camera MotionEye surveillance setups, with crash recovery and anti-SD-corruption data handling.
This project provides a reusable framework for quickly deploying, configuring, and running a Pi-based MotionEye system with minimal setup. Using the Tampermonkey Chrome extension, MotionEye is dynamically adjusted to enable slideshows and automatic grid scaling to display size. 

---

## Features

- Config-driven automation: Customize the system using `config_template.json`.
- Easy startup: Launch the system with `start_kios.sh`.
- Portable and reusable: Designed to be adapted for multiple deployments.
- Documentation included: PDF guides for end-users and administrators.

---

## Setup Instructions

1. **Clone the repository**:

```bash
git clone https://github.com/yourusername/motioneye-automation.git
cd motioneye-automation/src
```

2. **Prepare configuration**:  
Copy the template and modify as needed:

```bash
cp config_template.json config.json
nano config.json  # Edit values for your setup
```

3. **Make the start script executable**:

```bash
chmod +x start_kios.sh
```

4. **Install the tampermonkey user script**

   Open the tampermonkey extension, and upload the .user.js or (optionally) serve it and automate it for fast distrubtion via your local webserver.


5. **Run the system**:

```bash
./start_kios.sh
```

> Optional: Integrate with systemd for auto-start on boot.

---


