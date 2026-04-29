import { useState, useEffect } from "react";
import { Filter, SlidersHorizontal, ChevronDown, Star } from "lucide-react";
import { Product } from "../types";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 5000]);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        const sortedData = [...data].reverse();
        setProducts(sortedData);
        setFilteredProducts(sortedData);
      });
  }, []);

  useEffect(() => {
    let result = products;

    // Category Filter
    if (activeCategory === "Sale") {
      result = result.filter(p => p.discount > 0);
    } else if (activeCategory !== "All") {
      result = result.filter(p => p.category === activeCategory);
    }

    // Search Filter
    const search = searchParams.get("search");
    if (search) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Price Filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    setFilteredProducts(result);
  }, [products, activeCategory, searchParams, priceRange]);

  return (
    <div className="bg-white min-h-screen">
      {/* Mobile filter toggle */}
      <div className="md:hidden sticky top-[70px] z-40 bg-white border-b border-brand-line p-4 flex justify-between items-center">
         <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{filteredProducts.length} Units Found</p>
         <button 
           onClick={() => setIsFilterOpen(!isFilterOpen)}
           className="text-[10px] font-black uppercase tracking-widest border border-brand-line px-4 py-2 flex items-center gap-2"
         >
           <SlidersHorizontal className="w-3 h-3" />
           {isFilterOpen ? "Collapse Filters" : "Access Filters"}
         </button>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row border-l border-r border-brand-line">
        {/* Responsive Sidebar/Drawer */}
        <AnimatePresence>
          {(isFilterOpen || window.innerWidth >= 768) && (
            <motion.aside 
              initial={window.innerWidth < 768 ? { height: 0, opacity: 0 } : {}}
              animate={window.innerWidth < 768 ? { height: "auto", opacity: 1 } : {}}
              exit={window.innerWidth < 768 ? { height: 0, opacity: 0 } : {}}
              className="w-full md:w-[280px] border-r border-brand-line p-10 space-y-12 overflow-hidden bg-white"
            >
                <header className="hidden md:block mb-12">
                  <h1 className="text-4xl font-black italic tracking-tighter leading-none mb-2">The<br/>Catalog.</h1>
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{filteredProducts.length} Results Found</p>
                </header>

                <section>
                  <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 py-2 border-b border-brand-line">Category</h3>
                  <div className="flex flex-col gap-4">
                    {["All", "Running", "Lifestyle", "Basketball", "Outdoor", "Training", "Sale"].map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          setActiveCategory(cat);
                          if (window.innerWidth < 768) setIsFilterOpen(false);
                        }}
                        className={`text-left text-xs font-black uppercase tracking-widest transition-colors ${activeCategory === cat ? 'text-brand-accent' : 'text-brand-muted hover:text-brand-ink'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                   <h3 className="text-[11px] font-black uppercase tracking-widest mb-6 py-2 border-b border-brand-line">Price Cap</h3>
                   <input
                      type="range"
                      min="100"
                      max="5000"
                      step="50"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([100, parseInt(e.target.value)])}
                      className="w-full h-1 bg-brand-line rounded-lg appearance-none cursor-pointer accent-brand-ink mb-2"
                    />
                    <p className="text-[10px] font-black font-mono uppercase tracking-widest text-brand-muted">Under ৳{priceRange[1]}.00</p>
                </section>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <main className="flex-1 p-10 bg-[#f9f9f9] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 overflow-hidden">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-8 border border-brand-line group relative flex flex-col"
              >
                <Link to={`/product/${product.id}`} className="flex-1">
                  <div className="aspect-square bg-gray-50 mb-8 rounded overflow-hidden">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-black uppercase tracking-tight italic italic-small leading-none flex-1 pr-4">{product.name}</h3>
                    <div className="text-right">
                      <p className="text-sm font-light">৳{product.price}.00</p>
                      {product.discount > 0 && <span className="text-[9px] font-black text-brand-accent uppercase">-{product.discount}%</span>}
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mt-4">{product.category}</p>
                </Link>
              </motion.div>
            ))}
        </main>
      </div>
    </div>
  );
}
