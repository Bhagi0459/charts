---
description: How to deploy the application to the public internet using Netlify or Vercel
---

# Deploy to Public Internet

To allow colleagues to access your app from anywhere (not just the same Wi-Fi), you need to deploy it to a cloud provider.

## Option 1: Netlify Drop (Easiest, No Accounts Required sometimes)

This is the fastest method to get a live URL.

1.  **Build your project** (We have already done this):
    ```powershell
    npm run build
    ```
2.  Open **File Explorer** and navigate to your project folder:
    `d:\MBS\Projects\React\charts-demo\`
3.  Locate the `dist` folder.
4.  Open your web browser to **[https://app.netlify.com/drop](https://app.netlify.com/drop)**.
5.  **Drag and drop** the `dist` folder onto the page.
6.  Netlify will upload it and give you a live URL (e.g., `https://random-name-1234.netlify.app`).
7.  Share that URL!

## Option 2: Vercel CLI (Professional)

Use this if you want a more permanent setup.

1.  Run the Vercel deployment command:
    ```powershell
    npx vercel
    ```
2.  Follow the prompts:
    - Install Vercel CLI? **y**
    - Log in? (It will open your browser).
    - Set up and deploy? **y**
    - Which scope? (Select your user).
    - Link to existing project? **No**.
    - Project name? (Press Enter for default).
    - Directory? (Press Enter for `./`).
    - Want to override settings? **No**.
3.  Wait for deployment to finish. It will give you a `Production` URL.
