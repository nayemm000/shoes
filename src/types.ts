export interface ProductVariant {
  id: string;
  name: string; // e.g. "Triple White", "Solar Red"
  priceOverride?: number;
  imageIndex?: number;
  stockPerSize: { [size: string]: number };
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  discount: number;
  category: string;
  sizes: string[];
  stock: number;
  images: string[];
  description: string;
  rating: number;
  reviews: number;
  variants?: ProductVariant[];
}

export interface CartItem extends Product {
  selectedSize: string;
  selectedVariantId?: string;
  selectedVariantName?: string;
  quantity: number;
}

export interface Order {
  id: string;
  status: string;
  date: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  items: CartItem[];
  total: number;
}
