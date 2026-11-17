import React from "react";
import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import "./Wishlist.css";

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useContext(CartContext);

  return (
    <div className="wishlist-page">
      <h2>My Wishlist ❤️</h2>

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <h3>Your wishlist is empty!</h3>
          <p>Save your favourite products here.</p>
          <Link to="/products">Explore Products</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((product) => (
            <div className="wishlist-card" key={product.id}>
              <Link to={`/product/${product.id}`}>
                <img src={product.image} alt={product.title} />
              </Link>

              <h4>{product.title}</h4>
              <p>₹{Number(product.price).toFixed(2)}</p>

              <div className="wishlist-actions">
                <button onClick={() => addToCart(product)}>
                  Add to Cart 🛒
                </button>

                <button
                  className="remove-wishlist"
                  onClick={() => removeFromWishlist(product.id)}
                >
                  Remove ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;