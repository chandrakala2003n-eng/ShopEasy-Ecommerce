
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "./MyOrders.css";

const MyOrders = () => {
  const { user , token } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingOrder, setCancellingOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
  `http://localhost:5000/api/orders/${user.id}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch orders");
        }

        setOrders(data);
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user?.id, token]);

  const handleCancelOrder = async (orderId) => {
  const confirmCancel = window.confirm(
    "Are you sure you want to cancel this order?"
  );

  if (!confirmCancel) return;

  try {
    setCancellingOrder(orderId);

    const response = await fetch(
      `http://localhost:5000/api/orders/cancel/${orderId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to cancel order");
    }

    setOrders((previousOrders) =>
      previousOrders.map((order) =>
        order._id === orderId ? data.order : order
      )
    );

    alert("Order cancelled successfully!");
  } catch (error) {
    alert(error.message);
  } finally {
    setCancellingOrder(null);
  }
};

  const trackingSteps = [
    "Order Placed",
    "Processing",
    "Shipped",
    "Delivered",
  ];

  const getStatusIndex = (status) => {
    // Support older orders that used "Placed"
    const currentStatus =
      status === "Placed" ? "Order Placed" : status;

    return trackingSteps.indexOf(currentStatus);
  };

  if (loading) {
    return (
      <div className="orders-message">
        <h2>Loading your orders...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-message">
        <h2>{error}</h2>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>My Orders 📦</h1>
        <p>Track and manage your purchases.</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <h2>No Orders Yet! 🛍️</h2>
          <p>You haven't placed any orders yet.</p>

          <Link to="/products" className="continue-shopping">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const status = order.status || "Order Placed";
            const statusIndex = getStatusIndex(status);
            const isCancelled = status === "Cancelled";

            return (
              <div className="order-card" key={order._id}>
                <div className="order-header">
                  <h3>Order #{order._id}</h3>

                  <span
                    className={`order-status ${
                      isCancelled ? "cancelled" : ""
                    }`}
                  >
                    {status}
                  </span>
                </div>

                {/* Order Tracking Timeline */}
                <div className="order-tracking">
                  <h4>Order Tracking</h4>

                  {isCancelled ? (
                    <div className="cancelled-message">
                      ❌ This order has been cancelled.
                    </div>
                  ) : (
                    <div className="tracking-steps">
                      {trackingSteps.map((step, index) => (
                        <div
                          className={`tracking-step ${
                            index <= statusIndex ? "completed" : ""
                          }`}
                          key={step}
                        >
                          <div className="tracking-circle">
                            {index <= statusIndex ? "✓" : index + 1}
                          </div>

                          <p>{step}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="order-info">
                  <p>
                    <strong>Order Date:</strong>{" "}
                    {new Date(order.createdAt).toLocaleString()}
                  </p>

                  <p>
                    <strong>Total Amount:</strong>{" "}
                    ₹{Number(order.totalAmount).toFixed(2)}
                  </p>

                  <p>
                    <strong>Delivery Address:</strong>{" "}
                    {order.address}
                  </p>
                </div>

                <div className="order-items">
                  <h4>Ordered Products</h4>

                  {order.items.map((item, index) => (
                    <div
                      className="order-item"
                      key={item.productId || index}
                    >
                      <img src={item.image} alt={item.title} />

                      <div className="order-item-info">
                        <p className="order-item-title">
                          {item.title}
                        </p>

                        <p>
                          ₹{Number(item.price).toFixed(2)}
                          {" × "}
                          {item.quantity}
                        </p>

                        <strong>
                          Subtotal: ₹
                          {(
                            Number(item.price) * item.quantity
                          ).toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>

                {["Order Placed", "Processing"].includes(status) && (
  <button
    className="cancel-order-btn"
    onClick={() => handleCancelOrder(order._id)}
    disabled={cancellingOrder === order._id}
  >
    {cancellingOrder === order._id
      ? "Cancelling..."
      : "Cancel Order"}
  </button>
)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
