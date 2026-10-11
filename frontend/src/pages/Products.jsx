import { Input, message, Row, Col } from "antd";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "../config";
import Cart from "../components/Cart";
import Header from "../components/Header";
import Product from "../components/Product";
import Footer from "../components/Footer";
import "./Products.css";

const Products = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loggedIn] = useState(
    () => Boolean(localStorage.getItem("email") && localStorage.getItem("token"))
  );
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [products, setProducts] = useState([]);

  const cartRef = useRef(null);
  const debounceTimeout = useRef(0);

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

  const search = useCallback((text) => {
    setFilteredProducts(
      products.filter(
        (product) =>
          product.name.toUpperCase().includes(text.toUpperCase()) ||
          product.category.toUpperCase().includes(text.toUpperCase())
      )
    );
  }, [products]);

  const debounceSearch = useCallback((event) => {
    const value = event.target.value;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      search(value);
    }, 300);
  }, [search]);

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

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      let response = {};
      let errored = false;

      try {
        const res = await fetch(config.endpoint + "/products");
        response = await res.json();
      } catch {
        errored = true;
      }

      if (!active) return;
      setLoading(false);

      if (validateResponse(errored, response)) {
        setProducts(response);
        setFilteredProducts(response.slice());
      }
    };

    void loadProducts();
    return () => {
      active = false;
    };
  }, [validateResponse]);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  return (
    <>

      <Header>
        <Input.Search
          placeholder="Search"
          onSearch={search}
          onChange={debounceSearch}
          enterButton={true}
        />
      </Header>

      <Row>

        <Col
          xs={{ span: 24 }}
          md={{ span: loggedIn && products.length ? 18 : 24 }}
        >
          <div className="search-container">

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

        {loggedIn && products.length && (
          <Col xs={{ span: 24 }} md={{ span: 6 }} className="search-cart">
            <div>
              <Cart
                ref={cartRef}
                products={products}
                token={localStorage.getItem("token")}
                navigate={navigate}
              />
            </div>
          </Col>
        )}
      </Row>

      <Footer />
    </>
  );
};

export default Products;