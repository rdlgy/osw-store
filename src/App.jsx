import React, { useState, useEffect, useMemo } from "react";
import { ShoppingBag, X, Plus, Minus, Menu, ArrowRight, Check, Trash2 } from "lucide-react";

const ORBIT_PATH = "M 10,50 C 10,20 90,10 150,25 C 190,35 190,65 150,75 C 90,90 10,80 10,50 Z";

function OrbitArc({ className = "", animate = true, strokeWidth = 2 }) {
  return (
    <svg viewBox="0 0 200 100" className={className} fill="none" preserveAspectRatio="none">
      <path
        d={ORBIT_PATH}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={animate ? "orbit-draw" : ""}
        style={
          animate
            ? { strokeDasharray: 420, strokeDashoffset: 420, animation: "draw 1.6s ease forwards" }
            : {}
        }
      />
      <style>{`@keyframes draw { to { stroke-dashoffset: 0; } }`}</style>
    </svg>
  );
}

const CATEGORIES = ["All", "Hoodies", "Tees", "Bottoms", "Headwear"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const currencySymbol = {
  USD: "$",
  EUR: "€",
  NGN: "₦",
};

function money(amount, currency = "USD") {
  const symbol = currencySymbol[currency] || "$";
  return `${symbol}${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function useCart() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("osw-cart");
      if (saved) setItems(JSON.parse(saved));
    } catch (e) {}
    finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("osw-cart", JSON.stringify(items));
    } catch (e) {}
  }, [items, loaded]);

  function add(product, size, color, qty = 1) {
    setItems((prev) => {
      const key = `${product.id}-${size}-${color || "default"}`;
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          name: product.name,
          price: product.price,
          currency: product.currency || "USD",
          size,
          color: color || null,
          qty,
          image: product.image,
        },
      ];
    });
  }

  function updateQty(key, qty) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, qty) } : i)));
  }

  function remove(key) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function clear() {
    setItems([]);
  }

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  return { items, add, updateQty, remove, clear, subtotal, count };
}

function GarmentPlaceholder({ label }) {
  return (
    <div className="relative w-full aspect-[4/5] bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center">
      <OrbitArc className="w-2/3 h-2/3 text-neutral-700" animate={false} strokeWidth={1.5} />
      <span className="absolute bottom-3 left-3 text-[10px] tracking-widest text-neutral-600 font-mono uppercase">
        {label}
      </span>
    </div>
  );
}

function Header({ cartCount, onCartClick, onNav }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur border-b border-neutral-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 h-14 sm:h-16 flex items-center justify-between">
        <button onClick={() => onNav("home")} className="flex items-center gap-2">
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white uppercase" style={{ fontFamily: "'Oswald', sans-serif" }}>
            OSW
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {["Shop", "Lookbook", "About"].map((label) => (
            <button
              key={label}
              onClick={() => onNav(label.toLowerCase())}
              className="relative text-sm tracking-widest uppercase text-neutral-300 hover:text-white transition-colors group py-2"
            >
              {label}
              <OrbitArc
                animate={false}
                className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-10 h-4 text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={onCartClick} className="relative p-2.5 text-white hover:text-neutral-300 transition-colors">
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-700 text-white text-[10px] font-mono w-4.5 h-4.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button className="md:hidden p-2.5 text-white" onClick={() => setMenuOpen((o) => !o)}>
            <Menu size={22} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-neutral-800 px-4 py-4 flex flex-col gap-1">
          {["Shop", "Lookbook", "About"].map((label) => (
            <button
              key={label}
              onClick={() => {
                onNav(label.toLowerCase());
                setMenuOpen(false);
              }}
              className="text-left text-sm tracking-widest uppercase text-neutral-300 py-3"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function Hero({ onShop }) {
  return (
    <section className="relative bg-black text-white px-4 sm:px-5 pt-16 sm:pt-20 pb-16 sm:pb-24 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative">
        <p className="text-[10px] sm:text-xs tracking-[0.25em] sm:tracking-[0.3em] text-neutral-500 font-mono uppercase mb-5 sm:mb-6">
          Luxury streetwear / est. season one
        </p>
        <h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight uppercase leading-none"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Outside World
        </h1>

        <div className="flex justify-center my-6 sm:my-8 relative">
          <div className="relative w-36 h-20 sm:w-44 sm:h-24 flex items-center justify-center">
            <OrbitArc className="absolute inset-0 w-full h-full text-neutral-500" animate={true} />
            <img
              src="/osw-logo.png"
              alt="OSW Logo"
              className="relative z-10 w-24 sm:w-28 h-auto object-contain"
            />
          </div>
        </div>

        <p className="text-neutral-400 max-w-md mx-auto text-sm leading-relaxed px-2">
          Built for the space between the gym and the street. Heavyweight fabrics, quiet branding, no wasted stitches.
        </p>
        <button
          onClick={onShop}
          className="mt-8 sm:mt-10 inline-flex items-center gap-2 bg-white text-black px-6 sm:px-7 py-3.5 text-sm tracking-widest uppercase font-medium hover:bg-neutral-200 transition-colors"
        >
          Enter the shop <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

function CategoryBar({ active, onChange }) {
  return (
    <div className="border-y border-neutral-800 bg-black sticky top-14 sm:top-16 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 flex gap-5 sm:gap-6 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`whitespace-nowrap py-3.5 text-xs tracking-widest uppercase border-b-2 transition-colors ${
              active === c ? "text-white border-white" : "text-neutral-500 border-transparent hover:text-neutral-300"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product, onOpen }) {
  return (
    <button onClick={() => onOpen(product)} className="text-left group w-full">
      {product.image ? (
        <div className="relative w-full aspect-[4/5] bg-neutral-900 border border-neutral-800 overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
      ) : (
        <GarmentPlaceholder label={product.category} />
      )}
      <div className="mt-2.5 sm:mt-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm text-white group-hover:text-neutral-300 transition-colors truncate">{product.name}</p>
          <p className="text-[11px] text-neutral-500 uppercase tracking-wide font-mono mt-0.5">{product.category}</p>
        </div>
        <p className="text-sm text-neutral-300 font-mono whitespace-nowrap">{money(product.price, product.currency)}</p>
      </div>
    </button>
  );
}

function ShopGrid({ products, activeCategory, onOpen }) {
  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  if (filtered.length === 0) {
    return (
      <section className="max-w-6xl mx-auto px-4 sm:px-5 py-16 sm:py-20 text-center">
        <p className="text-neutral-500 text-sm">No products in this category yet</p>
        <p className="text-neutral-500 text-sm mt-1">Please check back later</p>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-5 py-8 sm:py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 sm:gap-x-5 gap-y-8 sm:gap-y-10">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

function ProductModal({ product, onClose, onAdd }) {
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("");
  const [added, setAdded] = useState(false);

  const colors = product?.colors || [];

  useEffect(() => {
    if (colors.length > 0) {
      setColor(colors[0]);
    } else {
      setColor("");
    }
  }, [product]);

  if (!product) return null;

  function handleAdd() {
    onAdd(product, size, color, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-neutral-950 border border-neutral-800 w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end p-3 sticky top-0 bg-neutral-950 z-10">
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X size={22} />
          </button>
        </div>
        <div className="px-5 sm:px-6 pb-8">
          {product.image ? (
            <div className="w-full aspect-[4/5] bg-neutral-900 overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <GarmentPlaceholder label={product.category} />
          )}
          <h2 className="text-xl text-white mt-5" style={{ fontFamily: "'Oswald', sans-serif" }}>
            {product.name.toUpperCase()}
          </h2>
          <p className="text-neutral-400 text-sm mt-1.5">{product.description || ""}</p>
          <p className="text-white font-mono mt-3 text-lg">{money(product.price, product.currency)}</p>

          {colors.length > 0 && (
            <div className="mt-6">
              <p className="text-xs tracking-widest text-neutral-500 uppercase mb-2.5">Color</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`px-4 py-2 text-xs font-mono border transition-colors min-w-[70px] ${
                      color === c ? "bg-white text-black border-white" : "border-neutral-700 text-neutral-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="text-xs tracking-widest text-neutral-500 uppercase mb-2.5">Size</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`w-12 h-12 text-xs font-mono border transition-colors ${
                    size === s ? "bg-white text-black border-white" : "border-neutral-700 text-neutral-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="mt-8 w-full bg-white text-black py-4 text-sm tracking-widest uppercase font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
          >
            {added ? (
              <>
                <Check size={16} /> Added
              </>
            ) : (
              "Add to cart"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ open, onClose, cart, onCheckout }) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/70 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-full sm:w-96 bg-neutral-950 border-l border-neutral-800 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-neutral-800">
          <p className="text-sm tracking-widest uppercase text-white">Cart ({cart.count})</p>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X size={22} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {cart.items.length === 0 && (
            <p className="text-neutral-500 text-sm">Your cart is empty. Time to fix that.</p>
          )}
          {cart.items.map((item) => (
            <div key={item.key} className="flex gap-3">
              <div className="w-16 h-20 bg-neutral-900 border border-neutral-800 flex-shrink-0 overflow-hidden">
                {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <p className="text-sm text-white truncate">{item.name}</p>
                  <button onClick={() => cart.remove(item.key)} className="text-neutral-500 hover:text-white flex-shrink-0">
                    <X size={16} />
                  </button>
                </div>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  Size {item.size}{item.color ? ` · ${item.color}` : ""}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-neutral-700">
                    <button
                      className="px-3 py-1.5 text-neutral-300 hover:text-white"
                      onClick={() => cart.updateQty(item.key, item.qty - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-2 text-xs font-mono text-white">{item.qty}</span>
                    <button
                      className="px-3 py-1.5 text-neutral-300 hover:text-white"
                      onClick={() => cart.updateQty(item.key, item.qty + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <p className="text-sm text-neutral-300 font-mono">{money(item.price * item.qty, item.currency)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 border-t border-neutral-800">
          <div className="flex justify-between text-sm mb-4">
            <span className="text-neutral-400">Subtotal</span>
            <span className="text-white font-mono">{money(cart.subtotal)}</span>
          </div>
          <button
            disabled={cart.items.length === 0}
            onClick={onCheckout}
            className="w-full bg-white text-black py-4 text-sm tracking-widest uppercase font-medium hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckoutPage({ cart, onBack, onNav }) {
  const [form, setForm] = useState({ email: "", name: "", address: "", city: "", zip: "", country: "" });
  const [placed, setPlaced] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  // === PAYMENT CODE - DO NOT TOUCH ===
  async function submit(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: cart.items,
          customerEmail: form.email,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong with payment");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start payment");
    }
  }
  // === END PAYMENT CODE ===

  if (placed) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-5">
        <Check size={40} className="text-white mb-4" />
        <h2 className="text-2xl text-white uppercase" style={{ fontFamily: "'Oswald', sans-serif" }}>
          Order placed
        </h2>
        <p className="text-neutral-500 text-sm mt-2">Thank you for your order.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-5 py-10 sm:py-12">
      <button onClick={onBack} className="text-xs tracking-widest uppercase text-neutral-500 hover:text-white mb-8">
        ← Back to shop
      </button>
      <div className="grid md:grid-cols-2 gap-10 md:gap-12">
        <form onSubmit={submit} className="space-y-4">
          <h2 className="text-xl text-white uppercase mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>
            Shipping details
          </h2>
          {[
            { key: "email", label: "Email", type: "email" },
            { key: "name", label: "Full name", type: "text" },
            { key: "address", label: "Address", type: "text" },
            { key: "city", label: "City", type: "text" },
            { key: "zip", label: "Postal code", type: "text" },
            { key: "country", label: "Country", type: "text" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs tracking-widest uppercase text-neutral-500 mb-1.5">{f.label}</label>
              <input
                required
                type={f.type}
                value={form[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 px-3 py-3 text-sm text-white focus:outline-none focus:border-white"
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-white text-black py-4 text-sm tracking-widest uppercase font-medium hover:bg-neutral-200 transition-colors mt-4"
          >
            Complete order — {money(cart.subtotal)}
          </button>
        </form>

        <div>
          <h2 className="text-xl text-white uppercase mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>
            Order summary
          </h2>
          <div className="space-y-3 border-b border-neutral-800 pb-4 mb-4">
            {cart.items.map((item) => (
              <div key={item.key} className="flex justify-between text-sm gap-3">
                <span className="text-neutral-300">
                  {item.name} <span className="text-neutral-600">×{item.qty}</span>{" "}
                  <span className="text-neutral-600 font-mono">({item.size}{item.color ? `, ${item.color}` : ""})</span>
                </span>
                <span className="text-neutral-300 font-mono whitespace-nowrap">{money(item.price * item.qty, item.currency)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-neutral-400">
            <span>Subtotal</span>
            <span className="font-mono">{money(cart.subtotal)}</span>
          </div>
          <div className="flex justify-between text-base text-white mt-4 pt-4 border-t border-neutral-800">
            <span>Total</span>
            <span className="font-mono">{money(cart.subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimplePage({ title, children, onBack }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 py-12 sm:py-16">
      <button onClick={onBack} className="text-xs tracking-widest uppercase text-neutral-500 hover:text-white mb-8">
        ← Back
      </button>
      <h1 className="text-2xl sm:text-3xl text-white uppercase mb-6" style={{ fontFamily: "'Oswald', sans-serif" }}>
        {title}
      </h1>
      <div className="text-neutral-400 text-sm leading-relaxed space-y-4">
        {children}
      </div>
    </div>
  );
}

function Footer({ onNav }) {
  return (
    <footer className="border-t border-neutral-800 bg-black mt-12 sm:mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-10 sm:py-12 flex flex-col sm:flex-row justify-between gap-8">
        <div>
          <p className="text-white text-lg font-bold uppercase" style={{ fontFamily: "'Oswald', sans-serif" }}>
            OSW
          </p>
          <p className="text-neutral-500 text-xs mt-2 max-w-xs">Outside World. Luxury streetwear built for movement.</p>
        </div>
        <div className="flex gap-10 text-xs tracking-widest uppercase text-neutral-500">
          <div className="space-y-2">
            <p className="text-neutral-300">Shop</p>
            <button onClick={() => onNav("shop")} className="block hover:text-white transition-colors">Hoodies</button>
            <button onClick={() => onNav("shop")} className="block hover:text-white transition-colors">Tees</button>
            <button onClick={() => onNav("shop")} className="block hover:text-white transition-colors">Bottoms</button>
          </div>
          <div className="space-y-2">
            <p className="text-neutral-300">Info</p>
            <button onClick={() => onNav("shipping")} className="block hover:text-white transition-colors">Shipping</button>
            <button onClick={() => onNav("returns")} className="block hover:text-white transition-colors">Returns</button>
            <button onClick={() => onNav("contact")} className="block hover:text-white transition-colors">Contact</button>
          </div>
        </div>
      </div>
      <div className="border-t border-neutral-900 py-4 text-center text-[11px] text-neutral-700 font-mono">
        © {new Date().getFullYear()} OUTSIDE WORLD
      </div>
    </footer>
  );
}

function AdminPanel({ onClose, onProductAdded, products }) {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Hoodies");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [colors, setColors] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

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
        setIsLoggedIn(true);
        setMessage("");
      } else {
        setMessage("Wrong password");
      }
    } catch {
      setMessage("Login failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !imageFile) {
      setMessage("Name, price and image are required");
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
      const colorList = colors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const productRes = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          name,
          category,
          price: Number(price),
          currency,
          description,
          colors: colorList,
          image: uploadData.url,
        }),
      });
      const productData = await productRes.json();
      if (!productRes.ok) throw new Error(productData.error || "Failed to save");

      setName("");
      setPrice("");
      setDescription("");
      setColors("");
      setImageFile(null);
      setMessage("✅ Product added!");
      onProductAdded();
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
      onProductAdded();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-neutral-950 border border-neutral-800 w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-lg uppercase tracking-widest" style={{ fontFamily: "'Oswald', sans-serif" }}>
            Admin
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X size={22} />
          </button>
        </div>

        {!isLoggedIn ? (
          <div>
            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-700 px-3 py-3 text-sm text-white mb-3 focus:outline-none focus:border-white"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-white text-black py-3 text-sm tracking-widest uppercase font-medium"
            >
              Login
            </button>
            {message && <p className="text-red-500 text-sm mt-3">{message}</p>}
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-3 mb-8">
              <input
                placeholder="Product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 px-3 py-3 text-sm text-white focus:outline-none focus:border-white"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 px-3 py-3 text-sm text-white focus:outline-none focus:border-white"
              >
                {CATEGORIES.filter((c) => c !== "All").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-neutral-700 px-3 py-3 text-sm text-white focus:outline-none focus:border-white"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-24 bg-neutral-900 border border-neutral-700 px-2 py-3 text-sm text-white focus:outline-none focus:border-white"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="NGN">NGN</option>
                </select>
              </div>
              <input
                placeholder="Colors (e.g. Black, White, Olive)"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 px-3 py-3 text-sm text-white focus:outline-none focus:border-white"
              />
              <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-neutral-900 border border-neutral-700 px-3 py-3 text-sm text-white focus:outline-none focus:border-white"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="w-full text-sm text-neutral-400"
              />
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-white text-black py-3 text-sm tracking-widest uppercase font-medium disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Add Product"}
              </button>
              {message && (
                <p className={`text-sm mt-2 ${message.includes("✅") ? "text-green-500" : "text-red-500"}`}>
                  {message}
                </p>
              )}
            </form>

            <div className="border-t border-neutral-800 pt-6">
              <h3 className="text-white text-sm tracking-widest uppercase mb-4">All Products</h3>
              <div className="space-y-3">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 bg-neutral-900 p-3 rounded">
                    {p.image && (
                      <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{p.name}</p>
                      <p className="text-neutral-500 text-xs">
                        {money(p.price, p.currency)} · {p.category}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-500 hover:text-red-400 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="text-neutral-500 text-sm">No products yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function OutsideWorldStore() {
  const [view, setView] = useState("home");
  const [activeCategory, setActiveCategory] = useState("All");
  const [modalProduct, setModalProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const cart = useCart();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") !== null) {
      setShowAdmin(true);
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  function handleNav(dest) {
    setView(dest);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-black">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <Header
        cartCount={cart.count}
        onCartClick={() => setCartOpen(true)}
        onNav={handleNav}
      />

      {view === "home" && (
        <>
          <Hero onShop={() => handleNav("shop")} />
          <CategoryBar active={activeCategory} onChange={setActiveCategory} />
          {loading ? (
            <div className="text-center py-20 text-neutral-500 text-sm">Loading products...</div>
          ) : (
            <ShopGrid products={products} activeCategory={activeCategory} onOpen={setModalProduct} />
          )}
        </>
      )}

      {view === "shop" && (
        <>
          <CategoryBar active={activeCategory} onChange={setActiveCategory} />
          {loading ? (
            <div className="text-center py-20 text-neutral-500 text-sm">Loading products...</div>
          ) : (
            <ShopGrid products={products} activeCategory={activeCategory} onOpen={setModalProduct} />
          )}
        </>
      )}

      {view === "about" && (
        <SimplePage title="About" onBack={() => handleNav("home")}>
          <p>Outside World is a luxury streetwear brand built for the space between the gym and the street.</p>
          <p>We focus on heavyweight fabrics, quiet branding, and no wasted stitches. Every piece is designed to move with you — from early mornings to late nights.</p>
          <p>Established Season One.</p>
        </SimplePage>
      )}

      {view === "shipping" && (
        <SimplePage title="Shipping" onBack={() => handleNav("home")}>
          <p>We currently ship worldwide.</p>
          <p>Orders are processed within 1–3 business days. Delivery times vary by location (usually 5–14 business days).</p>
          <p>You will receive a tracking number once your order ships.</p>
        </SimplePage>
      )}

      {view === "returns" && (
        <SimplePage title="Returns" onBack={() => handleNav("home")}>
          <p>We accept returns within 14 days of delivery for unworn items with original tags attached.</p>
          <p>To start a return, please contact us with your order number.</p>
          <p>Return shipping is the responsibility of the customer unless the item is defective.</p>
        </SimplePage>
      )}

      {view === "contact" && (
        <SimplePage title="Contact" onBack={() => handleNav("home")}>
          <p>For any questions about orders, sizing, or collaborations:</p>
          <p className="text-white">Email: outsideworldosw@gmail.com</p>
          <p>We usually reply within 24–48 hours.</p>
        </SimplePage>
      )}

      {view === "checkout" && (
        <CheckoutPage cart={cart} onBack={() => setView("shop")} onNav={handleNav} />
      )}

      {view !== "checkout" && view !== "about" && view !== "shipping" && view !== "returns" && view !== "contact" && (
        <Footer onNav={handleNav} />
      )}

      <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} onAdd={cart.add} />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onCheckout={() => {
          setCartOpen(false);
          setView("checkout");
        }}
      />

      {showAdmin && (
        <AdminPanel
          onClose={() => {
            setShowAdmin(false);
            const url = new URL(window.location);
            url.searchParams.delete("admin");
            window.history.replaceState({}, "", url);
          }}
          onProductAdded={fetchProducts}
          products={products}
        />
      )}
    </div>
  );
}
