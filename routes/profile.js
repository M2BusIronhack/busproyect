const express = require("express");
const passport = require("passport");
const profileRoute = express.Router();
const User = require("../models/User");
const Comment = require("../models/Comment");
const uploadCloud = require("../config/cloudinary.js");
const FavLine = require("../models/FavLine");
// Show profile detail
profileRoute.get("/", (req, res, next) => {
  Comment.find({ user: res.locals.user._id }).then(comments => {
    let hasFav = false;
    let favLines = [];
    FavLine.find({ user: res.locals.user._id })
      .then(favLinesUser => {
        if (favLinesUser.length != 0) {
          hasFav = true;
          favLines = favLinesUser;
        }
      })
      .then(() => {
        if (comments.length === 0) {
          res.render("profile/profile", { favLines });
        } else {
          res.render("profile/profile", { comments, favLines });
        }
      });
  });
});

// Udpate and show prolife update form
profileRoute.get("/:id/edit", (req, res) => {
  User.findById(res.locals.user._id).then(user => {
    res.render("profile/profile_edit", { user });
  });
});

// Udpate profile in DB
profileRoute.post("/:id/edit", uploadCloud.single("photo"), (req, res) => {
  let urlFile;
  if (
    req.file === undefined &&
    res.locals.user.img ==
      "http://www.katakrak.net/sites/default/files/default_images/default_profile_0.jpg"
  ) {
    urlFile = res.locals.user.img;
  } else if (req.file != undefined) {
    urlFile = req.file.url;
  } else {
    urlFile = res.locals.user.img;
  }

  const updates = {
    username: req.body.username,
    email: req.body.email,
    img: urlFile
  };

  User.findByIdAndUpdate(req.params.id, updates).then(() => {
    res.redirect("/profile");
  });
});

module.exports = profileRoute;
