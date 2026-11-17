
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import "./ProductCard.css";

const ProductCard = ({ product, ratingSummary }) => {  const {
    cart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
  } = useContext(CartContext);

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  const saved = isInWishlist(product.id);

  const cartItem = cart.find((item) => item.id === product.id);
  const addedQuantity = cartItem ? cartItem.quantity : 0;

  const handleWishlist = () => {
    if (saved) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="product-card">
      <button
        className={`wishlist-btn ${saved ? "active" : ""}`}
        onClick={handleWishlist}
      >
        {saved ? "❤️" : "🤍"}
      </button>

      <Link to={`/product/${product.id}`} className="product-image-link">
        <img src={product.image} alt={product.title} loading="lazy" />
      </Link>

      <div className="product-info">
        <Link to={`/product/${product.id}`} className="product-title">
          {product.title}
        </Link>

        <p className="product-category">{product.category}</p>

        <div className="product-rating">
  {ratingSummary && ratingSummary.totalReviews > 0 ? (
    <>
      ⭐ {ratingSummary.averageRating.toFixed(1)}
      <span>
        ({ratingSummary.totalReviews} customer reviews)
      </span>
    </>
  ) : product.source === "fake" ? (
    <>
      ⭐ {product.rating?.rate ?? "N/A"}
      <span>({product.rating?.count ?? 0} reviews)</span>
    </>
  ) : (
    <>
      ⭐ New
      <span>(No customer reviews yet)</span>
    </>
  )}
</div>

        <div className="product-bottom">
  <h4>₹{Number(product.price).toFixed(2)}</h4>

  {product.stock !== undefined && (
    <p className="product-stock">
      {product.stock > 0
        ? `Available: ${product.stock}`
        : "Out of Stock"}
    </p>
  )}

  {addedQuantity === 0 ? (
    <button
      onClick={() => addToCart(product)}
      disabled={product.stock !== undefined && product.stock <= 0}
    >
      {product.stock !== undefined && product.stock <= 0
        ? "Out of Stock"
        : "Add to Cart 🛒"}
    </button>
  ) : (
    <div className="product-quantity-control">
      <button onClick={() => decreaseQuantity(product.id)}>
        −
      </button>

      <span>{addedQuantity}</span>

      <button
  onClick={() => increaseQuantity(product.id)}
  disabled={
    product.stock !== undefined &&
    addedQuantity >= product.stock
  }
>
  +
</button>
    </div>
  )}
</div>
        </div>
      </div>
    
  );
};

export default ProductCard;
