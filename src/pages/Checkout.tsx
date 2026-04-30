import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { CreditCard, Truck, ShieldCheck, ArrowLeft, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db, auth } from "../lib/firebase"; // Added auth import
import { collection, doc, setDoc } from "firebase/firestore";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function Checkout() {
  const { cart, clearCart } = useApp();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "cod"
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 150 ? 0 : 15;
  const total = subtotal + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderId = `ORD-${Math.floor(Math.random() * 1000000)}`;

      // Sanitize items to ensure no undefined values reach Firestore
      const sanitizedItems = cart.map(item => {
        const sanitized: any = {
          id: item.id,
          name: item.name,
          brand: item.brand,
          price: item.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          images: item.images,
        };
        if (item.selectedVariantId) sanitized.selectedVariantId = item.selectedVariantId;
        if (item.selectedVariantName) sanitized.selectedVariantName = item.selectedVariantName;
        return sanitized;
      });

      const orderData = {
        ...formData,
        items: sanitizedItems,
        total,
        status: "Processing",
        date: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, "orders", orderId), orderData);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `orders/${orderId}`);
      }
      
      setLastOrder({ id: orderId, ...orderData });
      clearCart();
      setShowConfirmation(true);
    } catch (err) {
      console.error("Checkout: Order placement failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Something went wrong.";
      alert(`Order placement failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <AnimatePresence>
        {showConfirmation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-green-500" />
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Confirmed.</h2>
                <p className="text-gray-500 mb-8 max-w-xs uppercase text-[10px] font-bold tracking-widest leading-loose">
                  Your stride starts here. Your order <span className="text-black">#{lastOrder?.id}</span> has been received and is being processed.
                </p>
                
                <div className="w-full bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-brand-muted">
                    <span>Recipient</span>
                    <span className="text-black">{lastOrder?.customerName}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-brand-muted">
                    <span>Total Amount</span>
                    <span className="text-black">৳{lastOrder?.total}</span>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/tracking?id=${lastOrder?.id}`)}
                  className="w-full bg-black text-white h-16 rounded-2xl font-black uppercase italic tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-black/10 active:scale-95"
                >
                  Track My Stride
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-sm font-bold text-gray-400 hover:text-black mb-8 group">
           <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
           <span className="uppercase tracking-widest">Back to Bag</span>
        </button>

        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-12">Final <span className="text-gray-300">Step.</span></h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Form */}
          <div className="lg:col-span-8 space-y-8">
             <section className="bg-white p-8 rounded-3xl shadow-sm">
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center">
                   <Truck className="w-6 h-6 mr-3 text-gray-300" />
                   1. Shipping Details.
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">Full Name *</label>
                      <input
                        required
                        type="text"
                        value={formData.customerName}
                        onChange={e => setFormData({...formData, customerName: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">Email Address *</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="For order updates"
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">Phone Number *</label>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="For delivery coordination"
                      />
                   </div>
                   <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">Detailed Address *</label>
                      <textarea
                        required
                        rows={3}
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="House number, Street name, Area"
                      />
                   </div>
                </div>
             </section>

             <section className="bg-white p-8 rounded-3xl shadow-sm">
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 flex items-center">
                   <CreditCard className="w-6 h-6 mr-3 text-gray-300" />
                   2. Payment Method.
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <label className={`cursor-pointer border-2 rounded-2xl p-6 flex items-center justify-between transition-all ${formData.paymentMethod === 'cod' ? 'border-black bg-black/5' : 'border-gray-50 hover:border-gray-200'}`}>
                      <div className="flex items-center space-x-4">
                         <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Truck className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="font-bold">Cash on Delivery</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Pay at your door</p>
                         </div>
                      </div>
                      <input
                        type="radio"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={() => setFormData({...formData, paymentMethod: 'cod'})}
                        className="w-5 h-5 accent-black"
                      />
                   </label>
                   <label className={`cursor-pointer border-2 rounded-2xl p-6 flex items-center justify-between transition-all ${formData.paymentMethod === 'card' ? 'border-black bg-black/5' : 'border-gray-50 hover:border-gray-200 opacity-50'}`}>
                      <div className="flex items-center space-x-4">
                         <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <CreditCard className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="font-bold">Card Payment</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Unavailable in Preview</p>
                         </div>
                      </div>
                      <input
                        disabled
                        type="radio"
                        checked={formData.paymentMethod === 'card'}
                        className="w-5 h-5"
                      />
                   </label>
                </div>
             </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
             <div className="bg-white p-8 rounded-3xl shadow-lg sticky top-24">
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8 pb-4 border-b">Order Review.</h3>
                <div className="space-y-4 mb-8 max-h-60 overflow-y-auto">
                   {cart.map(item => (
                      <div key={`${item.id}-${item.selectedSize}-${item.selectedVariantId || 'default'}`} className="flex items-center space-x-4">
                         <img src={item.images[0]} className="w-12 h-12 bg-gray-50 rounded-lg object-cover" />
                         <div className="flex-1">
                            <p className="text-sm font-bold truncate">{item.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-tight">
                              Size {item.selectedSize} {item.selectedVariantName && ` // ${item.selectedVariantName}`} x {item.quantity}
                            </p>
                         </div>
                         <p className="text-sm font-black">৳{item.price * item.quantity}</p>
                      </div>
                   ))}
                </div>
                <div className="space-y-4 mb-8 pt-4 border-t border-gray-50">
                   <div className="flex justify-between text-gray-400 text-sm font-bold uppercase tracking-widest">
                      <span>Total to Pay</span>
                      <span className="text-black text-2xl font-black italic">৳{total}</span>
                   </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white h-16 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center space-x-3 hover:bg-gray-800 transition-colors shadow-xl shadow-black/10 disabled:opacity-50"
                >
                   {isSubmitting ? "Processing..." : "Place Order Now"}
                </button>

                <div className="mt-8 flex items-center justify-center space-x-2 text-[10px] uppercase font-bold text-gray-400">
                   <ShieldCheck className="w-4 h-4 text-green-500" />
                   <span>Secure Checkout Guaranteed</span>
                </div>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
}
