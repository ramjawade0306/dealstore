'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) setCart(JSON.parse(stored));
  }, []);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const addToCart = (product, quantity = 1, size = null) => {
    const existing = cart.find(
      (item) => item._id === product._id && item.size === size
    );
    let newCart;
    if (existing) {
      newCart = cart.map((item) =>
        item._id === product._id && item.size === size
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity, size }];
    }
    saveCart(newCart);
  };

  const removeFromCart = (productId, size) => {
    saveCart(cart.filter((item) => !(item._id === productId && item.size === size)));
  };

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) return removeFromCart(productId, size);
    saveCart(
      cart.map((item) =>
        item._id === productId && item.size === size ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => saveCart([]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.discountPrice * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
