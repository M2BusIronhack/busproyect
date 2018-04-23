
document.addEventListener(
  "DOMContentLoaded",
  () => {
    console.log("IronGenerator JS imported successfully!");

    let api_url =
      "https://openbus.emtmadrid.es:9443/emt-proxy-server/last/bus/GetListLines.php";

    // idClient: "WEB.SERV.lunafidalgo@gmail.com",
    // passKey: "7C6C9B0A-F2FA-4F74-8568-3D2858C136ED",
    // Lines: "1",
    // SelectDate: "20/04/2017"

    const params = new URLSearchParams();
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
      let linkToBack = document.createElement("button");
      linkToBack.addEventListener("click", e => {
        let lines = document.getElementById("lines");
        let option = lines.options[lines.selectedIndex].value;

      });
      linkToBack.innerHTML = "ver paradas";
      infoLines.appendChild(linkToBack);
    })
    .catch(e => console.log(e));
};
