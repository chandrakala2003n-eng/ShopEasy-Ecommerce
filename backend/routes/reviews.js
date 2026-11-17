
const express = require("express");
const router = express.Router();

const Review = require("../models/Review");
const { protect } = require("../middleware/authMiddleware");


// Get average ratings for all products
router.get("/summary", async (req, res) => {
  try {
    const summaries = await Review.aggregate([
      {
        $group: {
          _id: "$productId",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    res.json(summaries);
  } catch (error) {
    console.error("Rating summary error:", error);
    res.status(500).json({
      message: "Failed to fetch rating summaries",
    });
  }
});


// Get reviews for a product
router.get("/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId,
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Fetch reviews error:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// Submit a product review
router.post("/", protect, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (
      !productId?.trim() ||
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5 ||
      !comment?.trim()
    ) {
      return res.status(400).json({
        message: "Please provide a valid rating and comment",
      });
    }

    const existingReview = await Review.findOne({
      productId,
      userId: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }

    const review = await Review.create({
      productId,
      userId: req.user._id,
      rating: Number(rating),
      comment: comment.trim(),
    });

    const savedReview = await review.populate("userId", "name");

    res.status(201).json({
      message: "Review submitted successfully",
      review: savedReview,
    });
  } catch (error) {
    console.error("Submit review error:", error);
    res.status(500).json({ message: "Failed to submit review" });
  }
});

module.exports = router;
