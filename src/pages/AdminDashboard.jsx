
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const statuses = [
    "Order Placed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/orders/admin/all",
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
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchOrders();
  }, [token]);

  const updateStatus = async (orderId, status) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/status/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Status update failed");
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId ? data.order : order
        )
      );

      alert("Order status updated successfully!");
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredOrders = orders.filter((order) =>
    `${order._id} ${order.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) return <h2 className="admin-message">Loading orders...</h2>;

  if (error) return <h2 className="admin-message">{error}</h2>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <button
  onClick={() => (window.location.href = "/admin/add-product")}
>
  + Add New Product
</button>
          <p>Manage customer orders and delivery status.</p>
        </div>

        <div className="admin-total">
          <span>Total Orders</span>
          <h2>{orders.length}</h2>
        </div>
      </div>

      <input
        type="text"
        className="admin-search"
        placeholder="Search by Order ID or customer email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredOrders.length === 0 ? (
        <p className="admin-message">No orders found.</p>
      ) : (
        <div className="admin-orders">
          {filteredOrders.map((order) => (
            <div className="admin-order-card" key={order._id}>
              <div className="admin-order-top">
                <div>
                  <h3>Order #{order._id}</h3>
                  <p>{order.email}</p>
                </div>

                <strong>
                  ₹{Number(order.totalAmount).toFixed(2)}
                </strong>
              </div>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(order.createdAt).toLocaleString()}
              </p>

              <p>
                <strong>Address:</strong> {order.address}
              </p>

              <div className="admin-order-products">
                <strong>Products:</strong>

                {order.items.map((item, index) => (
                  <p key={item.productId || index}>
                    {item.title} × {item.quantity}
                  </p>
                ))}
              </div>

              <div className="admin-status-control">
                <label>Update Order Status:</label>

                <select
                  value={order.status || "Order Placed"}
                  onChange={(e) =>
                    updateStatus(order._id, e.target.value)
                  }
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
