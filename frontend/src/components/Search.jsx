import { Input, message, Row, Col } from "antd";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "../App";
import Cart from "./Cart";
import Header from "./Header";
import Product from "./Product";
import Footer from "./Footer";
import "./Search.css";

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
 * Search component handles the Products list page UI and functionality
 * 
 * @param {Object} props - Component props
 * @param {Object} props.history - React Router history object (legacy, useNavigate instead)
 */
const Search = () => {
  const navigate = useNavigate();
  
  // State variables
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Refs
  const cartRef = useRef(null);
  const debounceTimeout = useRef(0);

  /**
   * Check the response of the API call to be valid and handle any failures along the way
   *
   * @param {boolean} errored - Represents whether an error occurred in the process of making the API call itself
   * @param {Product[]|{ success: boolean, message: string }} response - The response JSON object
   * @returns {boolean} Whether validation has passed or not
   */
  const validateResponse = useCallback((errored, response) => {
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
   * Perform the API call over the network and return the response
   *
   * @returns {Promise<Product[]|undefined>} The response JSON object
   */
  const performAPICall = useCallback(async () => {
    let response = {};
    let errored = false;

    setLoading(true);

    try {
      const res = await fetch(`${config.endpoint}/products`);
      response = await res.json();
    } catch (e) {
      errored = true;
    }

    setLoading(false);

    if (validateResponse(errored, response)) {
      return response;
    }
  }, [validateResponse]);

  /**
   * Function to fetch list of products from backend and update state variable
   */
  const getProducts = useCallback(async () => {
    const response = await performAPICall();

    if (response) {
      setProducts(response);
      setFilteredProducts(response.slice());
    }
  }, [performAPICall]);

  /**
   * Definition for search handler
   * This is the function that is called when the user clicks on the search button or the debounce timer is executed
   *
   * @param {string} text - Search bar input query text
   */
  const search = useCallback((text) => {
    setFilteredProducts(
      products.filter(
        (product) =>
          product.name.toUpperCase().includes(text.toUpperCase()) ||
          product.category.toUpperCase().includes(text.toUpperCase())
      )
    );
  }, [products]);

  /**
   * Definition for debounce handler
   * This is the function that is called whenever the user types or changes the text in the searchbar field
   *
   * @param {{ target: { value: string } }} event - JS event object emitted from the search input field
   */
  const debounceSearch = useCallback((event) => {
    const value = event.target.value;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      search(value);
    }, 300);
  }, [search]);

  /**
   * Creates the responsive view for a product item
   *
   * @param {Product} product - The product object
   * @returns {JSX.Element} HTML and JSX to be rendered
   */
  const getProductElement = useCallback((product) => {
    return (
      <Col xs={24} sm={12} xl={6} key={product._id}>
        <Product
          product={product}
          addToCart={() => {
            if (loggedIn) {
              cartRef.current?.postToCart(product._id, 1, true);
            } else {
              navigate("/login");
            }
          }}
        />
      </Col>
    );
  }, [loggedIn, navigate]);

  // ComponentDidMount equivalent - Fetch products and check login status
  useEffect(() => {
    getProducts();

    if (localStorage.getItem("email") && localStorage.getItem("token")) {
      setLoggedIn(true);
    }
  }, [getProducts]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return (
    <>
      {/* Display Header with Search bar */}
      <Header>
        <Input.Search
          placeholder="Search"
          onSearch={search}
          onChange={debounceSearch}
          enterButton={true}
        />
      </Header>

      {/* Use Antd Row/Col components to display products and cart as columns in the same row*/}
      <Row>
        {/* Display products */}
        <Col
          xs={{ span: 24 }}
          md={{ span: loggedIn && products.length ? 18 : 24 }}
        >
          <div className="search-container">
            {/* Display each product item wrapped in a Col component */}
            <Row>
              {products.length !== 0 ? (
                filteredProducts.map((product) => getProductElement(product))
              ) : loading ? (
                <div className="loading-text">Loading products...</div>
              ) : (
                <div className="loading-text">No products to list</div>
              )}
            </Row>
          </div>
        </Col>

        {/* Display cart */}
        {loggedIn && products.length && (
          <Col xs={{ span: 24 }} md={{ span: 6 }} className="search-cart">
            <div>
              <Cart
                ref={cartRef}
                products={products}
                token={localStorage.getItem("token")}
              />
            </div>
          </Col>
        )}
      </Row>

      {/* Display the footer */}
      <Footer />
    </>
  );
};

export default Search;