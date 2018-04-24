// idClient: "WEB.SERV.lunafidalgo@gmail.com",
// passKey: "7C6C9B0A-F2FA-4F74-8568-3D2858C136ED",
// Lines: "1",
// SelectDate: "20/04/2017"

document.addEventListener(
  "DOMContentLoaded",
  () => {
    let api_url =
      "https://openbus.emtmadrid.es:9443/emt-proxy-server/last/bus/GetListLines.php";

    let params = new URLSearchParams();
    params.append("idClient", "WEB.SERV.lunafidalgo@gmail.com");
    params.append("passKey", "7C6C9B0A-F2FA-4F74-8568-3D2858C136ED");
    //params.append("Lines", "");
    params.append("SelectDate", "20/04/2018");

    getListLines(api_url, params);
  },
  false
);

const getListLines = (url, params) => {
  axios
    .post(url, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    .then(a => {
      let infoLines = document.getElementById("info-lines");
      let select = document.createElement("select");
      select.id = "lines";
      infoLines.appendChild(select);

      a.data.resultValues.forEach(e => {
        let info = `${e.label}: ${e.nameA}-${e.nameB}`;
        let option = document.createElement("option");
        option.value = e.label;
        option.innerHTML = info;
        select.appendChild(option);
      });

      let showStops = document.createElement("button");
      showStops.addEventListener("click", e => {
        // const datos = getParadas()
        // drawParadas(datos)
        let lines = document.getElementById("lines");
        let selectedLine = lines.options[lines.selectedIndex].value;
        let api_url =
          "https://openbus.emtmadrid.es:9443/emt-proxy-server/last/bus/GetRouteLines.php";

        let parametros = new URLSearchParams();
        parametros.append("idClient", "WEB.SERV.lunafidalgo@gmail.com");
        parametros.append("passKey", "7C6C9B0A-F2FA-4F74-8568-3D2858C136ED");
        parametros.append("Lines", selectedLine);
        parametros.append("SelectDate", "20/04/2018");

        axios
          .post(api_url, parametros, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          })
          .then(a => {
            //segunda vez que dibuja el desplegable
            //pero con las paradas

            let infoLines = document.getElementById("line-stop");
            let select = document.createElement("select");
            select.id = "start";
            infoLines.appendChild(select);

            a.data.resultValues.forEach(e => {
              setDataValues(e, select);
            });

            let selectEnd = document.createElement("select");
            selectEnd.id = "end";
            infoLines.appendChild(selectEnd);

            a.data.resultValues.forEach(e => {
              setDataValues(e, selectEnd);
            });

            let showTime = document.createElement("button");
            showTime.innerHTML = "¿hay tráfico?";
            showTime.addEventListener("click", e => {
              getStopSelectedInfo(selectedLine);
            });

            infoLines.appendChild(showTime);

            // console.log(a);
          });
      });
      showStops.innerHTML = "ver paradas";
      infoLines.appendChild(showStops);
    })
    .catch(e => console.log(e));
};

const setDataValues = (e, select) => {
  let info = `${e.node}: ${e.name}`;
  let option = document.createElement("option");
  option.value = e.node;
  option.innerHTML = info;
  option.setAttribute("lat", e.latitude);
  option.setAttribute("lng", e.longitude);
  select.appendChild(option);
};

const getStopSelectedInfo = selectedLine => {
  let startPoint = document.getElementById("start");
  let stopStartSelected = startPoint.options[startPoint.selectedIndex];

  const startPointObj = {
    node: stopStartSelected.value,
    line: selectedLine,
    long: stopStartSelected.getAttribute("lng"),
    lat: stopStartSelected.getAttribute("lat")
  };
 // console.log(startPointObj);

  let endPoint = document.getElementById("end");
  let stopEndSelected = endPoint.options[endPoint.selectedIndex];
  const endPointObj = {
    node: stopEndSelected.value,
    line: selectedLine,
    long: stopEndSelected.getAttribute("lng"),
    lat: stopEndSelected.getAttribute("lat")
  };
  //console.log(endPointObj);
};
