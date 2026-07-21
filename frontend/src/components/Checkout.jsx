import { Button, message, Radio, Row, Col } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "../App";
import Cart from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

/**
 * @typedef {Object} Product
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} Address
 * @property {string} _id - Unique ID for the address
 * @property {string} address - Full address string
 */

/**
 * Checkout component handles the Checkout page UI and functionality
 */
const Checkout = () => {
  const navigate = useNavigate();
  
  // State variables
  const [products, setProducts] = useState([]);
  const [address, setAddress] = useState("");
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [newAddress, setNewAddress] = useState("");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Refs
  const cartRef = useRef(null);

  /**
   * Check the response of the getProducts() API call to be valid and handle any failures along the way
   */
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

  /**
   * Check the response of other API calls to be valid and handle any failures along the way
   */
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

  /**
   * Perform the API call to fetch all products from backend
   */
  const getProducts = useCallback(async () => {
    let response = {};
    let errored = false;

    setLoading(true);

    try {
      response = await (await fetch(`${config.endpoint}/products`)).json();
    } catch (e) {
      errored = true;
    }

    setLoading(false);

    if (validateGetProductsResponse(errored, response)) {
      if (response) {
        setProducts(response);
      }
    }
  }, [validateGetProductsResponse]);

  /**
   * Perform the API call to fetch the user's addresses from backend
   */
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
    } catch (e) {
      errored = true;
    }

    setLoading(false);

    if (validateResponse(errored, response, "fetch addresses")) {
      if (response) {
        setAddress(response.address !== "ADDRESS_NOT_SET" ? response.address : "");
      }
    }
  }, [validateResponse]);

  /**
   * Perform the API call to add an address for the user
   */
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
    } catch (e) {
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

  /**
   * Perform the API call to delete an address for the user
   */
  const deleteAddress = useCallback(async (addressId) => {
    let response = {};
    let errored = false;

    setLoading(true);

    try {
      response = await (
        await fetch(`${config.endpoint}/user/addresses/${addressId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      ).json();
    } catch (e) {
      errored = true;
    }

    setLoading(false);

    if (validateResponse(errored, response, "delete address")) {
      if (response) {
        message.success("Address deleted");
        await getAddresses();
      }
    }
  }, [validateResponse, getAddresses]);

  /**
   * Perform the API call to place an order
   */
  const checkout = useCallback(async () => {
    let response = {};
    let errored = false;

    setLoading(true);

    try {
      response = await fetch(`${config.endpoint}/cart/checkout`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
    } catch (e) {
      errored = true;
      console.log(e);
    }

    setLoading(false);

    let data;
    if (response.status !== 204) {
      data = await response.json();
    }
    if (response.status === 204 || validateResponse(errored, data)) {
      message.success("Order placed");

      console.log(cartRef.current?.calculateTotal());
      localStorage.setItem(
        "balance",
        parseInt(localStorage.getItem("balance")) -
          (cartRef.current?.calculateTotal() || 0)
      );

      navigate("/thanks");
    }
  }, [validateResponse, navigate]);

  /**
   * Function that is called when the user clicks on the place order button
   */
  const order = useCallback(() => {
    checkout();
  }, [checkout]);

  // ComponentDidMount equivalent
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
      {/* Display Header */}
      <Header />

      {/* Display Checkout page content */}
      <div className="checkout-container">
        <Row>
          {/* Display checkout instructions */}
          <Col xs={{ span: 24, order: 2 }} md={{ span: 18, order: 1 }}>
            <div className="checkout-shipping">
              <h1 style={{ marginBottom: "-10px" }}>Shipping</h1>

              <hr />
              <br />

              <p>Shipping Address</p>

              {/* Display the "Shipping" section */}
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
                  {/* Text input field to type a new address */}
                  <div>
                    <TextArea
                      className="new-address"
                      placeholder={address ? "Update Address" : "Add new address"}
                      rows={4}
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                    />
                  </div>

                  {/* Button to submit address added */}
                  <div>
                    <Button type="primary" onClick={addAddress}>
                      {address ? "Update Address" : "Add new address"}
                    </Button>
                  </div>
                </div>
              </div>

              <br />

              {/* Display the "Pricing" section */}
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

              {/* Button to confirm order */}
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

          {/* Display the cart */}
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
                />
              )}
            </div>
          </Col>
        </Row>
      </div>

      {/* Display the footer */}
      <Footer />
    </>
  );
};

export default Checkout;