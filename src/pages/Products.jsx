
import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [ratingSummaries, setRatingSummaries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [fakeResponse, mongoResponse] = await Promise.all([
          fetch("https://fakestoreapi.com/products"),
          fetch("http://localhost:5000/api/products"),
        ]);

        if (!fakeResponse.ok || !mongoResponse.ok) {
          throw new Error("Failed to fetch products");
        }

        const fakeData = await fakeResponse.json();
        const mongoData = await mongoResponse.json();

        // Give each source a unique ID
        const fakeProducts = fakeData.map((product) => ({
          ...product,
          id: `fake-${product.id}`,
          source: "fake",
        }));

        const mongoProducts = mongoData.map((product) => ({
          ...product,
          id: `mongo-${product._id}`,
          mongoId: product._id,
          source: "mongo",
        }));

        setProducts([...mongoProducts, ...fakeProducts]);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, sort]);

  useEffect(() => {
  const fetchRatingSummaries = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/reviews/summary"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch ratings");
      }

      const data = await response.json();

      const summaries = {};

      data.forEach((item) => {
        summaries[item._id] = {
          averageRating: item.averageRating,
          totalReviews: item.totalReviews,
        };
      });

      setRatingSummaries(summaries);
    } catch (error) {
      console.error("Rating summary error:", error);
    }
  };

  fetchRatingSummaries();
}, []);

  const categories = [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "all" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "low-high") return a.price - b.price;
    if (sort === "high-low") return b.price - a.price;

    if (sort === "rating") {
      return (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0);
    }

    return 0;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const currentProducts = sortedProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(
    sortedProducts.length / productsPerPage
  );

  const changePage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return <h2 className="message">Loading products...</h2>;
  }

  if (error) {
    return <h2 className="message">{error}</h2>;
  }

  return (
    <div className="products-page">
      <h1>Our Products</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="all">All Categories</option>

          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="default">Default Sorting</option>
          <option value="low-high">Price: Low to High</option>
          <option value="high-low">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      <div className="products-container">
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => (
<ProductCard
  key={product.id}
  product={product}
  ratingSummary={ratingSummaries[product.id]}
/>          ))
        ) : (
          <h2 className="message">No products found 😔</h2>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={currentPage === index + 1 ? "active" : ""}
              onClick={() => changePage(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Products;
