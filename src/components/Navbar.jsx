import React, { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import "./Navbar.css";

const Navbar = () => {
  const { totalItems } = useContext(CartContext);
  const { user, logout } = useContext(AuthContext);
  const { wishlist } = useWishlist();

  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="logo" onClick={closeMenu}>
        <span>🛍️</span> ShopEasy
      </Link>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className={`nav-links ${menuOpen ? "active" : ""}`}>
        <NavLink to="/" onClick={closeMenu}>
          Home
        </NavLink>

        <NavLink to="/products" onClick={closeMenu}>
          Products
        </NavLink>

        <NavLink to="/wishlist" onClick={closeMenu}>
          ❤️ Wishlist
          {wishlist.length > 0 && (
            <span className="cart-count">{wishlist.length}</span>
          )}
        </NavLink>

        <NavLink to="/cart" className="cart-link" onClick={closeMenu}>
          🛒 Cart
          {totalItems > 0 && (
            <span className="cart-count">{totalItems}</span>
          )}
        </NavLink>

        {user && (
          <NavLink to="/my-orders" onClick={closeMenu}>
            📦 My Orders
          </NavLink>
        )}

        {user ? (
          <button
            className="logout-btn"
            onClick={() => {
              logout();
              closeMenu();
            }}
          >
            Logout
          </button>
        ) : (
          <NavLink to="/login" onClick={closeMenu}>
            Login
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;