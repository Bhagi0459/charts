---
description: How to deploy the application locally and share it with colleagues on the same network
---

# Deploy and Share Locally

Follow these steps to share your application with colleagues on the same Wi-Fi or Local Area Network (LAN).

## Option 1: Share Development Version (Quickest)

Use this if you are still making changes and want them to see updates in real-time.

1.  Open your terminal in the project directory.
2.  Run the following command:
    ```bash
    npm run dev -- --host
    ```
3.  Look for the **Network** URL in the output. It will look something like:
    ```
    ➜  Local:   http://localhost:5173/
    ➜  Network: http://192.168.1.5:5173/  <-- Share this URL
    ```
4.  Send the `http://192.168.x.x:5173` URL to your colleagues.

## Option 2: Share Production Version (Recommended)

Use this for a faster, more stable version that represents the final app.

1.  Build the application:
    ```bash
    npm run build
    ```
2.  Preview the build with network access:
    ```bash
    npm run preview -- --host
    ```
3.  Look for the **Network** URL in the output (e.g., `http://192.168.1.5:4173/`) and share it.

## Troubleshooting
- **Firewall**: If colleagues cannot connect, ensure your Windows Firewall allows Node.js to accept incoming connections on private networks.
- **Same Network**: Ensure you and your colleagues are connected to the same Wi-Fi or LAN.
