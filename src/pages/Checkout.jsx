
import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import "./Checkout.css";

const Checkout = () => {
const { cart, totalPrice, clearCart } = useContext(CartContext);
  const { user , token } = useContext(AuthContext);
  const location = useLocation();

  // Check whether the user clicked Buy Now
  const buyNowProduct = location.state?.buyNow;

  // Select products based on checkout type
  const checkoutProducts = buyNowProduct
    ? [buyNowProduct]
    : cart;

  // Calculate checkout amount
  const subtotal = buyNowProduct
    ? buyNowProduct.price * buyNowProduct.quantity
    : totalPrice;

  const shipping = subtotal >= 500 ? 0 : 50;
  const finalTotal = subtotal + shipping;

  const [address, setAddress] = useState("");
const [order, setOrder] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  const handleOrder = async (e) => {
    e.preventDefault();

    if (!address.trim()) {
      alert("Please enter your delivery address.");
      return;
    }

    if (checkoutProducts.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      setPlacingOrder(true);

      const orderData = {
        userId: user.id,
        email: user.email,

        items: checkoutProducts.map((product) => ({
          productId: product.id,
          title: product.title,
          price: product.price,
          quantity: product.quantity,
          image: product.image,
        })),

        address: address,
        totalAmount: finalTotal,
      };

      const response = await fetch(
        "http://localhost:5000/api/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,

          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to place order");
      }

       
console.log("Order saved:", data);

// Clear cart only for normal cart checkout
if (!buyNowProduct) {
  clearCart();
}

// Save order details for confirmation
setOrder(data);
    } catch (error) {
      console.error("Order error:", error);
      alert(error.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  // Order success screen
  
if (order) {
  return (
    <div className="checkout-success">
      <div className="success-icon">✓</div>

      <h1>Order Placed Successfully! 🎉</h1>

      <p>
        Thank you for your order,
        <strong> {order.order.email}</strong>
      </p>

      <div className="delivery-box">
        <h3>📦 Order Details</h3>

        <p>
          <strong>Order ID:</strong> {order.order._id}
        </p>

        <p>
          <strong>Delivery Address:</strong>
        </p>

        <p>{order.order.address}</p>

        <h3>Products</h3>

        {order.order.items.map((item, index) => (
          <p key={index}>
            {item.title} × {item.quantity}
          </p>
        ))}
      </div>

      <div className="success-total">
        <span>Order Total</span>
        <strong>
          ₹{Number(order.order.totalAmount).toFixed(2)}
        </strong>
      </div>

      <Link to="/my-orders" className="continue-shopping">
        View My Orders
      </Link>

      <br />

      <Link to="/products" className="continue-shopping">
        Continue Shopping
      </Link>
    </div>
  );
}


  return (
    <div className="checkout">
      <h1>Checkout 🛒</h1>

      <p className="checkout-type">
        {buyNowProduct ? "Buy Now Checkout" : "Cart Checkout"}
      </p>

      <div className="checkout-container">

        {/* Delivery Details */}
        <div className="checkout-form">
          <h2>Delivery Details</h2>

          <p className="logged-user">
            Logged in as:
            <strong> {user.email}</strong>
          </p>

          <form onSubmit={handleOrder}>
            <label htmlFor="address">
              Delivery Address
            </label>

            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full delivery address"
              rows="6"
              required
            />

            <button type="submit" disabled={placingOrder}>
              {placingOrder ? "Placing Order..." : "Place Order →"}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>

          <div className="checkout-products">
            {checkoutProducts.map((product) => (
              <div
                key={product.id}
                className="summary-item"
              >
                <img
                  src={product.image}
                  alt={product.title}
                />

                <div className="summary-product-info">
                  <h4>{product.title}</h4>

                  <p>
                    ₹{Number(product.price).toFixed(2)}
                    {" × "}
                    {product.quantity}
                  </p>
                </div>

                <strong>
                  ₹{(
                    product.price * product.quantity
                  ).toFixed(2)}
                </strong>
              </div>
            ))}
          </div>

          <hr />

          <div className="checkout-row">
            <span>Subtotal</span>
            <strong>₹{subtotal.toFixed(2)}</strong>
          </div>

          <div className="checkout-row">
            <span>Shipping</span>
            <strong>
              {shipping === 0 ? "FREE" : `₹${shipping}`}
            </strong>
          </div>

          <hr />

          <div className="checkout-total">
            <span>Total</span>
            <strong>₹{finalTotal.toFixed(2)}</strong>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
