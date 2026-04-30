import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, CartItem, Order } from "../types";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";

interface AppContextType {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (product: Product, size: string, variantId?: string, variantName?: string, priceOverride?: number) => void;
  removeFromCart: (productId: string, size: string, variantId?: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  user: User | null;
  logout: () => void;
  isAdmin: boolean;
  loadingAuth: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Sync with Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingAuth(false);
    });
    return unsubscribe;
  }, []);

  // Persistence for non-auth state
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    const savedWishlist = localStorage.getItem("wishlist");
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const addToCart = (product: Product, size: string, variantId?: string, variantName?: string, priceOverride?: number) => {
    setCart(prev => {
      const existing = prev.find(item => 
        item.id === product.id && 
        item.selectedSize === size && 
        item.selectedVariantId === variantId
      );
      if (existing) {
        return prev.map(item =>
          (item.id === product.id && item.selectedSize === size && item.selectedVariantId === variantId)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      // Inherit overridden price if provided
      const finalProduct = { ...product };
      if (priceOverride !== undefined) {
        finalProduct.price = priceOverride;
      }
      
      return [...prev, { 
        ...finalProduct, 
        selectedSize: size, 
        selectedVariantId: variantId,
        selectedVariantName: variantName,
        quantity: 1 
      }];
    });
  };

  const removeFromCart = (productId: string, size: string, variantId?: string) => {
    setCart(prev => prev.filter(item => !(
      item.id === productId && 
      item.selectedSize === size && 
      item.selectedVariantId === variantId
    )));
  };

  const updateQuantity = (productId: string, size: string, quantity: number, variantId?: string) => {
    if (quantity < 1) return;
    setCart(prev => prev.map(item =>
      (item.id === productId && item.selectedSize === size && item.selectedVariantId === variantId)
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const logout = () => signOut(auth);

  const isAdmin = user?.email === "admin@solesphere.com" || user?.email === "nxnayeem000@gmail.com";

  return (
    <AppContext.Provider value={{
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      user,
      logout,
      isAdmin,
      loadingAuth
    }}>
      {!loadingAuth && children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error("useApp must be used within AppProvider");
  return context;
}
