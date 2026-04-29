# UserTesting.com — using this app

This project is a **Vite + React** app. Participants need a **stable, public HTTPS URL** (not `localhost`).

## 1. Deploy a public build

**Recommended:** host the production build.

```bash
npm install
npm run build
```

Upload or connect the `dist/` output to **Vercel**, **Netlify**, **Cloudflare Pages**, or **GitHub Pages**. Use the host’s **HTTPS** URL as the test link.

**Preview locally before deploy:**

```bash
npm run preview
```

**Tunnels (ngrok, Cloudflare Tunnel):** fine for quick internal tries; paid studies usually prefer a normal deploy so the URL stays stable.

## 2. Create the study on UserTesting

1. Sign in at [usertesting.com](https://www.usertesting.com).
2. Create a new test (unmoderated is common for prototype walkthroughs).
3. Set the **starting URL** to your deployed link (include path/hash if a specific screen must load first).
4. Write **tasks** in plain language and what “done” looks like.
5. Set **audience / screener** (device, region, traits).
6. Launch and review recordings when they complete.

## 3. Pre-launch checklist

- **APIs:** any backend must be reachable from the public internet; fix CORS and production env vars on the host.
- **Auth:** if login is required, supply test credentials or a magic link in the scenario per UserTesting security guidance.
- **Mobile:** if the study is mobile, verify the URL on a real phone (layout, viewport).
- **Stable URL:** avoid changing the live build mid-wave unless you intend a new iteration.

## 4. Related project commands

| Command        | Purpose              |
| -------------- | -------------------- |
| `npm run dev`  | Local development    |
| `npm run build`| Production bundle    |
| `npm run preview` | Serve `dist` locally |
