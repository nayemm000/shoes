import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate, Link } from "react-router-dom";
import { Package, LogOut, ChevronRight, Settings, Heart, ShoppingBag, Share2, Check } from "lucide-react";
import { Order, Product } from "../types";
import { motion } from "framer-motion";

export default function Profile() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // In a real app, we'd fetch only the user's orders
    fetch("/api/admin/orders")
      .then(res => res.json())
      .then(data => setOrders(data.slice(0, 5)));

    fetch("/api/products")
      .then(res => res.json())
      .then(data => setTrending(data.slice(0, 3)));
  }, [user, navigate]);

  const handleQuickShare = async (id: string, name: string) => {
    const url = `${window.location.origin}/product/${id}`;
    const shareData = {
      title: name,
      text: `Check out ${name} at SoleSphere!`,
      url: url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white min-h-[calc(100vh-70px)]">
      <div className="max-w-7xl mx-auto border-l border-r border-brand-line flex flex-col md:flex-row">
        
        {/* Profile Sidebar */}
        <aside className="w-full md:w-[320px] border-r border-brand-line p-10 space-y-12 bg-[#f9f9f9]">
           <header>
              <div className="w-20 h-20 bg-brand-ink rounded-full mb-6 flex items-center justify-center text-white text-3xl font-black italic tracking-tighter">
                {(user.displayName || user.email || "?").charAt(0).toUpperCase()}
              </div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-2">
                {user.displayName || user.email?.split("@")[0] || "User"}.
              </h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Member since Spring 26</p>
           </header>

           <nav className="space-y-6">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-muted">Account Controls</p>
              <Link to="/wishlist" className="flex items-center justify-between text-xs font-black uppercase tracking-widest hover:text-brand-accent transition-colors">
                <span className="flex items-center gap-3"><Heart className="w-4 h-4" /> Wishlist</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link to="/cart" className="flex items-center justify-between text-xs font-black uppercase tracking-widest hover:text-brand-accent transition-colors">
                <span className="flex items-center gap-3"><ShoppingBag className="w-4 h-4" /> Your Bag</span>
                <ChevronRight className="w-4 h-4" />
              </Link>

              <div className="pt-6 border-t border-brand-line space-y-4">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-muted">Publicity (Sharing)</p>
                <div className="space-y-4">
                  {trending.map(p => (
                    <div key={p.id} className="flex items-center justify-between group">
                      <span className="text-[10px] font-bold truncate pr-2 uppercase italic tracking-tighter">{p.name}</span>
                      <button 
                        onClick={() => handleQuickShare(p.id, p.name)}
                        className="p-2 border border-brand-line rounded flex items-center justify-center hover:bg-brand-ink hover:text-white transition-colors"
                      >
                        {copiedId === p.id ? <Check className="w-3 h-3 text-green-500" /> : <Share2 className="w-3 h-3" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full flex items-center justify-between text-xs font-black uppercase tracking-widest opacity-40 cursor-not-allowed">
                <span className="flex items-center gap-3"><Settings className="w-4 h-4" /> Settings</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => { logout(); navigate("/"); }}
                className="w-full flex items-center justify-between text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors pt-6 border-t border-brand-line"
              >
                <span className="flex items-center gap-3"><LogOut className="w-4 h-4" /> Termination</span>
                <ChevronRight className="w-4 h-4" />
              </button>
           </nav>
        </aside>

        {/* Orders Feed */}
        <main className="flex-1 p-10 md:p-20">
           <div className="flex justify-between items-end mb-16">
              <h2 className="text-6xl font-black italic tracking-tighter uppercase leading-none">History.</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Recent Dispatches</p>
           </div>

           {orders.length === 0 ? (
             <div className="py-20 border-t border-brand-line">
                <p className="text-sm font-black uppercase tracking-widest text-brand-muted italic">No movement detected in your archive.</p>
             </div>
           ) : (
             <div className="space-y-1">
                {orders.map((order) => (
                  <motion.div 
                    key={order.id}
                    whileHover={{ x: 10 }}
                    onClick={() => navigate(`/tracking?id=${order.id}`)}
                    className="flex flex-col md:flex-row justify-between md:items-center p-8 border border-brand-line hover:border-brand-ink cursor-pointer bg-white transition-all gap-6"
                  >
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2">Order ID: {order.id}</p>
                       <p className="text-xl font-black italic tracking-tight uppercase">{new Date(order.date).toLocaleDateString()} // ৳{order.total}</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 border ${order.status === 'Processing' ? 'text-orange-500 border-orange-100 bg-orange-50/50' : 'text-green-500 border-green-100 bg-green-50/50'}`}>
                          {order.status}
                       </span>
                       <ChevronRight className="w-5 h-5 text-brand-muted" />
                    </div>
                  </motion.div>
                ))}
             </div>
           )}
        </main>
      </div>
    </div>
  );
}
