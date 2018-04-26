//necesito => saber la primera parada y la última
//llamada a axios

document.addEventListener(
  "DOMContentLoaded",
  () => {
    let api_url =
      "https://openbus.emtmadrid.es:9443/emt-proxy-server/last/bus/GetRouteLines.php";

    let parametros = new URLSearchParams();
    parametros.append("idClient", "WEB.SERV.lunafidalgo@gmail.com");
    parametros.append("passKey", "7C6C9B0A-F2FA-4F74-8568-3D2858C136ED");
    parametros.append("Lines", 1);
    parametros.append("SelectDate", "20/04/2018");

    axios
      .post(api_url, parametros, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
      .then(a => {
        //  console.log(a);
        let markers = [];
        a.data.resultValues.forEach(e => {
          markers.push({ lat: e.latitude, lng: e.longitude });
        });
        document.getElementById("map").style.display = "block";
        initMap(markers);
      });
  },
  false
);

const initMap = markers => {
  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: new google.maps.LatLng(markers[0].lat, markers[0].lng),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  (directionsService = new google.maps.DirectionsService()),
    (directionsDisplay = new google.maps.DirectionsRenderer({
      map: map
    }));

  var infowindow = new google.maps.InfoWindow();

  var marker, i;

  //console.log(markers.length)
  for (i = 0; i < markers.length - 1; i++) {
    // marker = new google.maps.Marker({
    //   position: new google.maps.LatLng(markers[i].lat, markers[i].lng),
    //   map: map
    // });
    calculateAndDisplayRoute(
      directionsService,
      directionsDisplay,
      markers[i],
      markers[i + 1]
    );
    // google.maps.event.addListener(
    //   marker,
    //   "click",
    //   (function(marker, i) {
    //     return function() {
    //       //infowindow.setContent(markers[i][0]);
    //       infowindow.open(map, marker);
    //     };
    //   })(marker, i)
    // );
  }

  // get route from A to sB
};

const calculateAndDisplayRoute = (
  directionsService,
  directionsDisplay,
  pointA,
  pointB, 
  
) => {
  directionsService.route(
    {
      origin: pointA,
      destination: pointB, 
      travelMode: "DRIVING"
    },
    (response, status) => {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      } else {
        //   window.alert("Directions request failed due to " + status);
      }
    }
  );
};
