document.getElementById('bemsControlFile').addEventListener('change', handleBemsFile, false);
var rABS = true;
var alarmList = [];
var maintainanceList = [];

function handleBemsFile(e) {
  f = e.target.files[0];
  var reader = new FileReader();
  reader.onload = function (e) {
    var data = e.target.result;
    if (!rABS) data = new Uint8Array(data);
    var workbook = XLSX.read(data, {
      type: rABS ? 'binary' : 'array'
    });
    worksheet = workbook.Sheets["Sheet1"];
    console.log(worksheet);
    var jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log(jsonData);

    for (const key in jsonData) {
      if (jsonData.hasOwnProperty(key)) {
        for (const innerkey in jsonData[key]) {
          if (jsonData[key].hasOwnProperty(innerkey)) {
            if (((jsonData[key])[innerkey]).includes("Alarm")) {
              var s = innerkey.slice(innerkey.indexOf('TAB'));
              console.log(s);
              alarmList.push(s);
              document.getElementById("alarm-div").children[1].innerHTML += "<li class='list-group-item'>" + s + "</li>";
            }
          }
        }
      }
    }
  };

  if (rABS) reader.readAsBinaryString(f);
  else reader.readAsArrayBuffer(f);
}

document.getElementById('cmmsControlFile').addEventListener('change', handleCmmsFile, false);
var rABS = true;

function handleCmmsFile(e) {
  f = e.target.files[0];
  var reader = new FileReader();
  reader.onload = function (e) {
    var data = e.target.result;
    if (!rABS) data = new Uint8Array(data);
    var workbook = XLSX.read(data, {
      type: rABS ? 'binary' : 'array'
    });
    worksheet = workbook.Sheets["Sheet1"];
    // console.log(worksheet);
    var jsonData = XLSX.utils.sheet_to_json(worksheet);
    // console.log(jsonData);

    for (const key in jsonData) {
      if (jsonData.hasOwnProperty(key)) {
        for (const innerkey in jsonData[key]) {
          if (jsonData[key].hasOwnProperty(innerkey)) {
            // console.log(((jsonData[key])[innerkey]));
            alarmList.forEach(element => {
              if (((jsonData[key])[innerkey]).includes(element)) {
                var s = (jsonData[key])[innerkey];
                console.log(s);
                console.log(jsonData[key]);
                maintainanceList.push(jsonData[key]);
                // document.getElementById("maintainance-div").children[1].innerHTML += "<li class='list-group-item'>" + 'CMMS ID' + " : " + jsonData[key]['CMMS ID'] + "</li>";
                // document.getElementById("maintainance-div").children[1].innerHTML += "<li class='list-group-item'>" + 'Location' + " : " + jsonData[key]['Room'] + "</li>";                
                // document.getElementById("maintainance-div").children[1].innerHTML += "<li class='list-group-item'>" + 'Maintenance Type' + " : " + jsonData[key]['Maintenance Type'] + "</li>";
                // document.getElementById("maintainance-div").children[1].innerHTML += "<li class='list-group-item'>" + 'Manufacturer' + " : " + jsonData[key]['Mfr'] + "</li>";                
                // document.getElementById("maintainance-div").children[1].innerHTML += "<li class='list-group-item'>" + 'Model number' + " : " + jsonData[key]['Model number'] + "</li>";
                // document.getElementById("maintainance-div").children[1].innerHTML += "<li class='list-group-item'>" + 'Serial No' + " : " + jsonData[key]['Serial No'] + "</li>";
                // document.getElementById("maintainance-div").children[1].innerHTML += "<li class='list-group-item'>" + 'Serves' + " : " + jsonData[key]['Serves'] + "</li>";
                // document.getElementById("maintainance-div").children[1].innerHTML += "<li class='list-group-item'>" + 'Warranty Date' + " : " + jsonData[key]['Warranty Date'] + "</li>";
                // document.getElementById("maintainance-div").children[1].innerHTML += "<li class='list-group-item'>" + 'Maintenance cost' + " : " + jsonData[key]['Total Costs/WO'] + "</li>";
              }
            });
          }
        }
      }
    }
  };

  if (rABS) reader.readAsBinaryString(f);
  else reader.readAsArrayBuffer(f);
}

document.getElementById('ifcControlFile').addEventListener('change', handleIFCFile, false);
var allLines;
var data;
var info, endPosition = 0,
  startPosition = 0,
  sillyString = "";

function handleIFCFile(input) {
  info = input;
  const file = input.target.files[0];
  const reader = new FileReader();

  reader.onload = (event) => {
    data = event.target.result;
    allLines = data.split("\n");
    // Reading line by line
    allLines.map((line) => {
      if (line != "" && line.startsWith("#")) {
        if (line.includes("CMMS ID")) {
          alarmList.forEach(element => {
            if (line.includes(element)) {
              console.warn(line);
            }
          });
        }
      }
      // if (line.includes("CMMS ID")) {
      //   console.log(line);
      // }
    });
  };

  reader.onerror = (evt) => {
    alert(evt.target.error.name);
  };

  reader.readAsText(file);
}