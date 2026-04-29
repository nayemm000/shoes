import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { BarChart3, Users, Package, Banknote, TrendingUp, Search, Eye, Plus, Edit2, Trash2, X, Image as ImageIcon } from "lucide-react";
import { Order, Product } from "../types";
import { motion, AnimatePresence } from "framer-motion";

export default function Admin() {
  const { isAdmin } = useApp();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState({ totalSales: 0, orderCount: 0 });
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: 0,
    discount: 0,
    category: "Running",
    stock: 0,
    description: "",
    images: ["", ""],
    sizes: ["40", "41", "42", "43"],
    variants: [] as ProductVariant[]
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }

    fetchOrders();
    fetchAnalytics();
    fetchProducts();
  }, [isAdmin, navigate]);

  const fetchOrders = () => {
    fetch("/api/admin/orders")
      .then(res => res.json())
      .then(setOrders);
  };

  const fetchAnalytics = () => {
    fetch("/api/admin/analytics")
      .then(res => res.json())
      .then(setAnalytics);
  };

  const fetchProducts = () => {
    fetch("/api/products")
      .then(res => res.json())
      .then(setProducts);
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    fetchOrders();
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      brand: "SoleSphere",
      price: 150,
      discount: 0,
      category: "Running",
      stock: 50,
      description: "",
      images: ["", ""],
      sizes: ["40", "41", "42", "43"],
      variants: []
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      price: product.price,
      discount: product.discount,
      category: product.category,
      stock: product.stock,
      description: product.description,
      images: [...product.images],
      sizes: [...product.sizes],
      variants: product.variants ? [...product.variants] : []
    });
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      fetchProducts();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProduct 
      ? `/api/admin/products/${editingProduct.id}` 
      : "/api/admin/products";
    const method = editingProduct ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    setIsProductModalOpen(false);
    fetchProducts();
  };

  if (!isAdmin) return null;

  return (
    <div className="bg-brand-bg min-h-screen text-brand-ink">
      {/* Admin Info Bar omitted for brevity or kept if preferred, I'll keep it as it's part of your branding */}
      <div className="h-10 bg-brand-ink text-white flex items-center justify-between px-10 text-[10px] font-black uppercase tracking-widest">
         <div className="flex gap-8">
            <span>Admin Center</span>
            <span className="opacity-60">System: <span className="text-green-400">Secure</span></span>
            <span className="opacity-60">Revenue: <span className="text-green-400">৳{analytics.totalSales.toLocaleString()}</span></span>
            <span className="opacity-60">Catalog: <span className="text-green-400">{products.length} Units</span></span>
         </div>
         <div>SoleSphere. v2.6 - Build: Internal_Admin</div>
      </div>

      <div className="max-w-7xl mx-auto px-10 py-16">
        <header className="mb-20 flex justify-between items-end">
           <div>
              <h1 className="text-8xl font-black italic tracking-tighter mb-4 leading-none">Command<br/><span className="text-gray-200">Center.</span></h1>
              <p className="text-[11px] font-black uppercase tracking-widest text-brand-muted">Operational Workspace</p>
           </div>
           <div className="flex gap-4">
              <button onClick={handleOpenAddModal} className="btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" /> Add Product
              </button>
           </div>
        </header>

        {/* Orders Section */}
        <section className="mb-32">
          <div className="p-10 border border-brand-line bg-white">
            <div className="flex justify-between items-end mb-10">
               <h3 className="text-3xl font-black italic uppercase tracking-tighter">Orders.</h3>
               <div className="text-[11px] font-black uppercase tracking-widest text-brand-muted">Recent Transactions</div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-[#f9f9f9] uppercase tracking-widest text-[10px] font-black text-brand-muted border-b border-brand-line">
                     <tr>
                        <th className="px-10 py-6">ID</th>
                        <th className="px-10 py-6">Date</th>
                        <th className="px-10 py-6">Customer</th>
                        <th className="px-10 py-6">Total</th>
                        <th className="px-10 py-6">Status</th>
                        <th className="px-10 py-6">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-line">
                     {orders.map((order) => (
                        <React.Fragment key={order.id}>
                          <tr className="hover:bg-brand-accent/5 transition-colors">
                             <td className="px-10 py-6 font-mono text-xs font-bold">{order.id}</td>
                             <td className="px-10 py-6 text-[10px] font-bold text-brand-muted">
                                {new Date(order.date).toLocaleDateString()}
                             </td>
                             <td className="px-10 py-6 uppercase text-xs font-bold">{order.customerName}</td>
                             <td className="px-10 py-6 font-black italic">৳{order.total}</td>
                             <td className="px-10 py-6">
                                <select
                                   value={order.status}
                                   onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                   className="bg-transparent text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer text-brand-ink"
                                >
                                   <option value="Processing">Processing</option>
                                   <option value="Shipped">Shipped</option>
                                   <option value="Delivered">Delivered</option>
                                   <option value="Cancelled">Cancelled</option>
                                </select>
                             </td>
                             <td className="px-10 py-6">
                                <button onClick={() => navigate(`/tracking?id=${order.id}`)} className="text-[10px] font-black uppercase tracking-widest border-b border-brand-ink pb-1">Inspect</button>
                             </td>
                          </tr>
                          <tr className="bg-[#fcfcfc]">
                            <td colSpan={6} className="px-10 py-4 border-b border-brand-line">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-muted mb-4">Logistics Information</p>
                                  <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase">{order.address}</p>
                                    <p className="text-xs text-brand-muted">{order.phone} // {order.paymentMethod}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-muted mb-4">Manifest (Shoes Requested)</p>
                                  <div className="space-y-4">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="flex justify-between items-center bg-white p-3 border border-brand-line">
                                        <div>
                                          <p className="text-xs font-black uppercase italic">{item.name}</p>
                                          <p className="text-[10px] font-bold uppercase text-brand-muted">Size: {item.selectedSize} // Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-black italic text-sm">৳{item.price * item.quantity}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        </section>

        {/* Product Management Section */}
        <section>
          <div className="p-10 border border-brand-line bg-white">
            <div className="flex justify-between items-end mb-10">
               <h3 className="text-3xl font-black italic uppercase tracking-tighter">Inventory.</h3>
               <div className="text-[11px] font-black uppercase tracking-widest text-brand-muted">Product Catalog</div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-[#f9f9f9] uppercase tracking-widest text-[10px] font-black text-brand-muted border-b border-brand-line">
                     <tr>
                        <th className="px-10 py-6">Product</th>
                        <th className="px-10 py-6">Price</th>
                        <th className="px-10 py-6">Stock</th>
                        <th className="px-10 py-6">Category</th>
                        <th className="px-10 py-6">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-line">
                     {products.map((product) => (
                        <tr key={product.id} className="hover:bg-brand-accent/5 transition-colors">
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-gray-50 flex items-center justify-center overflow-hidden border border-brand-line rounded cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                                    <img src={product.images[0]} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                                 </div>
                                 <div>
                                    <p className="font-bold text-sm uppercase leading-none mb-1">{product.name}</p>
                                    <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest">{product.brand}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-6 font-black italic text-lg">৳{product.price}</td>
                           <td className="px-10 py-6">
                              <span className={`text-xs font-bold ${product.stock < 10 ? 'text-red-500' : 'text-brand-ink'}`}>
                                 {product.stock} units
                              </span>
                           </td>
                           <td className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-brand-muted">{product.category}</td>
                           <td className="px-10 py-6">
                              <div className="flex gap-4">
                                 <button onClick={() => handleOpenEditModal(product)} className="text-brand-muted hover:text-brand-ink transition-colors"><Edit2 className="w-4 h-4" /></button>
                                 <button onClick={() => handleDeleteProduct(product.id)} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        </section>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isProductModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsProductModalOpen(false)}
              className="absolute inset-0 bg-brand-ink/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl border-t-[6px] border-brand-accent h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-10 border-b border-brand-line flex justify-between items-end">
                <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
                  {editingProduct ? "Revise." : "Enlist."}
                </h2>
                <button onClick={() => setIsProductModalOpen(false)}><X className="w-6 h-6" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">Shoe Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-brand-bg border border-brand-line p-4 text-xs font-bold focus:outline-none focus:border-brand-ink transition-colors" 
                        placeholder="e.g. Gravity Glide X"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">Brand</label>
                      <input 
                        required
                        type="text" 
                        value={formData.brand} 
                        onChange={e => setFormData({...formData, brand: e.target.value})}
                        className="w-full bg-brand-bg border border-brand-line p-4 text-xs font-bold focus:outline-none focus:border-brand-ink transition-colors" 
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">Price (৳)</label>
                        <input 
                          required
                          type="number" 
                          value={formData.price} 
                          onChange={e => setFormData({...formData, price: parseInt(e.target.value)})}
                          className="w-full bg-brand-bg border border-brand-line p-4 text-xs font-bold focus:outline-none focus:border-brand-ink transition-colors" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">Discount (%)</label>
                        <input 
                          required
                          type="number" 
                          value={formData.discount} 
                          onChange={e => setFormData({...formData, discount: parseInt(e.target.value)})}
                          className="w-full bg-brand-bg border border-brand-line p-4 text-xs font-bold focus:outline-none focus:border-brand-ink transition-colors" 
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">Stock (Units)</label>
                        <input 
                          required
                          type="number" 
                          value={formData.stock} 
                          onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                          className="w-full bg-brand-bg border border-brand-line p-4 text-xs font-bold focus:outline-none focus:border-brand-ink transition-colors" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                     <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">Category</label>
                        <select 
                          value={formData.category} 
                          onChange={e => setFormData({...formData, category: e.target.value})}
                          className="w-full bg-brand-bg border border-brand-line p-4 text-xs font-bold focus:outline-none focus:border-brand-ink transition-colors appearance-none"
                        >
                           {["Running", "Lifestyle", "Training", "Basketball", "Outdoor"].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-2 block">Description</label>
                      <textarea 
                        required
                        rows={4}
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-brand-bg border border-brand-line p-4 text-xs font-bold focus:outline-none focus:border-brand-ink transition-colors resize-none" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-brand-line">
                  <div className="flex justify-between items-end mb-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block">Visual Assets (Image URLs)</label>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, images: [...formData.images, ""]})}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-brand-bg border border-brand-line px-3 py-1.5 hover:bg-white transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add Image Slot
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {formData.images.map((img, i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-brand-bg border border-brand-line flex items-center justify-center overflow-hidden shrink-0">
                          {img ? (
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-brand-muted opacity-20" />
                          )}
                        </div>
                        <div className="relative flex-1">
                          <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                          <input 
                            type="text" 
                            value={img} 
                            onChange={e => {
                              const newImages = [...formData.images];
                              newImages[i] = e.target.value;
                              setFormData({...formData, images: newImages});
                            }}
                            className="w-full bg-brand-bg border border-brand-line pl-12 pr-4 py-4 text-xs font-bold focus:outline-none focus:border-brand-ink transition-colors" 
                            placeholder="https://..."
                          />
                        </div>
                        {formData.images.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => {
                              const newImages = formData.images.filter((_, idx) => idx !== i);
                               setFormData({...formData, images: newImages});
                            }}
                            className="p-4 text-red-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-10 border-t border-brand-line">
                  <div className="flex justify-between items-end mb-6">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted block">Product Variants (Colors/Materials)</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        const newVariant: ProductVariant = {
                          id: Math.random().toString(36).substr(2, 9),
                          name: "New Variant",
                          stockPerSize: {}
                        };
                        setFormData({...formData, variants: [...formData.variants, newVariant]});
                      }}
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-brand-bg border border-brand-line px-3 py-1.5 hover:bg-white transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add Variant
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {formData.variants.map((variant, vIdx) => (
                      <div key={variant.id} className="p-6 border border-brand-line bg-[#fcfcfc] space-y-6">
                        <div className="flex justify-between items-center bg-white p-4 border-b border-brand-line -mx-6 -mt-6">
                          <input 
                            type="text"
                            value={variant.name}
                            onChange={e => {
                              const newVariants = [...formData.variants];
                              newVariants[vIdx].name = e.target.value;
                              setFormData({...formData, variants: newVariants});
                            }}
                            className="bg-transparent font-black italic uppercase tracking-tighter text-xl focus:outline-none"
                            placeholder="Variant Name (e.g. Arctic White)"
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const newVariants = formData.variants.filter((_, idx) => idx !== vIdx);
                              setFormData({...formData, variants: newVariants});
                            }}
                            className="text-red-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 pt-4">
                          <div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-2 block">Price Override (৳) - Optional</label>
                            <input 
                              type="number"
                              value={variant.priceOverride || ""}
                              onChange={e => {
                                const val = e.target.value ? parseInt(e.target.value) : undefined;
                                const newVariants = [...formData.variants];
                                newVariants[vIdx].priceOverride = val;
                                setFormData({...formData, variants: newVariants});
                              }}
                              className="w-full bg-white border border-brand-line p-3 text-[10px] font-bold focus:outline-none focus:border-brand-ink transition-colors"
                              placeholder="Leave blank for default"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-2 block">Featured Image Index</label>
                            <select 
                              value={variant.imageIndex || 0}
                              onChange={e => {
                                const newVariants = [...formData.variants];
                                newVariants[vIdx].imageIndex = parseInt(e.target.value);
                                setFormData({...formData, variants: newVariants});
                              }}
                              className="w-full bg-white border border-brand-line p-3 text-[10px] font-bold focus:outline-none appearance-none"
                            >
                              {formData.images.map((_, i) => (
                                <option key={i} value={i}>Image {i + 1}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[9px] font-black uppercase tracking-widest text-brand-muted block">Stock per Selected Size</label>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {formData.sizes.map(size => (
                              <div key={size} className="space-y-1">
                                <span className="text-[8px] font-black uppercase text-brand-muted block text-center">Size {size}</span>
                                <input 
                                  type="number"
                                  value={variant.stockPerSize[size] || 0}
                                  onChange={e => {
                                    const newVariants = [...formData.variants];
                                    newVariants[vIdx].stockPerSize = {
                                      ...newVariants[vIdx].stockPerSize,
                                      [size]: parseInt(e.target.value) || 0
                                    };
                                    setFormData({...formData, variants: newVariants});
                                  }}
                                  className="w-full bg-white border border-brand-line p-2 text-[10px] font-bold text-center focus:outline-none focus:border-brand-ink transition-colors"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    {formData.variants.length === 0 && (
                      <div className="py-10 border-2 border-dashed border-brand-line text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">No variants defined. Using global stock/price.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-10 border-t border-brand-line">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-6 block">Available Dimensions (Sizes)</label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 21 }, (_, i) => (i + 30).toString()).map(s => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => {
                          const newSizes = formData.sizes.includes(s) 
                            ? formData.sizes.filter(x => x !== s) 
                            : [...formData.sizes, s];
                          setFormData({...formData, sizes: newSizes});
                        }}
                        className={`px-4 py-2 text-[10px] font-black border transition-all ${formData.sizes.includes(s) ? 'bg-brand-ink text-white border-brand-ink' : 'border-brand-line text-brand-muted hover:border-brand-ink'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              <div className="p-10 border-t border-brand-line bg-[#f9f9f9] flex gap-4">
                <button type="submit" onClick={handleSubmit} className="btn-primary flex-1 py-5 text-[11px] font-black uppercase tracking-widest">
                  {editingProduct ? "Finalize Changes" : "Confirm Entry"}
                </button>
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="btn-secondary px-8 py-5 text-[11px] font-black uppercase tracking-widest">
                  Abort
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
