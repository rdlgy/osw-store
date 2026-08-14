// Handles the product catalog:
// - GET is public (the storefront calls this to display products)
// - POST/DELETE require the admin password (sent as a header from the
//   admin page) and write to Vercel Blob storage — no database needed.

import { put, head } from "@vercel/blob";

const PRODUCTS_KEY = "data/products.json";

async function getProducts() {
  try {
    const info = await head(PRODUCTS_KEY);
    const res = await fetch(info.url, { cache: "no-store" });
    return await res.json();
  } catch (e) {
    return []; // no products saved yet
  }
}

async function saveProducts(products) {
  await put(PRODUCTS_KEY, JSON.stringify(products), {
    access: "public",
    contentType: "application/json",
    allowOverwrite: true,
  });
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const products = await getProducts();
    return res.status(200).json(products);
  }

  // Everything below this line changes the catalog, so it requires the
  // admin password.
  const providedPassword = req.headers["x-admin-password"];
  if (!providedPassword || providedPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Incorrect admin password" });
  }

  if (req.method === "POST") {
    if (req.body && req.body.__check) {
      return res.status(200).json({ ok: true }); // password check only, no product created
    }
    const products = await getProducts();
    const newProduct = {
      id: `osw-${Date.now()}`,
      name: req.body.name,
      category: req.body.category,
      price: Number(req.body.price),
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
