// Handles product photo uploads. Requires the admin password.
// The uploaded file is sent as the raw request body from the admin page.

import { put } from "@vercel/blob";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const providedPassword = req.headers["x-admin-password"];
  if (!providedPassword || providedPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Incorrect admin password" });
  }

  try {
    const filename = req.headers["x-filename"] || `photo-${Date.now()}.jpg`;
    const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, "-");

    const blob = await put(`products/${Date.now()}-${safeName}`, req, {
      access: "public",
    });

    res.status(200).json({ url: blob.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
}
