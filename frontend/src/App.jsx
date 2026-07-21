import "antd/dist/reset.css";
import { useLayoutEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Search from "./components/Search";
import Checkout from "./components/Checkout";
import Thanks from "./components/Thanks";

export const config = {
  endpoint:
    import.meta.env.VITE_API_URL ||
    "https://qkart-backend-aac4.onrender.com/v1",
};

export default function App() {
  const location = useLocation();

  // Scroll to top whenever the route changes
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<Search />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/thanks" element={<Thanks />} />
      </Routes>
    </div>
  );
}