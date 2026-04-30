import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, User, Search, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { cart, wishlist, user, logout, isAdmin } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${searchQuery}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-brand-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-10">
        <div className="flex justify-between items-center h-[70px]">
          {/* Logo */}
          <Link to="/" className="logo text-2xl tracking-tighter">
            SoleSphere.
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-16">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="w-full h-10 bg-gray-100 rounded-full flex items-center px-5 text-sm text-brand-muted hover:bg-gray-200 transition-colors"
            >
              <Search className="w-4 h-4 mr-3" />
              Search for your next stride...
            </button>
          </div>

          {/* Desktop Nav Icons */}
          <div className="hidden md:flex items-center space-x-10 text-[11px] font-black uppercase tracking-widest">
            <Link to="/shop" className="hover:text-brand-accent transition-colors">Shop</Link>
            <Link to="/wishlist" className="flex items-center">
              WISHLIST 
              {wishlist.length > 0 && <span className="ml-1 text-brand-accent">({wishlist.length})</span>}
            </Link>
            <Link to="/cart" className="flex items-center">
              CART 
              {cart.length > 0 && <span className="ml-1 text-brand-accent">({cart.reduce((acc, item) => acc + item.quantity, 0)})</span>}
            </Link>
            {user ? (
               <div className="flex items-center space-x-8">
                  {isAdmin && <Link to="/admin" className="text-brand-accent">Admin</Link>}
                  <Link to="/profile" className="flex items-center gap-2 hover:text-brand-accent transition-colors">
                    <User className="w-4 h-4" />
                    ACCOUNT
                  </Link>
                  <button onClick={logout} className="text-red-500 hover:text-red-600 transition-colors uppercase">Out</button>
               </div>
            ) : (
               <Link to="/login">Account</Link>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-x-0 bg-white border-b border-gray-100 p-4 shadow-lg"
          >
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex items-center relative">
              <input
                type="text"
                placeholder="Search for your favorite shoes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <button type="submit" className="absolute right-4 text-gray-400">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 md:hidden bg-white flex flex-col"
          >
            <div className="flex justify-between items-center h-[70px] px-4 border-b border-brand-line">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="logo text-2xl tracking-tighter text-brand-ink">
                SoleSphere.
              </Link>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-brand-ink"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-10 space-y-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted mb-6">Navigation</p>
                <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="block text-4xl font-black italic tracking-tighter uppercase leading-none">Catalog.</Link>
                <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="block text-4xl font-black italic tracking-tighter uppercase leading-none flex items-center justify-between">
                  Wishlist. {wishlist.length > 0 && <span className="text-brand-accent text-2xl font-black">({wishlist.length})</span>}
                </Link>
                <Link to="/cart" onClick={() => setIsMenuOpen(false)} className="block text-4xl font-black italic tracking-tighter uppercase leading-none flex items-center justify-between">
                  Bag. {cart.length > 0 && <span className="text-brand-accent text-2xl font-black">({cart.reduce((acc, item) => acc + item.quantity, 0)})</span>}
                </Link>
              </div>

              <div className="pt-10 border-t border-brand-line space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted mb-6">User Context</p>
                {user ? (
                  <div className="space-y-4">
                    <p className="text-sm font-black uppercase tracking-widest text-brand-ink">Identity: {user.displayName || user.email?.split('@')[0]}</p>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block text-4xl font-black italic tracking-tighter uppercase leading-none text-brand-ink">Dashboard.</Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block text-xl font-black italic tracking-tight uppercase text-brand-accent">Admin Center.</Link>
                    )}
                    <button 
                      onClick={() => { logout(); setIsMenuOpen(false); }} 
                      className="w-full text-left text-xl font-black italic tracking-tight uppercase text-red-500 mt-6 pt-6 border-t border-brand-line"
                    >
                      Termination.
                    </button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block text-xl font-black italic tracking-tight uppercase">Account Login.</Link>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-brand-line bg-[#f9f9f9]">
               <div className="text-[9px] font-black uppercase tracking-widest text-brand-muted leading-relaxed">
                  SoleSphere. v2.6 // Spring Summer Series // New York, NY
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
