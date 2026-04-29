import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ShoppingBag, Zap, Heart, Sparkles, Loader2, Truck, RefreshCw, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "../types";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenAI } from "@google/genai";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showAIAdvisor, setShowAIAdvisor] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        const found = data.find((p: Product) => p.id === id);
        if (found) {
          // Filter out empty image strings
          const cleanedProduct = {
            ...found,
            images: (found.images || []).filter((img: string) => img.trim() !== "")
          };
          if (cleanedProduct.images.length === 0) {
            cleanedProduct.images = ["https://images.unsplash.com/photo-1542291026-7eec264c27ff"]; // Fallback
          }
          setProduct(cleanedProduct);
          
          if (cleanedProduct.variants && cleanedProduct.variants.length > 0) {
            setSelectedVariantId(cleanedProduct.variants[0].id);
          }
        } else {
          navigate("/shop");
        }
      });
  }, [id, navigate]);

  const selectedVariant = product?.variants?.find(v => v.id === selectedVariantId) || null;
  const currentPrice = selectedVariant?.priceOverride !== undefined ? selectedVariant.priceOverride : (product?.price || 0);

  useEffect(() => {
    if (selectedVariant && selectedVariant.imageIndex !== undefined && product?.images[selectedVariant.imageIndex]) {
      setSelectedImage(selectedVariant.imageIndex);
    }
  }, [selectedVariantId, product]);

  const getVariantStock = (size: string) => {
    if (!selectedVariant) return product?.stock || 0;
    return selectedVariant.stockPerSize[size] || 0;
  };

  const getAIAdvice = async () => {
    if (!product) return;
    setLoadingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a professional luxury sneaker stylist. The product is "${product.name}" by "${product.brand}". Description: "${product.description}". Category: ${product.category}. 
        Give one punchy, expert style tip (max 25 words) starting with "STYLE TIP:". Focus on what to wear these with for a bold look.`
      });
      
      setAiAdvice(response.text || "");
    } catch (err) {
      console.error(err);
      setAiAdvice("STYLE TIP: Pair these architectural silhouettes with cropped tech-fabric trousers and a boxy minimalist tee for a high-performance urban ensemble.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size first.");
      return;
    }
    if (product) {
      addToCart(
        product, 
        selectedSize, 
        selectedVariantId || undefined, 
        selectedVariant?.name, 
        selectedVariant?.priceOverride
      );
    }
  };

  if (!product) return null;

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-[calc(100vh-70px)] border-l border-r border-brand-line">
        {/* Left: Image Gallery */}
        <div className="md:w-1/2 border-r border-brand-line">
          <div className="sticky top-[70px]">
            <div className="aspect-square bg-gray-50 border-b border-brand-line overflow-hidden relative group">
               <motion.img
                 key={selectedImage}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 src={product.images[selectedImage]}
                 alt={product.name}
                 className="w-full h-full object-cover grayscale active:grayscale-0 transition-all duration-500"
               />
               
               {/* Carousel Navigation */}
               {product.images.length > 1 && (
                 <>
                   <button 
                     onClick={() => setSelectedImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1))}
                     className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-md border border-brand-line rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <ChevronLeft className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => setSelectedImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1))}
                     className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-md border border-brand-line rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <ChevronRight className="w-4 h-4" />
                   </button>
                   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {product.images.map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-1 rounded-full transition-all ${selectedImage === i ? 'w-6 bg-brand-ink' : 'w-1.5 bg-brand-line'}`}
                        />
                      ))}
                   </div>
                 </>
               )}
            </div>
            <div className="grid grid-cols-4 gap-1 bg-brand-line">
               {product.images.map((img, idx) => (
                 <button
                   key={idx}
                   onClick={() => setSelectedImage(idx)}
                   className={`aspect-square bg-white relative group overflow-hidden ${selectedImage === idx ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}
                 >
                   <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                 </button>
               ))}
            </div>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="md:w-1/2 p-10 flex flex-col justify-center">
            <header className="mb-12">
               <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">{product.brand} // {product.category}</span>
                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    className="p-2 border border-brand-line rounded-full hover:bg-gray-50"
                  >
                    <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-brand-ink' : ''}`} />
                  </button>
               </div>
               <h1 className="text-7xl font-black italic tracking-tighter leading-none mb-6">{product.name}.</h1>
               <div className="flex items-center gap-6">
                  <p className="text-3xl font-light">৳{currentPrice}.00</p>
                  {product.discount > 0 && <span className="bg-brand-accent text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">-{product.discount}% OFF</span>}
               </div>
            </header>

            <div className="space-y-12">
               {/* Variant Selection */}
               {product.variants && product.variants.length > 0 && (
                 <div>
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-brand-muted mb-6">Select Edition</h3>
                    <div className="flex flex-wrap gap-3">
                       {product.variants.map(variant => (
                          <button
                            key={variant.id}
                            onClick={() => {
                              setSelectedVariantId(variant.id);
                              // Reset size when changing variant if current size not in stock for new variant
                              if (selectedSize && (variant.stockPerSize[selectedSize] || 0) === 0) {
                                setSelectedSize("");
                              }
                            }}
                            className={`px-6 py-4 border text-[11px] font-black uppercase tracking-widest transition-all ${selectedVariantId === variant.id ? 'bg-brand-ink text-white border-brand-ink shadow-lg scale-105' : 'border-brand-line hover:border-brand-ink text-brand-muted hover:text-brand-ink'}`}
                          >
                             {variant.name}
                          </button>
                       ))}
                    </div>
                 </div>
               )}

               {/* Size Selection */}
               <div>
                  <div className="flex justify-between items-end mb-6">
                     <h3 className="text-[11px] font-black uppercase tracking-widest text-brand-muted">Select Size / EU</h3>
                     <button onClick={() => setIsSizeGuideOpen(true)} className="text-[10px] font-black uppercase tracking-widest border-b border-brand-ink pb-0.5">Size Guide</button>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                     {product.sizes.map(size => {
                        const stock = getVariantStock(size);
                        const isOutOfStock = stock <= 0;
                        return (
                          <button
                            key={size}
                            disabled={isOutOfStock}
                            onClick={() => setSelectedSize(size)}
                            className={`h-12 border text-sm font-black transition-all relative ${
                              selectedSize === size 
                                ? 'bg-brand-ink text-white border-brand-ink' 
                                : isOutOfStock 
                                  ? 'border-gray-100 text-gray-200 cursor-not-allowed bg-gray-50' 
                                  : 'border-brand-line hover:border-brand-ink text-brand-muted hover:text-brand-ink'
                            }`}
                          >
                             {size}
                             {isOutOfStock && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-[1px] bg-gray-200 rotate-45" /></div>}
                          </button>
                        );
                     })}
                  </div>
                  {selectedSize && (
                    <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-brand-accent">
                      {getVariantStock(selectedSize)} Units Remaining in this config.
                    </p>
                  )}
               </div>

               {/* Actions */}
               <div className="flex flex-col gap-4">
                  <button onClick={handleAddToCart} className="btn-primary w-full py-6 text-sm tracking-[0.2em] font-black uppercase">
                     Add to Bag
                  </button>
                  <button onClick={() => { handleAddToCart(); navigate('/cart'); }} className="btn-secondary w-full py-6 text-sm tracking-[0.2em] font-black uppercase">
                     Buy it Now
                  </button>
               </div>

               {/* AI Style Advisor Toggle */}
               <div className="p-8 border border-brand-line bg-[#f9f9f9]">
                  <div className="flex items-center justify-between mb-6">
                     <div>
                        <h4 className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">AI Style Advisor</h4>
                        <p className="text-[10px] text-brand-muted uppercase tracking-widest">Powered by Gemini Flash</p>
                     </div>
                     <button 
                        onClick={() => setShowAIAdvisor(!showAIAdvisor)}
                        className={`p-2 rounded-full transition-colors ${showAIAdvisor ? 'bg-brand-accent text-white' : 'bg-white border border-brand-line text-brand-ink hover:bg-gray-100'}`}
                     >
                        <Sparkles className="w-4 h-4" />
                     </button>
                  </div>

                  <AnimatePresence>
                    {showAIAdvisor && (
                       <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden"
                       >
                          {!aiAdvice ? (
                             <button
                               onClick={getAIAdvice}
                               disabled={loadingAI}
                               className="w-full py-3 bg-white border border-brand-line text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 flex items-center justify-center gap-2"
                             >
                                {loadingAI ? "Processing Data..." : "Generate Pro Advice"}
                             </button>
                          ) : (
                             <div className="text-[11px] leading-relaxed text-brand-muted space-y-4">
                                <p className="font-bold italic text-brand-ink">{aiAdvice}</p>
                                <button onClick={() => setAiAdvice(null)} className="text-[9px] font-black uppercase tracking-widest border-b border-brand-line pb-0.5">Reset Assistant</button>
                             </div>
                          )}
                       </motion.div>
                    )}
                  </AnimatePresence>
               </div>

               {/* Description */}
               <div className="pt-10 border-t border-brand-line">
                  <h4 className="text-[11px] font-black uppercase tracking-widest mb-4">Original Blueprint.</h4>
                  <p className="text-xs leading-relaxed text-brand-muted uppercase tracking-wider">{product.description}</p>
               </div>
            </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <AnimatePresence>
         {isSizeGuideOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
               <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="absolute inset-0 bg-brand-ink/80 backdrop-blur-sm"
               />
               <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 50, opacity: 0 }}
                  className="relative bg-white p-10 max-w-sm w-full border-t-[6px] border-brand-accent"
               >
                  <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-6 text-brand-ink">Guide.</h2>
                  <div className="space-y-4 text-xs font-black uppercase tracking-widest text-brand-muted">
                     <div className="flex justify-between py-2 border-b border-brand-line"><span>US Men</span><span>EU</span><span>CM</span></div>
                     <div className="flex justify-between py-2 border-b border-brand-line"><span>8.0</span><span>41</span><span>26.0</span></div>
                     <div className="flex justify-between py-2 border-b border-brand-line"><span>9.0</span><span>42</span><span>27.0</span></div>
                     <div className="flex justify-between py-2 border-b border-brand-line"><span>10.0</span><span>43</span><span>28.0</span></div>
                     <div className="flex justify-between py-2"><span>11.0</span><span>44</span><span>29.0</span></div>
                  </div>
                  <button onClick={() => setIsSizeGuideOpen(false)} className="mt-10 w-full py-4 bg-brand-ink text-white text-[10px] font-black uppercase tracking-widest">Close Guide</button>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
