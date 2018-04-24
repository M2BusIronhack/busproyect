const express = require("express");
const router = express.Router();
const axios = require("axios");
const qs = require("qs");


/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index", { user: req.user });
});

router.get("/:id", (req, res, next) => {
  //console.log(req.body.id_route);
  console.log("eeee"+req.params.id)
  let api_url =
    "https://openbus.emtmadrid.es:9443/emt-proxy-server/last/bus/GetRouteLines.php";

  const params = {
    idClient: "WEB.SERV.lunafidalgo@gmail.com",
    passKey: "7C6C9B0A-F2FA-4F74-8568-3D2858C136ED",
    Lines: req.body.id_route,
    SelectDate: "20/04/2018"
  };

  axios
    .post(api_url, qs.stringify(params), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    .then(a => {
      console.log("??")
      //console.log(a.data.resultValues);
      res.render("error");
    })
    .catch(e => console.log(e));
});

// router.get("/lineStops", (req, res, next) => {
// console.log("llega aqui")
//   res.render("lineStops");
// });

module.exports = router;
