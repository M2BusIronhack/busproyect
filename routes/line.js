const express = require("express");
const passport = require("passport");
const lineRoute = express.Router();
const axios = require("axios");
const qs = require("qs");
const Comment = require("../models/Comment");
const FavLine = require("../models/FavLine");

lineRoute.get("/fav/:lineID", (req, res, next) => {
  const favLine = new FavLine({
    user: res.locals.user._id,
    line: req.params.lineID
  });
  favLine.save().then(a => {
    console.log("linea favorita creada");
    res.redirect(`/line/${req.params.lineID}`);
  });
});

lineRoute.get("/delete/:lineID", (req, res, next) => {
  FavLine.findOneAndRemove({
    $and: [{ user: res.locals.user._id }, { line: req.params.lineID }]
  }).then(() => {
    console.log("FAV BORRADO");
    res.redirect("/profile");
  });
});

lineRoute.get("/:lineID", (req, res, next) => {
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
          let hasFav = false;
          //cuando renderizas la vista de la linea & hay un usuario logeado
          //tiene que salir si esa linea es favorita o no

          if (res.locals.user) {
            //hay un usuario logeado
            FavLine.find({
              $and: [{ user: res.locals.user._id }, { line: selectedLine }]
            })
              .then(favLine => {
                if (favLine.length != 0) hasFav = true;
                //no tiene favoritos
              })
              .then(() => {
                let infoLine = infoApi.data.resultValues;
                if (comments.length === 0) {
                  res.render("line", { infoLine, hasFav });
                } else {
                  res.render("line", { comments, infoLine, hasFav });
                }
              });
          }
        })
        .catch(err => console.log(err));

      // res.render("error");
    })
    .catch(e => console.log(e));
});

module.exports = lineRoute;
