// idClient: "WEB.SERV.lunafidalgo@gmail.com",
// passKey: "7C6C9B0A-F2FA-4F74-8568-3D2858C136ED",
// Lines: "1",
// SelectDate: "20/04/2017"
let averageTimes = [];
let timeRoutePromises = [];
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
      let selectLines = document.getElementById("lines");

      a.data.resultValues.forEach(e => {
        let info = `${e.label}: ${e.nameA}-${e.nameB}`;
        let option = document.createElement("option");
        option.value = e.label;
        option.innerHTML = info;
        selectLines.appendChild(option);
      });

      let showStops = document.getElementById("show-stops");
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
            let selectStart = document.getElementById("start");
            a.data.resultValues.forEach(e => {
              setDataValues(e, selectStart);
            });
            let selectEnd = document.getElementById("end");
            a.data.resultValues.forEach(e => {
              setDataValues(e, selectEnd);
            });

            let showTime = document.getElementById("see-traffic");

            let linkToBack = document.getElementById("see-comments");
            console.log(linkToBack);
            linkToBack.setAttribute("href", `comment/${selectedLine}`);
            infoLines.appendChild(linkToBack);

            showTime.addEventListener("click", e => {
              let startEndObj = getStopSelectedInfo(selectedLine);

              initMap(startEndObj[0], startEndObj[1], selectedLine);

              let time = convertToSec(new Date(), 5);
              console.log(time);
              time.forEach(e =>
                timeRoutePromises.push(
                  calculateTimeRoute(
                    startEndObj[0],
                    startEndObj[1],
                    selectedLine,
                    e
                  )
                )
              );
              Promise.all(timeRoutePromises).then(timeInfo => {
                console.log(timeInfo);
                let total = averageTimes.reduce((total, num) => {
                  return total + num;
                });
                console.log(total / averageTimes.length);
              });
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
    lng: stopStartSelected.getAttribute("lng"),
    lat: stopStartSelected.getAttribute("lat")
  };
  console.log(startPointObj);

  let endPoint = document.getElementById("end");
  let stopEndSelected = endPoint.options[endPoint.selectedIndex];
  const endPointObj = {
    node: stopEndSelected.value,
    line: selectedLine,
    lng: stopEndSelected.getAttribute("lng"),
    lat: stopEndSelected.getAttribute("lat")
  };

  return [startPointObj, endPointObj];
};

const initMap = (start, end, line) => {
  var pointA = new google.maps.LatLng(start.lat, start.lng),
    pointB = new google.maps.LatLng(end.lat, end.lng),
    myOptions = {
      zoom: 7,
      center: pointA
    },
    map = new google.maps.Map(document.getElementById("map"), myOptions),
    // Instantiate a directions service.
    directionsService = new google.maps.DirectionsService(),
    directionsDisplay = new google.maps.DirectionsRenderer({
      map: map
    });

  // get route from A to B
  calculateAndDisplayRoute(
    directionsService,
    directionsDisplay,
    pointA,
    pointB,
    line
  );
};

const calculateAndDisplayRoute = (
  directionsService,
  directionsDisplay,
  pointA,
  pointB,
  line
) => {
  directionsService.route(
    {
      origin: pointA,
      destination: pointB,
      travelMode: "TRANSIT",
      transitOptions: { departureTime: new Date(), modes: ["BUS"] },
      provideRouteAlternatives: true
    },
    (response, status) => {
      if (status == google.maps.DirectionsStatus.OK) {
        console.log(response);
        response.routes.forEach((e, i) => {
          e.legs[0].steps.forEach(a => {
            if (a.travel_mode == "TRANSIT") {
              if (a.transit.line.short_name === line) {
                console.log(`DURACION ESTIMADA: ${a.duration.text}`);
                console.log(`FOUND LINEA: ${a.transit.line.short_name}`);

                let mapa = document.getElementById("map");
                mapa.style.display = "block";
                response.routes = [response.routes[i]];
                directionsDisplay.setDirections(response);
              }
            }
          });
        });
      } else {
        //   window.alert("Directions request failed due to " + status);
      }
    }
  );
};

const calculateTimeRoute = (start, end, line, time) => {
  console.log(time);
  return new Promise((resolve, reject) => {
    (directionsService = new google.maps.DirectionsService()),
      directionsService.route(
        {
          origin: `${start.lat},${start.lng}`,
          destination: `${end.lat},${end.lng}`,
          travelMode: "TRANSIT",
          transitOptions: {
            departureTime: new Date(time),
            modes: ["BUS"]
          },
          provideRouteAlternatives: true
        },
        (response, status) => {
          if (status == google.maps.DirectionsStatus.OK) {
            for (i = 0; i < response.routes.length; i++) {
              e = response.routes[i];
              for (j = 0; j < e.legs[0].steps.length; j++) {
                a = e.legs[0].steps[j];
                if (a.travel_mode == "TRANSIT") {
                  if (a.transit.line.short_name === line) {
                    console.log(
                      `media - DURACION ESTIMADA: ${a.duration.text}`
                    );
                    console.log(
                      `media - FOUND LINEA: ${a.transit.line.short_name}`
                    );
                    averageTimes.push(parseInt(convertToMin(a.duration.text)));
                    resolve(response);
                    // } else {
                    //   reject()
                  }
                }
              }
            }
          } else {
            window.alert("Directions request failed due to " + status);
          }
        }
      );
  });
};

const convertToMin = time => {
  //time tiene este formato => 1h 0min // 53min
  let separate = time.split(" ");
  let total = 0;
  if (time.indexOf("h") != -1) {
    total = parseInt(time[0]) * 60 + parseInt(separate[1].split("min")[0]);
    return total;
  } else {
    //son min
    return time.split(" ")[0];
  }
};

const convertToSec = (date, num) => {
  //recibe la fecha en formato => 2018-04-24T17:07:27.605Z

  let dateInSec = Math.round(new Date(date).getTime());
  let dayInSec = 60 * 60 * 24;
  let datesInSec = [];
  // let UMT = 60*60*2 //2h
  let delay = 10000;
  for (i = 0; i < num; i++) {
    datesInSec.push(delay + dateInSec + dayInSec * i);
  }
  return datesInSec;
};
