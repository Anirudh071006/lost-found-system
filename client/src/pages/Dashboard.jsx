import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    type: "Lost",
    location: "",
    date: "",
    contactInfo: "",
  });

  const [message, setMessage] = useState("");
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);

  // Fetch items
  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API}/items`);
      setItems(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Auth check + load items
  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/login");
    return;
  }

  const loadItems = async () => {
    await fetchItems();
  };

  loadItems();
}, [navigate]);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      itemName: "",
      description: "",
      type: "Lost",
      location: "",
      date: "",
      contactInfo: "",
    });
    setEditId(null);
  };

  // Add or Update item
  const handleAddOrUpdateItem = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (editId) {
        const res = await axios.put(`${API}/items/${editId}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMessage(res.data.message);
      } else {
        const res = await axios.post(`${API}/items`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMessage(res.data.message);
      }

      resetForm();
      fetchItems();
    } catch (error) {
      setMessage(error.response?.data?.message || "Operation failed");
    }
  };

  // Edit item
  const handleEdit = (item) => {
    setEditId(item._id);
    setFormData({
      itemName: item.itemName,
      description: item.description,
      type: item.type,
      location: item.location,
      date: item.date ? item.date.split("T")[0] : "",
      contactInfo: item.contactInfo,
    });
  };

  // Delete item
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.delete(`${API}/items/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(res.data.message);
      fetchItems();
    } catch (error) {
      setMessage(error.response?.data?.message || "Delete failed");
    }
  };

  // Search
  const handleSearch = async () => {
    try {
      if (search.trim() === "") {
        fetchItems();
        return;
      }

      const res = await axios.get(`${API}/items/search?name=${search}`);
      setItems(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

 return (
  <div className="container mt-4">
    
    {/* HEADER */}
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2>Lost & Found Dashboard</h2>
      <button className="btn btn-danger" onClick={handleLogout}>
        Logout
      </button>
    </div>

    <p className="mb-4">
      Welcome <strong>{user?.name || "User"}</strong>
    </p>

    {/* FORM CARD */}
    <div className="card p-4 mb-4 shadow-sm">
      <h4 className="mb-3">{editId ? "Update Item" : "Add Item"}</h4>

      <form onSubmit={handleAddOrUpdateItem}>
        <div className="row">
          <div className="col-md-6 mb-2">
            <input className="form-control" name="itemName" placeholder="Item Name" value={formData.itemName} onChange={handleChange} />
          </div>

          <div className="col-md-6 mb-2">
            <input className="form-control" name="location" placeholder="Location" value={formData.location} onChange={handleChange} />
          </div>

          <div className="col-md-6 mb-2">
            <input className="form-control" name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
          </div>

          <div className="col-md-6 mb-2">
            <input className="form-control" name="contactInfo" placeholder="Contact Info" value={formData.contactInfo} onChange={handleChange} />
          </div>

          <div className="col-md-6 mb-2">
            <select className="form-control" name="type" value={formData.type} onChange={handleChange}>
              <option value="Lost">Lost</option>
              <option value="Found">Found</option>
            </select>
          </div>

          <div className="col-md-6 mb-2">
            <input className="form-control" type="date" name="date" value={formData.date} onChange={handleChange} />
          </div>
        </div>

        <button className="btn btn-primary mt-3">
          {editId ? "Update Item" : "Add Item"}
        </button>

        {editId && (
          <button type="button" className="btn btn-secondary ms-2 mt-3" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      <p className="mt-2 text-success">{message}</p>
    </div>

    {/* SEARCH */}
    <div className="card p-3 mb-4 shadow-sm">
      <h5>Search Items</h5>

      <div className="d-flex gap-2">
        <input
          className="form-control"
          placeholder="Search by item name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-info" onClick={handleSearch}>
          Search
        </button>
        <button className="btn btn-secondary" onClick={fetchItems}>
          Reset
        </button>
      </div>
    </div>

    {/* ITEMS */}
    <div>
      <h4 className="mb-3">All Items</h4>

      {items.length === 0 ? (
        <p>No items found</p>
      ) : (
        <div className="row">
          {items.map((item) => (
            <div key={item._id} className="col-md-6 col-lg-4">
              <div className="card mb-3 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{item.itemName}</h5>
                  <p className="card-text">{item.description}</p>

                  <p><b>Type:</b> {item.type}</p>
                  <p><b>Location:</b> {item.location}</p>
                  <p><b>Date:</b> {new Date(item.date).toLocaleDateString()}</p>
                  <p><b>Contact:</b> {item.contactInfo}</p>
                  <p><b>By:</b> {item.user?.name}</p>

                  {item.user?._id === user?._id && (
                    <div className="mt-2">
                      <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(item)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

  </div>
);
}

export default Dashboard;