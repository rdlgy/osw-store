import { useState, useEffect } from "react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Clothing");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Admin login
  const handleLogin = async () => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ __check: true }),
      });

      if (res.ok) {
        setIsAdmin(true);
        setMessage("");
      } else {
        setMessage("Wrong password");
      }
    } catch (err) {
      setMessage("Login failed");
    }
  };

  // Upload + Create Product
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !imageFile) {
      setMessage("Please fill name, price and select an image");
      return;
    }

    setUploading(true);
    setMessage("Uploading image...");

    try {
      // 1. Upload image
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "x-admin-password": password,
          "x-filename": imageFile.name,
        },
        body: imageFile,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      // 2. Create product
      setMessage("Saving product...");
      const productRes = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          name,
          category,
          price,
          description,
          image: uploadData.url,
        }),
      });

      const productData = await productRes.json();
      if (!productRes.ok) throw new Error(productData.error || "Failed to save");

      // Reset form
      setName("");
      setPrice("");
      setDescription("");
      setImageFile(null);
      setMessage("✅ Product added successfully!");
      fetchProducts();
    } catch (err) {
      setMessage("❌ " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;

    try {
      await fetch("/api/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ id }),
      });
      fetchProducts();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>OSW Store</h1>
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          style={{
            padding: "8px 16px",
            background: showAdmin ? "#ef4444" : "#111",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          {showAdmin ? "Close Admin" : "Admin"}
        </button>
      </header>

      {/* Admin Panel */}
      {showAdmin && (
        <div style={{ background: "#f8fafc", padding: 24, borderRadius: 12, marginBottom: 40, border: "1px solid #e2e8f0" }}>
          {!isAdmin ? (
            <div>
              <h2 style={{ marginTop: 0 }}>Admin Login</h2>
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: 10, width: "100%", maxWidth: 300, marginBottom: 12, borderRadius: 8, border: "1px solid #cbd5e1" }}
              />
              <br />
              <button onClick={handleLogin} style={{ padding: "10px 20px", background: "#111", color: "white", border: "none", borderRadius: 8 }}>
                Login
              </button>
              {message && <p style={{ color: "red" }}>{message}</p>}
            </div>
          ) : (
            <div>
              <h2 style={{ marginTop: 0 }}>Add New Product</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gap: 12, maxWidth: 500 }}>
                  <input
                    placeholder="Product name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
                  >
                    <option>Clothing</option>
                    <option>Shoes</option>
                    <option>Accessories</option>
                    <option>Others</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                  <button
                    type="submit"
                    disabled={uploading}
                    style={{
                      padding: "12px",
                      background: uploading ? "#94a3b8" : "#16a34a",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                    }}
                  >
                    {uploading ? "Uploading..." : "Add Product"}
                  </button>
                </div>
              </form>
              {message && <p style={{ marginTop: 12 }}>{message}</p>}

              {/* Admin Product List */}
              <h3 style={{ marginTop: 40 }}>All Products (Admin)</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {products.map((p) => (
                  <div key={p.id} style={{ display: "flex", gap: 16, alignItems: "center", background: "white", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    {p.image && <img src={p.image} alt={p.name} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }} />}
                    <div style={{ flex: 1 }}>
                      <strong>{p.name}</strong> — ₦{Number(p.price).toLocaleString()}
                      <div style={{ fontSize: 13, color: "#64748b" }}>{p.category}</div>
                    </div>
                    <button
                      onClick={() => handleDelete(p.id)}
                      style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: 6 }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Storefront */}
      <h2 style={{ marginBottom: 20 }}>Shop</h2>
      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p>No products yet. Add some from the Admin panel.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                overflow: "hidden",
                background: "white",
              }}
            >
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  style={{ width: "100%", height: 220, objectFit: "cover" }}
                />
              ) : (
                <div style={{ height: 220, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  No Image
                </div>
              )}
              <div style={{ padding: 14 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 17 }}>{p.name}</h3>
                <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: 14 }}>{p.category}</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 18 }}>₦{Number(p.price).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
