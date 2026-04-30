import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, ShoppingBag, Zap, Share2, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "../types";
import { db } from "../lib/firebase";
import { collection, query, limit, getDocs } from "firebase/firestore";

export default function Home() {
  const [trending, setTrending] = useState<Product[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const q = query(collection(db, "products"), limit(10));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        if (data.length > 0) {
          const sorted = [...data].reverse();
          setTrending(sorted.slice(0, 4));
        }
      } catch (err) {
        console.error("Home: Failed to fetch products from Firestore:", err);
      }
    };

    fetchTrending();
  }, []);

  const handleQuickShare = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `${window.location.origin}/product/${product.id}`;
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} at SoleSphere!`,
      url: url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setCopiedId(product.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-white">
      {/* Mobile Category Nav */}
      <div className="md:hidden flex overflow-x-auto border-b border-brand-line scrollbar-hide py-4 px-6 gap-6 bg-white sticky top-[70px] z-40">
         {["Running", "Lifestyle", "Training", "Sale"].map((cat) => (
           <Link 
             key={cat} 
             to={`/shop?category=${cat}`}
             className="whitespace-nowrap text-[10px] font-black tracking-[0.2em] uppercase text-brand-muted hover:text-brand-ink"
           >
             {cat}
           </Link>
         ))}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-70px)]">
        {/* Category Sidebar */}
        <aside className="hidden md:flex w-[60px] border-r border-brand-line flex-col items-center pt-10 gap-10">
           {["Running", "Lifestyle", "Training", "Sale"].map((cat, i) => (
             <Link 
               key={cat} 
               to={`/shop?category=${cat}`}
               className={`[writing-mode:vertical-rl] rotate-180 text-[11px] font-black tracking-[0.2em] uppercase transition-colors ${i === 0 ? 'text-brand-ink border-r-2 border-brand-accent' : 'text-brand-muted hover:text-brand-ink'}`}
             >
               {cat}
             </Link>
           ))}
        </aside>

        {/* Hero Section */}
        <section className="flex-1 border-r border-brand-line p-10 flex flex-col justify-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-[12px] font-black uppercase tracking-[0.2em] text-brand-accent mb-4 block">New Arrival / Spring 26</span>
              <h1 className="text-[14vw] md:text-[8rem] lg:text-[10rem] font-black leading-[0.85] tracking-[-0.05em] uppercase mb-8">
                Stride<br/><span className="text-gray-200">X-1 Pro</span>
              </h1>
              <p className="text-2xl font-light mb-10">৳4999.00</p>
              
              <div className="flex gap-4">
                <Link to="/shop" className="btn-primary">Add to Bag</Link>
                <Link to="/shop" className="btn-secondary">Details</Link>
              </div>

              <div className="mt-16 max-w-sm text-xs leading-relaxed text-brand-muted uppercase tracking-wider">
                Engineered with proprietary carbon-fiber plate technology and AI-optimized size suggestions for the elite runner.
              </div>
            </motion.div>
        </section>

        {/* Featured Grid */}
        <section className="bg-[#f9f9f9] p-8 md:w-[40%] grid grid-cols-1 sm:grid-cols-2 gap-6 items-start content-start">
           <div className="md:col-span-2 mb-4">
              <h2 className="text-xs font-black tracking-widest text-brand-muted uppercase">Trending Now</h2>
           </div>
           {trending.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -5 }}
                className="bg-white p-6 border border-brand-line relative group"
              >
                <div className="absolute top-4 right-4 flex gap-2 z-10 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={(e) => handleQuickShare(e, product)}
                    className="w-8 h-8 bg-white border border-brand-line rounded-full flex items-center justify-center hover:bg-brand-ink hover:text-white transition-colors shadow-sm text-brand-ink"
                    title="Share Link"
                  >
                    {copiedId === product.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Share2 className="w-3.5 h-3.5" />}
                  </button>
                  {product.id === "1" && <div className="bg-brand-accent text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase flex items-center">AI Fit</div>}
                </div>
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square bg-gray-50 mb-4 overflow-hidden rounded">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  </div>
                  <h3 className="text-xs font-bold uppercase mb-1">{product.name}</h3>
                  <p className="text-xs text-brand-muted">৳{product.price}.00</p>
                </Link>
              </motion.div>
           ))}
        </section>
      </div>
    </div>
  );
}
