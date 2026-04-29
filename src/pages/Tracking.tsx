import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Truck, Package, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Order } from "../types";

export default function Tracking() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("id");
  const isSuccess = searchParams.get("success") === "true";
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      setLoading(true);
      fetch(`/api/orders/${orderId}`)
        .then(res => res.json())
        .then(data => {
            if (!data.error) setOrder(data);
        })
        .finally(() => setLoading(false));
    }
  }, [orderId]);

  if (!orderId) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Track Your <span className="text-gray-300">Order.</span></h2>
        <form className="max-w-md w-full flex space-x-2" onSubmit={(e) => {
            e.preventDefault();
            const id = (e.target as any).orderId.value;
            window.location.href = `/tracking?id=${id}`;
        }}>
           <input
             name="orderId"
             required
             placeholder="Enter Order ID (e.g., ORD-123456)"
             className="flex-1 bg-white border border-gray-200 rounded-xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-black"
           />
           <button className="bg-black text-white px-6 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition-colors">
              Track
           </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {isSuccess && (
           <motion.div
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-black text-white p-8 rounded-3xl mb-12 text-center"
           >
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Order Confirmed!</h1>
              <p className="text-gray-400 text-sm">Your order {orderId} has been placed successfully.</p>
           </motion.div>
        )}

        {order ? (
          <div className="space-y-8">
             <div className="bg-white p-8 rounded-3xl shadow-sm">
                <div className="flex justify-between items-start mb-12">
                   <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Status</p>
                      <h2 className="text-2xl font-black italic uppercase tracking-tighter">{order.status}</h2>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Estimated Delivery</p>
                      <p className="font-bold">3-5 Business Days</p>
                   </div>
                </div>

                {/* Tracking Stepper */}
                <div className="relative">
                   <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-100" />
                   <div className="relative flex justify-between">
                      {[
                        { icon: Clock, label: "Placed", done: true },
                        { icon: Package, label: "Packed", done: order.status !== "Processing" },
                        { icon: Truck, label: "Shipped", done: order.status === "Shipped" || order.status === "Delivered" },
                        { icon: CheckCircle, label: "Delivered", done: order.status === "Delivered" },
                      ].map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center relative z-10">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step.done ? "bg-black text-white" : "bg-white border-2 border-gray-100 text-gray-300"}`}>
                              <step.icon className="w-5 h-5" />
                           </div>
                           <span className={`text-[10px] font-bold uppercase tracking-widest ${step.done ? "text-black" : "text-gray-300"}`}>{step.label}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm">
                   <h3 className="font-bold uppercase tracking-widest text-sm mb-6 pb-2 border-b">Shipping To</h3>
                   <div className="space-y-2 text-sm">
                      <p className="font-black italic uppercase">{order.customerName}</p>
                      <p className="text-gray-500">{order.address}</p>
                      <p className="text-gray-500 italic">Phone: {order.phone}</p>
                   </div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm">
                   <h3 className="font-bold uppercase tracking-widest text-sm mb-6 pb-2 border-b">Order Summary</h3>
                   <div className="space-y-4">
                      {order.items.map((item, idx) => (
                         <div key={idx} className="flex justify-between text-sm">
                            <span className="font-medium">{item.name} (x{item.quantity})</span>
                            <span className="font-black italic">৳{item.price * item.quantity}</span>
                         </div>
                      ))}
                      <div className="pt-4 border-t flex justify-between font-black italic uppercase text-lg">
                         <span>Total</span>
                         <span>৳{order.total}</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        ) : (
           <div className="text-center py-24">
              {loading ? (
                 <p className="text-gray-400 font-bold uppercase tracking-widest italic animate-pulse">Scanning SoleSphere Grid...</p>
              ) : (
                 <div className="space-y-4">
                    <p className="text-red-500 font-bold uppercase tracking-widest text-xs italic">Order Not Found</p>
                    <p className="text-gray-400 text-sm">The ID provided does not match our records.</p>
                    <Link to="/tracking" className="text-black font-bold uppercase underline underline-offset-8 decoration-2 inline-block">Try Again</Link>
                 </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
}
