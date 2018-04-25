const express = require("express");
const router = express.Router();
const axios = require("axios");
const multer = require('multer');
const qs = require("qs");
const User = require("../models/User");



router.get("/", (req, res, next) => {
  res.render("index", { user: req.user });
});

/* GET home page */
router.get("/index", (req, res, next) => {
  res.render("indexLines", { user: req.user });
});


module.exports = router;
