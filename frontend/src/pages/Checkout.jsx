import { Button, Input, message, Radio, Row, Col } from "antd";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "../config";
import Cart from "../components/Cart";
import "./Checkout.css";
import Footer from "../components/Footer";
import Header from "../components/Header";

const Checkout = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [address, setAddress] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const cartRef = useRef(null);

  const validateGetProductsResponse = useCallback((errored, response) => {
    if (errored || (!response.length && !response.message)) {
      message.error(
        "Could not fetch products. Check that the backend is running, reachable and returns valid JSON."
      );
      return false;
    }

    if (!response.length) {
      message.error(response.message || "No products found in database");
      return false;
    }

    return true;
  }, []);

  const validateResponse = useCallback((errored, response, couldNot) => {
    if (errored) {
      message.error(
        `Could not ${couldNot}. Check that the backend is running, reachable and returns valid JSON.`
      );
      return false;
    }
    if (response.message) {
      message.error(response.message);
      return false;
    }
    return true;
  }, []);

  const getProducts = useCallback(async () => {
    let response = {};
    let errored = false;

    setLoading(true);

    try {
      response = await (await fetch(`${config.endpoint}/products`)).json();
    } catch {
      errored = true;
    }

    setLoading(false);

    if (validateGetProductsResponse(errored, response)) {
      if (response) {
        setProducts(response);
      }
    }
  }, [validateGetProductsResponse]);

  const getAddresses = useCallback(async () => {
    let response = {};
    let errored = false;

    setLoading(true);

    try {
      response = await (
        await fetch(
          `${config.endpoint}/users/${localStorage.getItem(
            "userId"
          )}?q=address`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
      ).json();
    } catch {
      errored = true;
    }

    setLoading(false);

    if (validateResponse(errored, response, "fetch addresses")) {
      if (response) {
        setAddress(response.address !== "ADDRESS_NOT_SET" ? response.address : "");
      }
    }
  }, [validateResponse]);

  const addAddress = useCallback(async () => {
    let response = {};
    let errored = false;

    setLoading(true);

    try {
      response = await (
        await fetch(
          `${config.endpoint}/users/${localStorage.getItem(
            "userId"
          )}?q=address`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              address: newAddress,
            }),
          }
        )
      ).json();
    } catch {
      errored = true;
    }

    setLoading(false);

    if (validateResponse(errored, response, "add a new address")) {
      if (response) {
        message.success("Address added");
        setNewAddress("");
        await getAddresses();
      }
    }
  }, [newAddress, validateResponse, getAddresses]);

  const checkout = useCallback(async () => {
    let response;

    setLoading(true);

    try {
      response = await fetch(`${config.endpoint}/cart/checkout`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error(error);
      validateResponse(true, {}, "place order");
      return;
    } finally {
      setLoading(false);
    }

    let data;
    if (response.status !== 204) {
      try {
        data = await response.json();
      } catch (error) {
        console.error(error);
        validateResponse(true, {}, "place order");
        return;
      }
    }
    if (!response.ok && response.status !== 204) {
      validateResponse(false, data?.message ? data : { message: "Unable to place order" }, "place order");
      return;
    }
    if (response.status === 204 || validateResponse(false, data, "place order")) {
      message.success("Order placed");

      localStorage.setItem(
        "balance",
        parseInt(localStorage.getItem("balance")) -
          (cartRef.current?.calculateTotal() || 0)
      );

      navigate("/thanks");
    }
  }, [validateResponse, navigate]);

  const order = useCallback(() => {
    checkout();
  }, [checkout]);

  useEffect(() => {
    const initializeCheckout = async () => {
      if (localStorage.getItem("username") && localStorage.getItem("token")) {
        await getProducts();
        await getAddresses();
        setBalance(parseInt(localStorage.getItem("balance")) || 0);
      } else {
        message.error("You must be logged in to visit the checkout page");
        navigate("/");
      }
    };

    initializeCheckout();
  }, [getProducts, getAddresses, navigate]);

  const radioStyle = {
    display: "block",
    height: "30px",
    lineHeight: "30px",
  };

  return (
    <>

      <Header />

      <div className="checkout-container">
        <Row>

          <Col xs={{ span: 24, order: 2 }} md={{ span: 18, order: 1 }}>
            <div className="checkout-shipping">
              <h1 style={{ marginBottom: "-10px" }}>Shipping</h1>

              <hr />
              <br />

              <p>Shipping Address</p>

              <div className="address-section">
                {address.length ? (
                  <div className="address-box">
                    <div className="address-text">{address}</div>
                  </div>
                ) : (
                  <div className="red-text checkout-row">
                    No addresses found. Please add one to proceed.
                  </div>
                )}

                <div className="checkout-row">

                  <div>
                    <Input.TextArea
                      className="new-address"
                      placeholder={address ? "Update Address" : "Add new address"}
                      rows={4}
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                    />
                  </div>

                  <div>
                    <Button type="primary" onClick={addAddress}>
                      {address ? "Update Address" : "Add new address"}
                    </Button>
                  </div>
                </div>
              </div>

              <br />

              <div>
                <h1 style={{ marginBottom: "-10px" }}>Pricing</h1>

                <hr />

                <h2>Payment Method</h2>

                <Radio.Group value={1}>
                  <Radio style={radioStyle} value={1}>
                    Wallet
                    <strong> (₹{balance} available)</strong>
                  </Radio>
                </Radio.Group>
              </div>

              <br />

              <Button
                className="ant-btn-success"
                loading={loading}
                type="primary"
                onClick={order}
              >
                <strong>Place Order</strong>
              </Button>
            </div>
          </Col>

          <Col
            xs={{ span: 24, order: 1 }}
            md={{ span: 6, order: 2 }}
            className="checkout-cart"
          >
            <div>
              {products.length && (
                <Cart
                  ref={cartRef}
                  products={products}
                  token={localStorage.getItem("token")}
                  checkout={true}
                  navigate={navigate}
                />
              )}
            </div>
          </Col>
        </Row>
      </div>

      <Footer />
    </>
  );
};

export default Checkout;