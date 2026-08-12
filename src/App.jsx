import React, { useState, useEffect, useMemo, useRef } from "react";
import { ShoppingBag, X, Plus, Minus, Menu, ArrowRight, Check } from "lucide-react";

/* ---------------------------------------------------------
   OUTSIDE WORLD (OSW) — storefront
   Signature element: the comet-orbit arc from the OSW logo,
   redrawn as an SVG that self-draws on load and reappears
   as a hover/divider motif throughout the site.
--------------------------------------------------------- */

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

const PRODUCTS = [
  { id: "osw-01", name: "Comet Hoodie", category: "Hoodies", price: 128, blurb: "Heavyweight fleece, dropped shoulder, arc embroidery." },
  { id: "osw-02", name: "Orbit Track Jacket", category: "Outerwear", price: 168, blurb: "Water-repellent shell, ribbed collar, half-zip." },
  { id: "osw-03", name: "Signal Tee", category: "Tees", price: 58, blurb: "Mid-weight cotton, boxy fit, back print." },
  { id: "osw-04", name: "Drift Joggers", category: "Bottoms", price: 108, blurb: "Tapered leg, brushed interior, zip pockets." },
  { id: "osw-05", name: "Nightfall Shorts", category: "Bottoms", price: 78, blurb: "Lightweight mesh, elastic waist, side stripe." },
  { id: "osw-06", name: "Void Long Sleeve", category: "Tees", price: 68, blurb: "Ribbed cuffs, raw hem, minimal branding." },
  { id: "osw-07", name: "Arc Cap", category: "Headwear", price: 42, blurb: "Structured 6-panel, curved brim, debossed logo." },
  { id: "osw-08", name: "Perimeter Windbreaker", category: "Outerwear", price: 148, blurb: "Packable, reflective trim, storm flap." },
];

