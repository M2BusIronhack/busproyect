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
    listenerLineSelected();
  },
  false
);

const listenerLineSelected = () => {
  document.querySelector('select[id="lines"]').onchange = e => {
    let linkToBack = document.getElementById("see-comments");
    linkToBack.setAttribute("href", `line/${event.target.value}`);
  };
};

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

      let defaultLines = document.createElement("option");
      defaultLines.innerHTML = "Selecciona una linea...";
      selectLines.appendChild(defaultLines);

      a.data.resultValues.forEach(e => {
        let info = `${e.label}: ${e.nameA} - ${e.nameB}`;
        let option = document.createElement("option");
        option.value = e.label;
        option.innerHTML = info;
        selectLines.appendChild(option);
      });

      let showStops = document.getElementById("show-stops");
      showStops.addEventListener("click", e => {
        document.getElementById("start").style.display = "block";
        document.getElementById("end").style.display = "block";
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

            let defaultStart = document.createElement("option");
            defaultStart.innerHTML = "Selecciona primera parada...";
            selectStart.appendChild(defaultStart);

            a.data.resultValues.forEach(e => {
              setDataValues(e, selectStart);
            });

            let selectEnd = document.getElementById("end");
            let defaultEnd = document.createElement("option");
            defaultEnd.innerHTML = "Selecciona última parada ...";
            selectEnd.appendChild(defaultEnd);

            a.data.resultValues.forEach(e => {
              setDataValues(e, selectEnd);
            });

            let showTime = document.getElementById("see-traffic");
            showTime.style.display = "block";
            //  infoLines.appendChild(linkToBack);

            showTime.addEventListener("click", e => {
              let startEndObj = getStopSelectedInfo(selectedLine);
              initMap(startEndObj[0], startEndObj[1], selectedLine);
              let time = convertToSec(new Date(), 8);
              // console.log(time);
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
                //    console.log("promesas=> " + timeInfo);

                drawChart(averageTimes);
                //     let total = averageTimes.reduce((total, num) => {
                //       return total + num;
                //     });
                // //    console.log(total / averageTimes.length);
              });
            });
            // infoLines.appendChild(showTime);
          });
      });

      // infoLines.appendChild(showStops);
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
  //console.log(startPointObj);

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
        //   console.log(response);
        response.routes.forEach((e, i) => {
          e.legs[0].steps.forEach(a => {
            if (a.travel_mode == "TRANSIT") {
              if (a.transit.line.short_name === line) {
                let textDuration = document.getElementById("est-duration");
                textDuration.innerHTML = `Duración estimada del trayecto
                ${a.duration.text}`;

                textDuration.style.display = "block";
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
  var currentDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  var day = currentDate.setHours(0);
  var oneDayBefore = new Date(day).setMinutes(0);

  //recibe la fecha en formato => 2018-04-24T17:07:27.605Z
  let startHour = Math.round(new Date(oneDayBefore).getTime());
  let twoHourInSec = 60 * 60 * 2 * 1000;
  let datesInSec = [];
  // let UMT = 60*60*2 //2h
  let start = 60 * 60 * 8 * 1000;
  datesInSec[0] = start + startHour; //empieza un dia despues a las 8h
  for (i = 1; i < num; i++) {
    datesInSec.push(twoHourInSec * i + datesInSec[0]);
  }
  return datesInSec;
};

const drawChart = durations => {
  durations.unshift(0);
  const hours = ["", "8", "10", "12", "14", "16", "18", "20", "22"];
  let ctx = document.getElementById("durationChart").getContext("2d");
  let chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: hours,
      datasets: [
        {
          label: "Variación de tiempo",
          backgroundColor: "rgb(255, 255, 255)",
          borderColor: "rgb(141, 186, 250)",
          pointBackgroundColor: "#fff",
          pointHoverBackgroundColor: "#55bae7",
          data: durations
        }
      ]
    },
    options: {
      legend: {
        labels: {
          fontColor: "white",
          fontSize: 18
        }
      },
      scales: {
        yAxes: [
          {
            ticks: {
              fontColor: "white"
            },
            gridLines: {
              display: false
            }
          }
        ],
        xAxes: [
          {
            ticks: {
              fontColor: "white"
            },
            gridLines: {
              display: false
            }
          }
        ]
      }
    }
  });
};
