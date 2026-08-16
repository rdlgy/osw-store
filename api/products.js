import { put, head, list } from "@vercel/blob";

const PRODUCTS_KEY = "data/products.json";

async function getProducts() {
  try {
    // First try the fixed file
    const info = await head(PRODUCTS_KEY);
    const res = await fetch(info.url, { cache: "no-store" });
    return await res.json();
  } catch (e) {
    // Fallback: find the most recent products-*.json file
    try {
      const { blobs } = await list({ prefix: "data/products-" });
      if (blobs.length === 0) return [];

      // Sort by newest
      blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
      const res = await fetch(blobs[0].url, { cache: "no-store" });
      return await res.json();
    } catch (err) {
      return [];
    }
  }
}

async function saveProducts(products) {
  await put(PRODUCTS_KEY, JSON.stringify(products, null, 2), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
    addRandomSuffix: false,   // ← This is the important fix
  });
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method === "GET") {
    const products = await getProducts();
    return res.status(200).json(products);
  }

  const providedPassword = req.headers["x-admin-password"];
  if (!providedPassword || providedPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Incorrect admin password" });
  }

  if (req.method === "POST") {
    if (req.body && req.body.__check) {
      return res.status(200).json({ ok: true });
    }

    const products = await getProducts();
    const newProduct = {
      id: `osw-${Date.now()}`,
      name: req.body.name,
      category: req.body.category,
      price: Number(req.body.price),
      currency: req.body.currency || "USD",
      description: req.body.description || "",
      image: req.body.image || null,
      createdAt: new Date().toISOString(),
    };
    products.unshift(newProduct);
    await saveProducts(products);
    return res.status(200).json(newProduct);
  }

  if (req.method === "DELETE") {
    const { id } = req.body;
    const products = await getProducts();
    const filtered = products.filter((p) => p.id !== id);
    await saveProducts(filtered);
    return res.status(200).json({ success: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
