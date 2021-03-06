const express = require("express");
const passport = require("passport");
const authRoutes = express.Router();
const User = require("../models/User");
const ensureLoggedIn = require('../config/middleware/ensureLoggedIn');
const ensureLoggedOut = require('../config/middleware/ensureLoggedOut');

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

authRoutes.get("/login", ensureLoggedOut("/"), (req, res, next) => {
  res.render("auth/login", { message: req.flash("error") });
});

authRoutes.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true,
    passReqToCallback: true
  })
);

authRoutes.get("/signup", ensureLoggedOut('/'), (req, res, next) => {
  res.render("auth/signup");
});

authRoutes.post("/signup",  (req, res, next) => {
  const { username, email, password } = req.body;

  if (username === "" || password === "" || email === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ email }, "email", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "The email already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashPass, 
      img: "http://www.katakrak.net/sites/default/files/default_images/default_profile_0.jpg"
    });

    newUser.save(err => {
      if (err) {
        res.render("auth/signup", { message: "Something went wrong" });
      } else {
        res.redirect("/");
      }
    });
  });
});

authRoutes.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = authRoutes;
