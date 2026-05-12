import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { CartItem, Product } from '../types';

interface CartState { items: CartItem[]; }

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { _id: string; size: string; color: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { _id: string; size: string; color: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  cartTotal: number;
  shippingPrice: number;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeFromCart: (id: string, size: string, color: string) => void;
  updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        i => i._id === action.payload._id && i.size === action.payload.size && i.color === action.payload.color
      );
      if (existing) {
        return { ...state, items: state.items.map(i => i._id === action.payload._id && i.size === action.payload.size && i.color === action.payload.color ? { ...i, quantity: i.quantity + action.payload.quantity } : i) };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => !(i._id === action.payload._id && i.size === action.payload.size && i.color === action.payload.color)) };
    case 'UPDATE_QUANTITY':
      return { ...state, items: state.items.map(i => i._id === action.payload._id && i.size === action.payload.size && i.color === action.payload.color ? { ...i, quantity: action.payload.quantity } : i) };
    case 'CLEAR_CART': return { ...state, items: [] };
    case 'LOAD_CART': return { ...state, items: action.payload };
    default: return state;
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
      dispatch({ type: 'LOAD_CART', payload: saved });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product: Product, quantity = 1, size = '', color = '') => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        _id: product._id,
        name: product.name,
        image: product.images?.[0]?.url || '',
        price: product.discountPrice > 0 ? product.discountPrice : product.price,
        originalPrice: product.price,
        stock: product.stock,
        quantity,
        size,
        color,
        isPreOrder: product.stock <= 0,
      },
    });
    toast.success('Added to cart!');
  };

  const removeFromCart = (id: string, size: string, color: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { _id: id, size, color } });
    toast.success('Removed from cart');
  };

  const updateQuantity = (id: string, size: string, color: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch({ type: 'UPDATE_QUANTITY', payload: { _id: id, size, color, quantity } });
  };

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const cartCount = state.items.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = state.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingPrice = cartTotal >= 1000 ? 0 : state.items.length > 0 ? 80 : 0;

  return (
    <CartContext.Provider value={{ items: state.items, cartCount, cartTotal, shippingPrice, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