const CATEGORIES = ["All", "Hoodies", "Tees", "Bottoms", "Outerwear", "Headwear"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function money(n) {
  return `$${n.toFixed(2)}`;
}

/* ---------------------------------------------------------
   Persistent cart (window.storage — falls back to memory
   if storage isn't available in this preview context)
--------------------------------------------------------- */
function useCart() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("osw-cart");
      if (saved) setItems(JSON.parse(saved));
    } catch (e) {
      /* no saved cart yet */
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("osw-cart", JSON.stringify(items));
    } catch (e) {
      /* storage unavailable, cart stays in-memory */
    }
  }, [items, loaded]);

  function add(product, size, qty = 1) {
    setItems((prev) => {
      const key = `${product.id}-${size}`;
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { key, id: product.id, name: product.name, price: product.price, size, qty }];
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

/* --------------------------------------------------------- */

function GarmentPlaceholder({ label }) {
  // Stand-in artwork until real product photography is dropped in.
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
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <button onClick={() => onNav("home")} className="flex items-center gap-2 group">
          <span className="text-xl font-bold tracking-tight text-white uppercase" style={{ fontFamily: "'Oswald', sans-serif" }}>
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

        <div className="flex items-center gap-3">
          <button onClick={onCartClick} className="relative p-2 text-white hover:text-neutral-300 transition-colors">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-700 text-white text-[10px] font-mono w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button className="md:hidden p-2 text-white" onClick={() => setMenuOpen((o) => !o)}>
            <Menu size={20} />
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-800 px-5 py-3 flex flex-col gap-3">
          {["Shop", "Lookbook", "About"].map((label) => (
            <button
              key={label}
              onClick={() => {
                onNav(label.toLowerCase());
                setMenuOpen(false);
              }}
              className="text-left text-sm tracking-widest uppercase text-neutral-300 py-1"
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
    <section className="relative bg-black text-white px-5 pt-20 pb-24 overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative">
        <p className="text-xs tracking-[0.3em] text-neutral-500 font-mono uppercase mb-6">Luxury streetwear / est. season one</p>
        <h1
          className="text-5xl sm:text-7xl font-bold tracking-tight uppercase leading-none"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          Outside World
        </h1>
        <div className="flex justify-center my-6">
          <OrbitArc className="w-40 h-20 text-neutral-500" />
        </div>
        <p className="text-neutral-400 max-w-md mx-auto text-sm leading-relaxed">
          Built for the space between the gym and the street. Heavyweight fabrics, quiet branding, no wasted stitches.
        </p>
        <button
          onClick={onShop}
          className="mt-10 inline-flex items-center gap-2 bg-white text-black px-7 py-3 text-sm tracking-widest uppercase font-medium hover:bg-neutral-200 transition-colors"
        >
          Enter the shop <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

function CategoryBar({ active, onChange }) {
  return (
    <div className="border-y border-neutral-800 bg-black sticky top-16 z-30">
      <div className="max-w-6xl mx-auto px-5 flex gap-6 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`whitespace-nowrap py-3 text-xs tracking-widest uppercase border-b-2 transition-colors ${
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
    <button onClick={() => onOpen(product)} className="text-left group">
      <GarmentPlaceholder label={product.category} />
      <div className="mt-3 flex items-start justify-between">
        <div>
          <p className="text-sm text-white group-hover:text-neutral-300 transition-colors">{product.name}</p>
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-mono mt-0.5">{product.category}</p>
        </div>
        <p className="text-sm text-neutral-300 font-mono">{money(product.price)}</p>
      </div>
    </button>
  );
}

function ShopGrid({ activeCategory, onOpen }) {
  const filtered = activeCategory === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCategory);
  return (
    <section className="max-w-6xl mx-auto px-5 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

function ProductModal({ product, onClose, onAdd }) {
  const [size, setSize] = useState("M");
  const [added, setAdded] = useState(false);
  if (!product) return null;

  function handleAdd() {
    onAdd(product, size, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-neutral-950 border border-neutral-800 w-full sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end p-3">
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 pb-8">
          <GarmentPlaceholder label={product.category} />
          <h2 className="text-xl text-white mt-5" style={{ fontFamily: "'Oswald', sans-serif" }}>
            {product.name.toUpperCase()}
          </h2>
          <p className="text-neutral-400 text-sm mt-1">{product.blurb}</p>
          <p className="text-white font-mono mt-3">{money(product.price)}</p>

          <div className="mt-6">
            <p className="text-xs tracking-widest text-neutral-500 uppercase mb-2">Size</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`w-11 h-11 text-xs font-mono border transition-colors ${
                    size === s ? "bg-white text-black border-white" : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAdd}
            className="mt-7 w-full bg-white text-black py-3 text-sm tracking-widest uppercase font-medium hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
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
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {cart.items.length === 0 && <p className="text-neutral-500 text-sm">Your cart is empty. Time to fix that.</p>}
          {cart.items.map((item) => (
            <div key={item.key} className="flex gap-3">
              <div className="w-16 h-20 bg-neutral-900 border border-neutral-800 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <p className="text-sm text-white">{item.name}</p>
                  <button onClick={() => cart.remove(item.key)} className="text-neutral-500 hover:text-white">
                    <X size={14} />
                  </button>
                </div>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">Size {item.size}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border border-neutral-700">
                    <button
                      className="px-2 py-1 text-neutral-300 hover:text-white"
                      onClick={() => cart.updateQty(item.key, item.qty - 1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-2 text-xs font-mono text-white">{item.qty}</span>
                    <button
                      className="px-2 py-1 text-neutral-300 hover:text-white"
                      onClick={() => cart.updateQty(item.key, item.qty + 1)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="text-sm text-neutral-300 font-mono">{money(item.price * item.qty)}</p>
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
            className="w-full bg-white text-black py-3 text-sm tracking-widest uppercase font-medium hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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

  function submit(e) {
    e.preventDefault();
    /* ------------------------------------------------------------
       STRIPE INTEGRATION POINT
       This is a demo checkout — no real payment is processed here.
       To go live: create a Stripe Checkout Session on your backend
       with cart.items as line items, then redirect the browser to
       the session URL Stripe returns. See the setup notes shared
       alongside this file for exact steps.
    ------------------------------------------------------------ */
    setPlaced(true);
    setTimeout(() => {
      cart.clear();
      onNav("home");
    }, 2500);
  }

  if (placed) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-5">
        <Check size={40} className="text-white mb-4" />
        <h2 className="text-2xl text-white uppercase" style={{ fontFamily: "'Oswald', sans-serif" }}>
          Order placed
        </h2>
        <p className="text-neutral-500 text-sm mt-2">This is a demo confirmation — connect Stripe to process real payments.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <button onClick={onBack} className="text-xs tracking-widest uppercase text-neutral-500 hover:text-white mb-8">
        &larr; Back to shop
      </button>
      <div className="grid md:grid-cols-2 gap-12">
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
              <label className="block text-xs tracking-widest uppercase text-neutral-500 mb-1">{f.label}</label>
              <input
                required
                type={f.type}
                value={form[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-white"
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-white text-black py-3 text-sm tracking-widest uppercase font-medium hover:bg-neutral-200 transition-colors mt-4"
          >
            Complete order &mdash; {money(cart.subtotal)}
          </button>
          <p className="text-[11px] text-neutral-600 text-center pt-2">Demo checkout. No payment is charged.</p>
        </form>

        <div>
          <h2 className="text-xl text-white uppercase mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>
            Order summary
          </h2>
          <div className="space-y-3 border-b border-neutral-800 pb-4 mb-4">
            {cart.items.map((item) => (
              <div key={item.key} className="flex justify-between text-sm">
                <span className="text-neutral-300">
                  {item.name} <span className="text-neutral-600">&times;{item.qty}</span>{" "}
                  <span className="text-neutral-600 font-mono">({item.size})</span>
                </span>
                <span className="text-neutral-300 font-mono">{money(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-neutral-400">
            <span>Subtotal</span>
            <span className="font-mono">{money(cart.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-neutral-400 mt-1">
            <span>Shipping</span>
            <span className="font-mono">Calculated at label purchase</span>
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

function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-black mt-16">
      <div className="max-w-6xl mx-auto px-5 py-12 flex flex-col sm:flex-row justify-between gap-8">
        <div>
          <p className="text-white text-lg font-bold uppercase" style={{ fontFamily: "'Oswald', sans-serif" }}>
            OSW
          </p>
          <p className="text-neutral-500 text-xs mt-2 max-w-xs">Outside World. Luxury streetwear built for movement.</p>
        </div>
        <div className="flex gap-10 text-xs tracking-widest uppercase text-neutral-500">
          <div className="space-y-2">
            <p className="text-neutral-300">Shop</p>
            <p>Hoodies</p>
            <p>Tees</p>
            <p>Outerwear</p>
          </div>
          <div className="space-y-2">
            <p className="text-neutral-300">Info</p>
            <p>Shipping</p>
            <p>Returns</p>
            <p>Contact</p>
          </div>
        </div>
      </div>
      <div className="border-t border-neutral-900 py-4 text-center text-[11px] text-neutral-700 font-mono">
        &copy; {new Date().getFullYear()} OUTSIDE WORLD
      </div>
    </footer>
  );
}

export default function OutsideWorldStore() {
  const [view, setView] = useState("home");
  const [activeCategory, setActiveCategory] = useState("All");
  const [modalProduct, setModalProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const cart = useCart();

  function handleNav(dest) {
    if (dest === "shop") setView("shop");
    else if (dest === "home") setView("home");
    else setView("shop"); // lookbook/about placeholders route to shop for now
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

      <Header cartCount={cart.count} onCartClick={() => setCartOpen(true)} onNav={handleNav} />

      {view === "home" && (
        <>
          <Hero onShop={() => handleNav("shop")} />
          <CategoryBar active={activeCategory} onChange={setActiveCategory} />
          <ShopGrid activeCategory={activeCategory} onOpen={setModalProduct} />
        </>
      )}

      {view === "shop" && (
        <>
          <CategoryBar active={activeCategory} onChange={setActiveCategory} />
          <ShopGrid activeCategory={activeCategory} onOpen={setModalProduct} />
        </>
      )}

      {view === "checkout" && (
        <CheckoutPage cart={cart} onBack={() => setView("shop")} onNav={handleNav} />
      )}

      {view !== "checkout" && <Footer />}

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
    </div>
  );
}
