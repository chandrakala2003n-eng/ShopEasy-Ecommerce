import React from "react";
import "./Home.css";

const Home = () => {
  return (
    <section className="hero">

      <div className="hero-text">
        <h1>Big Sale is Live! 🎉</h1>

        <p>
          Discover the latest fashion, electronics, shoes and accessories
          at amazing prices.
        </p>

        <button>Shop Now</button>
      </div>

      <div className="hero-image">
        <img
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600"
          alt="shopping"
        />
      </div>

    </section>
  );
};

export default Home;