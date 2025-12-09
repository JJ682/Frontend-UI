import React, { useEffect, useState } from "react";
import axios from "axios";
import "./menuPage.css";

const API_BASE = "http://localhost:5000";

const TABS = [
  { id: "food", label: "FOOD" },
  { id: "drink", label: "DRINKS" },
];

// You can change these to match your DB categories
const FOOD_CATEGORIES = ["Burger", "Pizza", "Starter", "Dessert"];
const DRINK_CATEGORIES = ["Juice", "Cola", "Mocktail", "Coffee", "Tea"];

// very simple hard-coded admin login
const ADMIN_USERNAME = "jacob";
const ADMIN_PASSWORD = "jacob123";

/* -------------------- Admin Form -------------------- */
function AdminForm({ onCreated }) {
  const [form, setForm] = useState({
    type: "food",
    category: "",
    price: "",
    available: true,
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      setLoading(true);

      // Auto-generate name (you can change this to have real input)
      const autoName =
        form.category || (form.type === "food" ? "Food Item" : "Drink Item");

      const payload = {
        ...form,
        name: autoName,
        description: "",
        price: Number(form.price),
      };

      const res = await axios.post(`${API_BASE}/api/menu`, payload);

      setMsg("Item created successfully ✅");
      setForm({
        type: "food",
        category: "",
        price: "",
        available: true,
      });

      onCreated && onCreated(res.data);
    } catch (err) {
      console.error(err);
      setMsg("Failed to create item ❌");
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions =
    form.type === "food" ? FOOD_CATEGORIES : DRINK_CATEGORIES;

  return (
    <div className="admin-card">
      <h2 className="admin-title">Admin • Add Menu Item</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Type</label>
          <select name="type" value={form.type} onChange={handleChange}>
            <option value="food">Food</option>
            <option value="drink">Drink</option>
          </select>
        </div>

        <div className="form-row">
          <label>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Price (₹)</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row checkbox-row">
          <label>Available</label>
          <input
            type="checkbox"
            name="available"
            checked={form.available}
            onChange={handleChange}
          />
        </div>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Add Item"}
        </button>

        {msg && <p className="form-msg">{msg}</p>}
      </form>
    </div>
  );
}

/* -------------------- Main Page -------------------- */
function MenuPage() {
  const [activeSection, setActiveSection] = useState("home"); 
  const [activeTab, setActiveTab] = useState("food"); 
  const [selectedCategory, setSelectedCategory] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminMsg, setAdminMsg] = useState("");

  const currentCategories =
    activeTab === "food" ? FOOD_CATEGORIES : DRINK_CATEGORIES;

  const fetchMenu = async (type, category) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/menu`, {
        params: {
          type,
          category: category || undefined,
        },
      });
      setMenuItems(res.data);
      setSelectedItem(res.data[0] || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // load items whenever tab or category changes
  useEffect(() => {
    fetchMenu(activeTab, selectedCategory);
  }, [activeTab, selectedCategory]);

  const handleNavClick = (section) => (e) => {
    e.preventDefault();
    setActiveSection(section);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminUser === ADMIN_USERNAME && adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setAdminMsg("");
    } else {
      setIsAdmin(false);
      setAdminMsg("Wrong admin ID or password ❌");
    }
  };

  return (
    <div className="page">
      {/* Header / Navbar */}
      <header className="hero">
        <div className="logo">
          DEEP <span>NET</span> SOFT
        </div>
        <nav className="nav">
          <a
            href="#home"
            className={activeSection === "home" ? "active" : ""}
            onClick={handleNavClick("home")}
          >
            HOME
          </a>
          <a
            href="#menu"
            className={activeSection === "menu" ? "active" : ""}
            onClick={handleNavClick("menu")}
          >
            MENU
          </a>
          <a
            href="#reservation"
            className={activeSection === "reservation" ? "active" : ""}
            onClick={handleNavClick("reservation")}
          >
            RESERVATION
          </a>
          <a
            href="#contact"
            className={activeSection === "contact" ? "active" : ""}
            onClick={handleNavClick("contact")}
          >
            CONTACT
          </a>
          <a
            href="#admin"
            className={activeSection === "admin" ? "active" : ""}
            onClick={handleNavClick("admin")}
          >
            ADMIN
          </a>
        </nav>
      </header>

      {/* HOME */}
      {activeSection === "home" && (
        <main className="content" id="home">
          <h1 className="title">WELCOME</h1>
          <p className="subtitle">
            Welcome to our premium Food & Drinks menu website. Explore delicious
            dishes, fresh juices and manage items using the admin panel.
          </p>
        </main>
      )}

      {/* MENU (user side) */}
      {activeSection === "menu" && (
        <main className="content" id="menu">
          <h1 className="title">MENU</h1>
          <p className="subtitle">
            Select food or drinks, explore descriptions, prices and live
            availability.
          </p>

          {/* Tabs */}
          <div className="tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedCategory("");
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="category-row">
            <label htmlFor="category-select">Category:</label>
            <select
              id="category-select"
              className="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All</option>
              {currentCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Layout: list + details */}
          <div className="menu-layout">
            {/* LEFT: list */}
            <div className="menu-list-card">
              {loading ? (
                <p className="loading">Loading...</p>
              ) : menuItems.length === 0 ? (
                <p className="no-items">No items found.</p>
              ) : (
                <ul className="menu-list">
                  {menuItems.map((item) => (
                    <li
                      key={item._id}
                      className={`menu-list-item ${
                        selectedItem && selectedItem._id === item._id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <div>
                        <div className="menu-list-name">{item.name}</div>
                        <div className="menu-list-meta">
                          <span>{item.category}</span>
                          <span>₹{item.price}</span>
                        </div>
                      </div>
                      <span
                        className={`avail-pill ${
                          item.available ? "available" : "unavailable"
                        }`}
                      >
                        {item.available ? "Available" : "Unavailable"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* RIGHT: details */}
            <div className="details-card">
              {selectedItem ? (
                <>
                  {selectedItem.imageUrl && (
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.name}
                      className="detail-image"
                    />
                  )}
                  <h2 className="detail-title">{selectedItem.name}</h2>
                  <p className="detail-category">
                    {selectedItem.type.toUpperCase()} • {selectedItem.category}
                  </p>
                  <p className="detail-price">₹{selectedItem.price}</p>
                  <p className="detail-desc">
                    {selectedItem.description || "No description provided."}
                  </p>
                  <p
                    className={
                      selectedItem.available
                        ? "detail-availability available"
                        : "detail-availability unavailable"
                    }
                  >
                    {selectedItem.available
                      ? "Currently available"
                      : "Currently unavailable"}
                  </p>
                </>
              ) : (
                <p className="no-items">Select an item to see details.</p>
              )}
            </div>
          </div>
        </main>
      )}

      {/* RESERVATION */}
      {activeSection === "reservation" && (
        <section className="content section-block" id="reservation">
          <h2 className="section-heading">MAKE A RESERVATION</h2>
          <p className="section-text">
            Call us at <strong>+91-9876543210</strong> or email{" "}
            <strong>reservations@deepnetsoft.com</strong> to book your table.
            Tell us your preferred date, time and number of guests.
          </p>
        </section>
      )}

      {/* CONTACT */}
      {activeSection === "contact" && (
        <section className="content section-block" id="contact">
          <h2 className="section-heading">CONTACT US</h2>
          <p className="section-text">
            DEEP NET SOFT
            <br />
            Kochi, Kerala
            <br />
            Email: <strong>info@deepnetsoft.com</strong>
            <br />
            Phone: <strong>+91-9876543210</strong>
          </p>
        </section>
      )}

      {/* ADMIN */}
      {activeSection === "admin" && (
        <section className="content section-block" id="admin">
          {!isAdmin ? (
            // Login form
            <div className="admin-card">
              <h2 className="admin-title">Admin Login</h2>
              <form className="admin-form" onSubmit={handleAdminLogin}>
                <div className="form-row">
                  <label>Admin ID</label>
                  <input
                    type="text"
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Password</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                  />
                </div>
                <button className="btn-primary" type="submit">
                  Unlock Admin
                </button>
                {adminMsg && <p className="form-msg">{adminMsg}</p>}
              </form>
            </div>
          ) : (
            <>
              <button
                className="btn-primary"
                style={{ marginBottom: "10px" }}
                onClick={() => {
                  setIsAdmin(false);
                  setAdminUser("");
                  setAdminPassword("");
                }}
              >
                Logout Admin
              </button>

              {/* Admin add form */}
              <AdminForm
                onCreated={() => {
                  fetchMenu(activeTab, selectedCategory);
                }}
              />

              {/* Admin filter: Food / Drink + Category (same as user) */}
              <h3 style={{ marginTop: "20px" }}>Manage Menu Items</h3>

              <div className="tabs" style={{ marginTop: "10px" }}>
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    className={`tab ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setSelectedCategory("");
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="category-row">
                <label htmlFor="admin-category-select">Category:</label>
                <select
                  id="admin-category-select"
                  className="category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All</option>
                  {currentCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Admin list with delete */}
              <ul className="menu-list">
                {menuItems.map((item) => (
                  <li key={item._id} className="menu-list-item">
                    <div>
                      <div className="menu-list-name">{item.name}</div>
                      <div className="menu-list-meta">
                        <span>{item.category}</span>
                        <span>₹{item.price}</span>
                      </div>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={async () => {
                        if (
                          window.confirm(`Delete ${item.name}?`)
                        ) {
                          await axios.delete(
                            `${API_BASE}/api/menu/${item._id}`
                          );
                          fetchMenu(activeTab, selectedCategory);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <div>CONNECT • info@deepnetsoft.com</div>
        <div>DEEP NET SOFT</div>
        <div>Kochi, Kerala</div>
      </footer>
    </div>
  );
}

export default MenuPage;
