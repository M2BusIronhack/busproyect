const express = require("express");
const passport = require("passport");
const commentRouter = express.Router();
const axios = require("axios");
const qs = require("qs");
const Comment = require("../models/Comment");

commentRouter.get("/delete/:id", (req, res, next) => {
  Comment.findByIdAndRemove(req.params.id)
    .then(() => {
      console.log("comentario borrado");
      res.redirect("/profile");
    })
    .catch(err => next(err));
});

commentRouter.get("/new/:id", (req, res, next) => {
  let selectedLine = req.params.id;

  res.render("comment/newComment", { selectedLine });
});

commentRouter.post("/new/:id", (req, res, next) => {
  const { title, commentBody, rating, rain, date } = req.body;
  console.log(date);
  let partDate = date.split("-");
  let formatedDate = `${partDate[2]}/${partDate[1]}/${partDate[0]}`;

  const comment = new Comment({
    user: req.user.id,
    title,
    commentBody,
    rating,
    rain,
    date: formatedDate,
    line: req.params.id
  });

  comment
    .save()
    .then(() => {
      console.log("all good");
      res.redirect(`/line/${req.params.id}`);
    })
    .catch(err => next(err));
});

module.exports = commentRouter;
