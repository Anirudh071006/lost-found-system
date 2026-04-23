const express = require("express");
const Item = require("../models/Item");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Add item
router.post("/items", protect, async (req, res) => {
  try {
    const { itemName, description, type, location, date, contactInfo } = req.body;

    const item = await Item.create({
      itemName,
      description,
      type,
      location,
      date,
      contactInfo,
      user: req.user._id,
    });

    res.status(201).json({ message: "Item added successfully", item });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all items
router.get("/items", async (req, res) => {
  try {
    const items = await Item.find().populate("user", "name email");
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Search items by name
router.get("/items/search", async (req, res) => {
  try {
    const { name } = req.query;

    const items = await Item.find({
      itemName: { $regex: name, $options: "i" },
    }).populate("user", "name email");

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get item by ID
router.get("/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("user", "name email");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update item
router.put("/items/:id", protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to update this item" });
    }

    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({ message: "Item updated successfully", updatedItem });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete item
router.delete("/items/:id", protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to delete this item" });
    }

    await item.deleteOne();

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;