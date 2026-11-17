
import React, { createContext, useState } from "react";

export const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Check available stock
  const hasEnoughStock = (product, requestedQuantity) => {
    // FakeStore products do not have MongoDB stock
    if (product.stock === undefined) {
      return true;
    }

    return requestedQuantity <= product.stock;
  };

  // Add product to cart
  const addToCart = (product, quantity = 1) => {
    setCart((previousCart) => {
      const existingProduct = previousCart.find(
        (item) => item.id === product.id
      );

      const newQuantity = existingProduct
        ? existingProduct.quantity + quantity
        : quantity;

      if (!hasEnoughStock(product, newQuantity)) {
        alert(`Only ${product.stock} items are available!`);
        return previousCart;
      }

      if (existingProduct) {
        return previousCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      return [...previousCart, { ...product, quantity }];
    });
  };

  // Increase quantity
  const increaseQuantity = (id) => {
    setCart((previousCart) =>
      previousCart.map((item) => {
        if (item.id !== id) return item;

        const newQuantity = item.quantity + 1;

        if (!hasEnoughStock(item, newQuantity)) {
          alert(`Only ${item.stock} items are available!`);
          return item;
        }

        return { ...item, quantity: newQuantity };
      })
    );
  };

  // Decrease quantity
  const decreaseQuantity = (id) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove product
  const removeFromCart = (id) => {
    setCart((previousCart) =>
      previousCart.filter((item) => item.id !== id)
    );
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Total cart items
  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Total cart price
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
