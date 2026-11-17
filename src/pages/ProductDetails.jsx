
import React, { useContext, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import "./ProductDetails.css";
import { AuthContext } from "../context/AuthContext";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviews, setReviews] = useState([]);
  const averageRating =
  reviews.length > 0
    ? (
        reviews.reduce((total, review) => total + review.rating, 0) /
        reviews.length
      ).toFixed(1)
    : "0.0";
const [reviewRating, setReviewRating] = useState(5);
const [reviewComment, setReviewComment] = useState("");
const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setProduct(null);
        setQuantity(1);
        setError("");

        let response;
        let data;

        if (id.startsWith("mongo-")) {
          const mongoId = id.replace("mongo-", "");

          response = await fetch(
            `http://localhost:5000/api/products/${mongoId}`
          );

          if (!response.ok) {
            throw new Error("Product not found");
          }

          data = await response.json();

          data = {
            ...data,
            id: `mongo-${data._id}`,
            mongoId: data._id,
            source: "mongo",
          };
        } else if (id.startsWith("fake-")) {
          const fakeId = id.replace("fake-", "");

          response = await fetch(
            `https://fakestoreapi.com/products/${fakeId}`
          );

          if (!response.ok) {
            throw new Error("Product not found");
          }

          data = await response.json();

          data = {
            ...data,
            id: `fake-${data.id}`,
            source: "fake",
          };
        } else {
          throw new Error("Invalid product ID");
        }

        setProduct(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/reviews/${id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Reviews error:", error);
    }
  };

  fetchReviews();
}, [id]);

const handleSubmitReview = async (e) => {
  e.preventDefault();

  if (!user || !token) {
    alert("Please login to submit a review.");
    navigate("/login");
    return;
  }

  if (!reviewComment.trim()) {
    alert("Please write a review.");
    return;
  }

  try {
    setReviewLoading(true);

    const response = await fetch(
      "http://localhost:5000/api/reviews",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to submit review");
    }

    setReviews((prev) => [data.review, ...prev]);
    setReviewComment("");
    setReviewRating(5);

    alert("Review submitted successfully!");
  } catch (error) {
    alert(error.message);
  } finally {
    setReviewLoading(false);
  }
};

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert("Product added to cart!");
  };

  const handleBuyNow = () => {
    navigate("/checkout", {
      state: {
        buyNow: {
          ...product,
          quantity,
        },
      },
    });
  };

  if (loading) {
    return <h2 className="message">Loading product...</h2>;
  }

  if (error || !product) {
    return <h2 className="message">{error || "Product not found"}</h2>;
  }

  return (
    <div className="product-details-page">
      <Link to="/products" className="back-link">
        ← Back to Products
      </Link>

      <div className="product-details">
        <div className="product-details-image">
          <img src={product.image} alt={product.title} />
        </div>

        <div className="product-details-info">
          <p className="category">{product.category}</p>

          <h1>{product.title}</h1>

          <div className="rating">
            ⭐ {product.rating?.rate ?? "N/A"}
            <span>
              ({product.rating?.count ?? 0} reviews)
            </span>
          </div>

          <h2 className="product-price">
            ₹{Number(product.price).toFixed(2)}
          </h2>

          <p className="description">{product.description}</p>

          <div className="quantity-selector">
            <span>Quantity:</span>

            <button onClick={decreaseQuantity} disabled={quantity === 1}>
              −
            </button>

            <span className="quantity-value">{quantity}</span>

            <button onClick={increaseQuantity}>+</button>
          </div>

          <p className="selected-total">
            Total: ₹{(product.price * quantity).toFixed(2)}
          </p>

          <button
            className="details-cart-btn"
            onClick={handleAddToCart}
          >
            Add to Cart 🛒
          </button>

          <button
            className="details-cart-btn buy-now-btn"
            onClick={handleBuyNow}
          >
            Buy Now ⚡
          </button>

          <Link to="/cart" className="view-cart-btn">
            View Cart
          </Link>
        </div>
            </div>

      {/* Product Reviews */}
      <div className="reviews-section">
        <h2>Customer Reviews ⭐</h2>

        {/* Review Form */}
        <form onSubmit={handleSubmitReview} className="review-form">
          <h3>Write a Review</h3>

          <label>Your Rating:</label>

          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setReviewRating(star)}
                style={{
                  cursor: "pointer",
                  color: star <= reviewRating ? "orange" : "#ccc",
                  fontSize: "28px",
                }}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            placeholder="Write your experience about this product..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            rows="4"
          />

          <button type="submit" disabled={reviewLoading}>
            {reviewLoading ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        {/* Display Reviews */}
        <div className="reviews-list">
  <div className="average-rating">
    <h3>Customer Rating</h3>

    <div className="average-rating-details">
      <strong>{averageRating} / 5</strong>

      <span>
        {"★".repeat(Math.round(Number(averageRating)))}
        {"☆".repeat(5 - Math.round(Number(averageRating)))}
      </span>
    </div>

    <p>Based on {reviews.length} customer reviews</p>
  </div>

  <h3>All Reviews ({reviews.length})</h3>

          {reviews.length === 0 ? (
            <p>No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review) => (
              <div className="review-card" key={review._id}>
                <h4>{review.userId?.name || "Customer"}</h4>

                <p className="review-stars">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </p>

                <p>{review.comment}</p>

                <small>
                  {new Date(review.createdAt).toLocaleDateString()}
                </small>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
