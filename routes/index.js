const express = require("express");
const router = express.Router();
const axios = require("axios");
const qs = require("qs");


/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index", { user: req.user });
});


module.exports = router;
