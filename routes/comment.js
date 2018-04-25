const express = require("express");
const passport = require("passport");
const commentRouter = express.Router();
const axios = require("axios");
const qs = require("qs");
const Comment = require("../models/Comment");


commentRouter.get("/new/:id",(req, res, next) => {
  console.log("aaaa")
  })

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
    .then(a => {

      // Comment.find({line: selectedLine}).then( (a) => {
      //   console.log(a)
        
      // })

      res.render("line", a.data.resultValues);
   
     // res.render("error");
    })
    .catch(e => console.log(e));
});



module.exports = commentRouter;
