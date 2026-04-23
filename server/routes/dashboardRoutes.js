const express = require("express");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", protect, (req, res) => {
  res.status(200).json({
    message: "Welcome to dashboard",
    user: req.user,
  });
});

module.exports = router;