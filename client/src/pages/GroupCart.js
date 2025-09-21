import React, { useEffect, useState } from "react";
import axios from "axios";
import "./GroupCart.css";
import { useNavigate } from "react-router-dom";

export default function GroupCart() {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartIdInput, setCartIdInput] = useState("");
  const [newCartName, setNewCartName] = useState("");
  const [activeCartId, setActiveCartId] = useState("");
  const [items, setItems] = useState([]);

  // ✅ Fetch all carts (no id in URL)
  const fetchCarts = async () => {
    try {
      const { data } = await axios.get("https://superkartbackend.onrender.com/api/v1/group-carts");
      setCarts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Failed to load group carts");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch items of a specific cart
  const fetchData = async (id = activeCartId) => {
    if (!id) return;
    try {
      const { data } = await axios.get(`https://superkartbackend.onrender.com/api/v1/group-carts/${id}`);
      setItems(data.items || []);
    } catch (e) {
      console.error("Failed to fetch cart data", e);
    }
  };

  useEffect(() => {
    const savedCartId = localStorage.getItem("activeCartId");
    if (savedCartId) {
      setActiveCartId(savedCartId);
      fetchData(savedCartId);
    }
    fetchCarts();
  }, []);

  // whenever the active cart changes, fetch its items
  useEffect(() => {
    if (activeCartId) fetchData(activeCartId);
  }, [activeCartId]);

  const handleRemoveItem = async (itemId) => {
    try {
      await axios.delete(`https://superkartbackend.onrender.com/api/v1/group-carts/${activeCartId}/items/${itemId}`);
      fetchData();
    } catch (e) {
      console.error("Failed to remove item", e);
    }
  };

  const handleJoinCart = async () => {
    if (!cartIdInput.trim()) return;
    try {
      const { data } = await axios.get(`https://superkartbackend.onrender.com/api/v1/group-carts/${cartIdInput}`);
      if (data?._id) {
        localStorage.setItem("activeCartId", data._id);
        setActiveCartId(data._id);
        localStorage.setItem("activeCartName", data.name) ;
        alert("Joined cart");
      } else {
        alert("Cart not found");
      }
    } catch {
      alert("Cart not found");
    }
  };

  const handleCreateCart = async () => {
    if (!newCartName.trim()) return;
    try {
      // ✅ send cart name in request body
      const { data } = await axios.post("https://superkartbackend.onrender.com/api/v1/group-carts", {
        name: newCartName,
      });
      if (data?._id) {
        localStorage.setItem("activeCartId", data._id);
        localStorage.setItem("activeCartName", newCartName) ;
        setActiveCartId(data._id);
        await fetchData(data._id); // ✅ immediately load the empty cart
        fetchCarts();              // refresh list of all carts
        alert(`Created cart: ${data._id}`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to create cart");
    }
  };

  const handleShareCart = () => {
    if (!activeCartId) return alert("No active cart to share");
    navigator.clipboard.writeText(activeCartId);
    alert("Cart link copied: " + activeCartId);
  };

  const handleRemoveCart = () => {
    if (!activeCartId) return alert("No active cart to remove");
    localStorage.removeItem("activeCartId");
    setActiveCartId("");
    setItems([]);
    alert("Cart removed");
  };

  if (loading) return <div className="gc-loading">Loading...</div>;
  if (error) return <div className="gc-error">{error}</div>;

  return (
    <div className="gc-container">
      <div className="gc-card">
        <h1 className="gc-title">Group Cart</h1>

        {/* Join / Create */}
        {!activeCartId && (
          <div className="gc-section">
            <h3>Enter Cart ID</h3>
            <div className="gc-input-group">
              <input
                type="text"
                value={cartIdInput}
                onChange={(e) => setCartIdInput(e.target.value)}
                placeholder="Enter cart ID"
              />
              <button onClick={handleJoinCart}>Join</button>
              <input
                type="text"
                value={newCartName}
                onChange={(e) => setNewCartName(e.target.value)}
                placeholder="New cart name"
              />
              <button onClick={handleCreateCart}>Create</button>
            </div>
          </div>
        )}

        {/* Share / Remove */}
        {activeCartId && (
          <div className=" hello gc-section">
            <h3>{}'s</h3>
            
            <div>
            <button className="gc-share-btn temp" onClick={handleShareCart}>
              Copy CartID
            </button>
            <button className="gc-share-btn temp" onClick={handleRemoveCart}>
              Remove Cart
            </button>
            </div>
          </div>
        )}

        {/* Items */}
        {activeCartId && (
          <div className="gc-section">
            <div className="hello">
            <h3 className="">🛒 Cart Items</h3>
            <button className="gc-share-btn" onClick={()=>{window.location.href='/'}}>
              Add Items
            </button>
            </div>
            {items.length === 0 ? (
              <div>
              <p className="gc-empty">No items in this cart</p>
            </div>
            ) : (
              <div className="gc-items-grid">
                {items.map((item) => (
                  <div className="gc-item-card" key={item._id}>
                    <div className="gc-item-info">
                      <h4 className="gc-item-title">{item.title}</h4>
                      <p className="gc-item-price">₹{item.priceSnapshot}</p>
                      <p className="gc-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <button
                      className="gc-remove-btn"
                      onClick={() => handleRemoveItem(item._id)}
                    >
                      ✖ Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        )}
      </div>
    </div>
  );
}
