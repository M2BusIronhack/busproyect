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
  const comment = new Comment({
    user: req.user.id,
    title,
    commentBody,
    rating,
    rain,
    date,
    line: req.params.id
  });
  comment
    .save()
    .then(() => {
      console.log("all good");
      res.redirect(`/comment/${req.params.id}`)
    })
    .catch(err => next(err));
});

commentRouter.get("/:lineID", (req, res, next) => {
  let selectedLine = req.params.lineID;

  let api_url =
    "https://openbus.emtmadrid.es:9443/emt-proxy-server/last/bus/GetListLinesExtend.php";

  const params = {
    idClient: "WEB.SERV.lunafidalgo@gmail.com",
    passKey: "7C6C9B0A-F2FA-4F74-8568-3D2858C136ED",
    Lines: selectedLine,
    SelectDate: "20/04/2018"
  };

  axios
    .post(api_url, qs.stringify(params), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    .then(infoApi => {
      Comment.find({ line: selectedLine })
        .then(comments => {
          let infoLine = infoApi.data.resultValues;
          if (comments.length === 0) {
            res.render("line", { infoLine });
          } else {
            res.render("line", { comments, infoLine });
          }
        })
        .catch(err => console.log(err));

      // res.render("error");
    })
    .catch(e => console.log(e));
});

module.exports = commentRouter;
