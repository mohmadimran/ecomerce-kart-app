import { Button } from "antd";
import { Link } from "react-router-dom";

import Header from "../components/Header";
import "./Thanks.css";

export default function Thanks() {
  const balance = localStorage.getItem("balance") || "0";

  return (
    <>

      <Header />

      <div className="thanks-container">
        <h1 style={{ fontWeight: 600 }}>It's ordered!</h1>

        <div className="green-text thanks-line">
          You will receive an invoice for your order shortly.
          <br />
          Your order will arrive in 7 business days.
        </div>

        <div className="thanks-line">
          Wallet balance:
          <br />
          ₹{balance} available
        </div>

        <Link to="/products" className="thanks-line">
          <Button type="primary">Browse for more products</Button>
        </Link>
      </div>
    </>
  );
}