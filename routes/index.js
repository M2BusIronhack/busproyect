const express = require("express");
const router = express.Router();
const axios = require("axios");
const multer = require('multer');
const qs = require("qs");
const User = require("../models/User");


/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index", { user: req.user });
});

module.exports = router;
