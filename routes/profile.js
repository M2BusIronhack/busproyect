const express = require("express");
const passport = require("passport");
const profileRoute = express.Router();
const User = require("../models/User");
const Comment = require("../models/Comment");
const uploadCloud = require("../config/cloudinary.js");

// Show profile detail
profileRoute.get("/", (req, res, next) => {
  Comment.find({ user: res.locals.user._id }).then(comments => {
      console.log(comments)
    if (comments.length === 0) {
      res.render("profile/profile");
    } else {
      res.render("profile/profile", { comments });
    }
  });
});

// Udpate and show prolife update form
profileRoute.get("/:id/edit", (req, res) => {
  // User.findById(req.params.id)
  User.findById(res.locals.user._id).then(user => {
    res.render("profile/profile_edit", { user });
  });
});

// Udpate profile in DB
profileRoute.post("/:id/edit", uploadCloud.single("photo"), (req, res) => {
  // const { username, email, password,commentBody } = req.body;
  // const {img} = req.file.url;
  // let updates = { username, email, password, commentBody  };
  // updates = {img};
  const updates = {
    username: req.body.username,
    email: req.body.email,
    // commentBody: req.body.commentBody,
    img: req.file.url
  };

  User.findByIdAndUpdate(req.params.id, updates).then(() => {
    res.redirect("/profile");
  });
});

module.exports = profileRoute;
