<div align="center">
  <img src="https://via.placeholder.com/1280x400/020617/0ea5e9?text=Insert+Scrap+Syndicate+Screenshot+Here" alt="VibeAxis Telemetry Panel" width="100%" />

  <h1>VibeAxis Telemetry</h1>
  <p><strong>The zero-friction, borderless hardware monitor for custom PC builds.</strong></p>

  <img src="https://img.shields.io/badge/Build-Electron%20%7C%20React-blue" alt="Tech Stack" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
  <img src="https://img.shields.io/badge/Status-Beta-orange" alt="Status" />
</div>

<br />

## ⚡ The Bypass: Why We Built This

The PC hardware monitoring ecosystem is broken. If you want a sensor panel on a secondary mini-monitor today, your options are grim:
1. Pay $40 for legacy software (AIDA64) with a UI from 2004 that makes you manually drag windows on every reboot.
2. Spend three days editing `.ini` text files in Rainmeter just to get a CPU temp reading.

You shouldn't have to negotiate with friction just to see how hot your GPU is running. So we bypassed the legacy market and built our own. 

**VibeAxis Telemetry** is a lightweight, hardware-accelerated dashboard that hooks directly into your motherboard's nervous system. No plugins. No 40-page forum tutorials. It just works.

---

## 🚀 Core Features

* **One-Click Panel Lock:** The app automatically scans your GPU outputs, targets your ultra-wide (e.g., 1280x400) mini-display, and securely teleports and locks the dashboard into fullscreen.
* **Dual-Window Architecture:** A fully decoupled Control Panel that communicates with the borderless dashboard via a secure local IPC bridge.
* **Direct Hardware Polling:** Uses `systeminformation` to read kernel-level CPU, GPU, and RAM data. No bloatware required.
* **Zero-Friction Theming:** Swap from Cyber Blue to Stealth Black, or upload your own high-res background images instantly. CSS variables handle the rest.

---

## 🛠️ Architecture & Tech Stack

VibeAxis is built for modern performance, utilizing web technologies to replace clunky legacy C++ applications.

* **Frontend:** React.js, pure CSS/SVG for buttery smooth radial gauge animations.
* **Backend:** Node.js / Electron.
* **Communication Layer:** ContextBridge / IPC (Inter-Process Communication) for secure, decoupled UI updating.
* **Data Layer:** Native OS hardware polling via `systeminformation`.

---

## 💻 Quick Start (Developer Setup)

Want to run it locally or compile your own `.exe`? 

```bash
# 1. Clone the repository
git clone [https://github.com/YourUsername/vibeaxis-telemetry.git](https://github.com/YourUsername/vibeaxis-telemetry.git)

# 2. Enter the directory
cd vibeaxis-telemetry

# 3. Install dependencies
npm install

# 4. Boot the engine (Requires running terminal as Administrator on Windows to read CPU temps!)
npm run dev
