import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const AdminProducts = () => {
  const { token } = useContext(AuthContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState("");

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      setProducts(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setEditingProduct({ ...product });
    setMessage("");
  };

  const handleChange = (e) => {
    setEditingProduct({
      ...editingProduct,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${editingProduct._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editingProduct.title,
            description: editingProduct.description,
            price: Number(editingProduct.price),
            image: editingProduct.image,
            category: editingProduct.category,
            stock: Number(editingProduct.stock),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }

      setProducts((previous) =>
        previous.map((product) =>
          product._id === data.product._id ? data.product : product
        )
      );

      setEditingProduct(null);
      setMessage("Product updated successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Delete failed");
      }

      setProducts((previous) =>
        previous.filter((product) => product._id !== productId)
      );

      setMessage("Product deleted successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (loading) return <h2>Loading products...</h2>;

  return (
    <div style={{ padding: "30px" }}>
      <h1>Manage Products</h1>

      {message && <p>{message}</p>}

      {editingProduct && (
        <form onSubmit={handleUpdate}>
          <h2>Edit Product</h2>

          <input
            name="title"
            placeholder="Product Name"
            value={editingProduct.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={editingProduct.description}
            onChange={handleChange}
            required
          />

          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={editingProduct.price}
            onChange={handleChange}
            required
          />

          <input
            name="image"
            type="url"
            placeholder="Image URL"
            value={editingProduct.image}
            onChange={handleChange}
            required
          />

          <input
            name="category"
            value={editingProduct.category}
            onChange={handleChange}
            required
          />

          <input
            name="stock"
            type="number"
            min="0"
            value={editingProduct.stock}
            onChange={handleChange}
            required
          />

          <button type="submit">Save Changes</button>
          <button type="button" onClick={() => setEditingProduct(null)}>
            Cancel
          </button>
        </form>
      )}

      {products.length === 0 ? (
        <p>No MongoDB products found.</p>
      ) : (
        products.map((product) => (
          <div
            key={product._id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              margin: "15px 0",
              borderRadius: "8px",
            }}
          >
            <img
              src={product.image}
              alt={product.title}
              style={{ width: "100px", height: "100px", objectFit: "contain" }}
            />

            <h3>{product.title}</h3>
            <p>Price: ₹{product.price}</p>
            <p>Category: {product.category}</p>
            <p>Stock: {product.stock}</p>

            <button onClick={() => handleEdit(product)}>Edit</button>

            <button onClick={() => handleDelete(product._id)}>
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminProducts;