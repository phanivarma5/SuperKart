import React, { useState } from "react";
import Layout from "./../components/Layout/Layout";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import "../styles/CartStyles.css";

const CartPage = () => {
  const [auth] = useAuth();
  const [cart, setCart] = useCart();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const navigate = useNavigate();

  const totalPrice = () => {
    try {
      let total = 0;
      cart?.map((item) => {
        total = total + item.price;
      });
      return total.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const removeCartItem = (pid) => {
    try {
      let myCart = [...cart];
      let index = myCart.findIndex((item) => item._id === pid);
      myCart.splice(index, 1);
      setCart(myCart);
      localStorage.setItem("cart", JSON.stringify(myCart));
    } catch (error) {
      console.log(error);
    }
  };

  // Razorpay payment handler
  const handlePayment = async () => {
    try {
      if (!selectedDate || !selectedSlot) {
        toast.error("Please select a delivery date and time slot");
        return;
      }

      setLoading(true);

      // Create order on backend
      const { data } = await axios.post("https://superkartbackend.onrender.com/api/v1/payment/razorpay/order", {
        amount: cart.reduce((acc, item) => acc + item.price, 0) * 100, // in paise
        cart,
        deliveryDate: selectedDate,
        deliverySlot: selectedSlot,
      });

      const options = {
        key: "YOUR_RAZORPAY_KEY_ID", // Replace with your Razorpay key id
        amount: data.amount,
        currency: data.currency,
        name: "EzyZip",
        description: "Order Payment",
        order_id: data.id,
        handler: async function (response) {
          try {
            // Verify payment on backend
            await axios.post("https://superkartbackend.onrender.com/api/v1/payment/razorpay/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              cart,
              deliveryDate: selectedDate,
              deliverySlot: selectedSlot,
            });
            localStorage.removeItem("cart");
            setCart([]);
            navigate("/dashboard/user/orders");
            toast.success("Payment completed successfully!");
          } catch (err) {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: auth?.user?.name || "",
          email: auth?.user?.email || "",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
      setLoading(false);
    }
  };

  // Load Razorpay script
  React.useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() + 7);
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 14);

  const generateDateOptions = () => {
    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const formatDate = (date) =>
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  return (
    <Layout>
      <div className="cart-page">
        <div className="row">
          <div className="col-md-12">
            <h1 className="text-center bg-light p-2 mb-1">
              {!auth?.user
                ? "Hello Guest"
                : `Hello  ${auth?.token && auth?.user?.name}`}
              <p className="text-center">
                {cart?.length
                  ? `You Have ${cart.length} items in your cart ${
                      auth?.token ? "" : "please login to checkout !"
                    }`
                  : " Your Cart Is Empty"}
              </p>
            </h1>
          </div>
        </div>
        <div className="container">
          <div className="row">
            <div className="col-md-7 p-0 m-0">
              {cart?.map((p) => (
                <div className="row card flex-row" key={p._id}>
                  <div className="col-md-4">
                    <img
                      src={`/api/v1/product/product-photo/${p._id}`}
                      className="card-img-top"
                      alt={p.name}
                      width="100%"
                      height={"130px"}
                    />
                  </div>
                  <div className="col-md-4">
                    <p>{p.name}</p>
                    <p>{p.description.substring(0, 30)}</p>
                    <p>Price : {p.price}</p>
                  </div>
                  <div className="col-md-4 cart-remove-btn">
                    <button
                      className="btn btn-danger"
                      onClick={() => removeCartItem(p._id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-md-5 cart-summary">
              <h2>Cart Summary</h2>
              <p>Total | Checkout | Payment</p>
              <hr />
              <h4>Total : {totalPrice()} </h4>

              {auth?.user?.address ? (
                <div className="mb-3">
                  <h4>Current Address</h4>
                  <h5>{auth?.user?.address}</h5>
                  <button
                    className="btn btn-outline-warning"
                    onClick={() => navigate("/dashboard/user/profile")}
                  >
                    Update Address
                  </button>
                </div>
              ) : (
                <div className="mb-3">
                  {auth?.token ? (
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate("/dashboard/user/profile")}
                    >
                      Update Address
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-warning"
                      onClick={() =>
                        navigate("/login", { state: "/cart" })
                      }
                    >
                      Please Login to checkout
                    </button>
                  )}
                </div>
              )}

              {/* Delivery Date & Slot Selection */}
              <div className="mb-3">
                <h4>Select Delivery Date</h4>
                <select
                  className="form-control"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                >
                  <option value="">-- Select a Date --</option>
                  {generateDateOptions().map((date, i) => (
                    <option key={i} value={formatDate(date)}>
                      {formatDate(date)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <h4>Select Delivery Slot</h4>
                <select
                  className="form-control"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                >
                  <option value="">-- Select a Slot --</option>
                  <option value="9AM-12PM">9AM - 12PM</option>
                  <option value="12PM-3PM">12PM - 3PM</option>
                  <option value="3PM-6PM">3PM - 6PM</option>
                  <option value="6PM-9PM">6PM - 9PM</option>
                </select>
              </div>

              <div className="mt-2">
                <button
                  className="btn btn-primary"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? "Processing ...." : "Make Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
// ...existing code...