import { useState, useEffect } from "react";

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Clothing");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const currencySymbol = {
    USD: "$",
    EUR: "€",
    NGN: "₦",
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !imageFile) {
      setMessage("Please fill name, price and select an image");
      return;
    }

    setUploading(true);
    setMessage("Uploading image...");

    try {
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
          currency,
          description,
          image: uploadData.url,
        }),
      });

      const productData = await productRes.json();
      if (!productRes.ok) throw new Error(productData.error || "Failed to save");

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

  const formatPrice = (product) => {
    const symbol = currencySymbol[product.currency] || "$";
    return `${symbol}${Number(product.price).toLocaleString()}`;
  };

  return (
    <div style={{ 
      fontFamily: "system-ui, sans-serif", 
      maxWidth: 1100, 
      margin: "0 auto", 
      padding: 16,
      color: "#f1f5f9",
      minHeight: "100vh"
    }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, color: "#ffffff" }}>Outside World</h1>
        <button
          onClick={() => setShowAdmin(!showAdmin)}
          style={{
            padding: "8px 16px",
            background: showAdmin ? "#ef4444" : "#334155",
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
        <div style={{ 
          background: "#1e293b", 
          padding: 24, 
          borderRadius: 12, 
          marginBottom: 40, 
          border: "1px solid #334155" 
        }}>
          {!isAdmin ? (
            <div>
              <h2 style={{ marginTop: 0, color: "#f8fafc" }}>Admin Login</h2>
              <input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ 
                  padding: 12, 
                  width: "100%", 
                  maxWidth: 320, 
                  marginBottom: 12, 
                  borderRadius: 8, 
                  border: "1px solid #475569",
                  background: "#0f172a",
                  color: "white"
                }}
              />
              <br />
              <button 
                onClick={handleLogin} 
                style={{ 
                  padding: "10px 20px", 
                  background: "#3b82f6", 
                  color: "white", 
                  border: "none", 
                  borderRadius: 8,
                  fontWeight: 600
                }}
              >
                Login
              </button>
              {message && <p style={{ color: "#f87171", marginTop: 12 }}>{message}</p>}
            </div>
          ) : (
            <div>
              <h2 style={{ marginTop: 0, color: "#f8fafc" }}>Add New Product</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gap: 14, maxWidth: 480 }}>
                  <input
                    placeholder="Product name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ 
                      padding: 12, 
                      borderRadius: 8, 
                      border: "1px solid #475569",
                      background: "#0f172a",
                      color: "white"
                    }}
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ 
                      padding: 12, 
                      borderRadius: 8, 
                      border: "1px solid #475569",
                      background: "#0f172a",
                      color: "white"
                    }}
                  >
                    <option>Clothing</option>
                    <option>Shoes</option>
                    <option>Accessories</option>
                    <option>Others</option>
                  </select>

                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      type="number"
                      placeholder="Price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      style={{ 
                        padding: 12, 
                        borderRadius: 8, 
                        border: "1px solid #475569",
                        background: "#0f172a",
                        color: "white",
                        flex: 1
                      }}
                    />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      style={{ 
                        padding: 12, 
                        borderRadius: 8, 
                        border: "1px solid #475569",
                        background: "#0f172a",
                        color: "white",
                        width: 110
                      }}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="NGN">NGN (₦)</option>
                    </select>
                  </div>

                  <textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    style={{ 
                      padding: 12, 
                      borderRadius: 8, 
                      border: "1px solid #475569",
                      background: "#0f172a",
                      color: "white"
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    style={{ color: "#94a3b8" }}
                  />
                  <button
                    type="submit"
                    disabled={uploading}
                    style={{
                      padding: "14px",
                      background: uploading ? "#475569" : "#22c55e",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 16
                    }}
                  >
                    {uploading ? "Uploading..." : "Add Product"}
                  </button>
                </div>
              </form>
              {message && (
                <p style={{ 
                  marginTop: 14, 
                  color: message.includes("✅") ? "#4ade80" : "#f87171" 
                }}>
                  {message}
                </p>
              )}

              <h3 style={{ marginTop: 40, color: "#f8fafc" }}>All Products</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {products.map((p) => (
                  <div key={p.id} style={{ 
                    display: "flex", 
                    gap: 16, 
                    alignItems: "center", 
                    background: "#0f172a", 
                    padding: 12, 
                    borderRadius: 8, 
                    border: "1px solid #334155" 
                  }}>
                    {p.image && (
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }} 
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <strong style={{ color: "#f1f5f9" }}>{p.name}</strong>
                      <div style={{ color: "#94a3b8", fontSize: 14 }}>
                        {formatPrice(p)} · {p.category}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(p.id)}
                      style={{ 
                        background: "#ef4444", 
                        color: "white", 
                        border: "none", 
                        padding: "7px 14px", 
                        borderRadius: 6,
                        fontSize: 14
                      }}
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
      <h2 style={{ marginBottom: 20, color: "#f8fafc" }}>Shop</h2>
      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading products...</p>
      ) : products.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>No products yet. Add some from Admin.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 20,
          }}
        >
          {products.map((p) => (
            <div
              key={p.id}
              style={{
                border: "1px solid #334155",
                borderRadius: 12,
                overflow: "hidden",
                background: "#1e293b",
              }}
            >
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  style={{ width: "100%", height: 220, objectFit: "cover" }}
                />
              ) : (
                <div style={{ 
                  height: 220, 
                  background: "#0f172a", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  color: "#64748b"
                }}>
                  No Image
                </div>
              )}
              <div style={{ padding: 14 }}>
                <h3 style={{ margin: "0 0 6px", fontSize: 16, color: "#f1f5f9" }}>{p.name}</h3>
                <p style={{ margin: "0 0 8px", color: "#94a3b8", fontSize: 13 }}>{p.category}</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 17, color: "#4ade80" }}>
                  {formatPrice(p)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
