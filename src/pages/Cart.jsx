import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import "./Cart.css";

const Cart = () => {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    totalPrice,
    totalItems,
  } = useContext(CartContext);

  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-icon">🛒</div>

        <h1>Your Cart is Empty</h1>

        <p>Looks like you haven't added anything to your cart yet.</p>

        <Link to="/products" className="continue-shopping">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Shopping Cart 🛒</h1>

      <div className="cart-container">
        {/* Cart Items */}

        <div className="cart-items">
          {cart.map((product) => (
            <div className="cart-item" key={product.id}>
              {/* Product Image */}

              <div className="cart-item-image">
                <img src={product.image} alt={product.title} />
              </div>

              {/* Product Information */}

              <div className="cart-item-info">
                <Link
                  to={`/product/${product.id}`}
                  className="cart-product-title"
                >
                  {product.title}
                </Link>

                <p className="cart-category">{product.category}</p>

                <p className="cart-price">₹{product.price.toFixed(2)}</p>
              </div>

              {/* Quantity */}

              <div className="quantity">
                <button onClick={() => decreaseQuantity(product.id)}>−</button>

                <span>{product.quantity}</span>

                <button onClick={() => increaseQuantity(product.id)}>+</button>
              </div>

              {/* Subtotal */}

              <div className="cart-subtotal">
                <strong>
                  ₹{(product.price * product.quantity).toFixed(2)}
                </strong>
              </div>

              {/* Remove */}

              <button
                className="remove-btn"
                onClick={() => removeFromCart(product.id)}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        {/* Cart Summary */}

        <div className="cart-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Items</span>
            <span>{totalItems}</span>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>

            <span>₹{totalPrice.toFixed(2)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>

            <span>{totalPrice >= 500 ? "FREE" : "₹50"}</span>
          </div>

          <hr />

          <div className="total-row">
            <span>Total</span>

            <strong>
              ₹{(totalPrice + (totalPrice >= 500 ? 0 : 50)).toFixed(2)}
            </strong>
          </div>

          <button
            className="checkout-btn"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout →
          </button>

          <Link to="/products" className="continue-shopping-link">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
