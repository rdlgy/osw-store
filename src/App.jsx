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
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom:
