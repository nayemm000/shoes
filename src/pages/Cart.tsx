import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useApp();

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 150 ? 0 : 25;
  const total = subtotal + shipping;

  return (
    <div className="bg-white min-h-[calc(100vh-70px)]">
      <div className="max-w-7xl mx-auto px-10 py-20 flex flex-col md:flex-row gap-20 border-l border-r border-brand-line">
        <div className="flex-1">
          <header className="mb-16">
             <h1 className="text-8xl font-black italic tracking-tighter leading-none mb-2">The<br/>Bag.</h1>
             <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{cart.length} Items Selected</p>
          </header>

          {cart.length === 0 ? (
            <div className="py-20 border-t border-brand-line">
              <p className="text-xl font-light italic mb-8">Your bag is currently empty.</p>
              <Link to="/shop" className="btn-primary inline-block">Continue Browsing</Link>
            </div>
          ) : (
            <div className="space-y-12">
              {cart.map((item) => (
                <div key={`${item.id}-${item.selectedSize}-${item.selectedVariantId || 'default'}`} className="flex gap-10 py-10 border-t border-brand-line">
                  <div className="w-32 aspect-square bg-gray-50 overflow-hidden rounded">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover grayscale" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-black italic tracking-tight uppercase leading-none">{item.name}</h3>
                        <p className="font-light">৳{item.price}.00</p>
                      </div>
                      <div className="flex gap-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Size: {item.selectedSize}</p>
                        {item.selectedVariantName && (
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-accent">Edition: {item.selectedVariantName}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex items-center border border-brand-line">
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1, item.selectedVariantId)}
                          className="px-4 py-2 hover:bg-gray-50"
                        >-</button>
                        <span className="px-4 py-2 font-mono text-xs">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1, item.selectedVariantId)}
                          className="px-4 py-2 hover:bg-gray-50"
                        >+</button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedVariantId)}
                        className="text-[9px] font-black uppercase tracking-widest text-red-500 border-b border-red-500 pb-0.5"
                      >Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <aside className="md:w-1/3">
            <div className="bg-[#f9f9f9] p-10 border border-brand-line sticky top-32">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-10">Summary.</h2>
              <div className="space-y-6 text-[11px] font-black uppercase tracking-widest text-brand-muted">
                <div className="flex justify-between"><span>Subtotal</span><span className="text-brand-ink">৳{subtotal}.00</span></div>
                <div className="flex justify-between"><span>Logistics</span><span className="text-brand-ink">৳{shipping}.00</span></div>
                <div className="pt-6 border-t border-brand-line flex justify-between text-brand-ink text-base">
                  <span>Payable</span><span>৳{total}.00</span>
                </div>
              </div>
              <Link to="/checkout" className="btn-primary w-full mt-10 text-center py-5 uppercase tracking-widest font-black text-[11px] block">
                Initiate Checkout
              </Link>
              <div className="mt-8 text-[9px] text-brand-muted uppercase tracking-widest leading-relaxed">
                Prices include all federal taxes. Shipping estimated for mainland courier services.
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
