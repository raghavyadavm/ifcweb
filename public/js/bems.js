document
  .getElementById('bemsControlFile')
  .addEventListener('change', handleBemsFile, false);
var rABS = true;
var alarmList = [];
var maintainanceList = [];

function handleBemsFile(e) {
  f = e.target.files[0];
  var reader = new FileReader();
  reader.onload = function (e) {
    var data = e.target.result;
    if (!rABS)
      data = new Uint8Array(data);
    var workbook = XLSX.read(data, {
      type: rABS ?
        'binary' : 'array'
    });
    worksheet = workbook.Sheets["Sheet1"];
    console.log(worksheet);
    var jsonData = XLSX
      .utils
      .sheet_to_json(worksheet);
    console.log(jsonData);

    for (const key in jsonData) {
      if (jsonData.hasOwnProperty(key)) {
        for (const innerkey in jsonData[key]) {
          if (jsonData[key].hasOwnProperty(innerkey)) {
            if (((jsonData[key])[innerkey]).includes("Alarm")) {
              var s = innerkey.slice(innerkey.indexOf('TAB'));
              console.log(s);
              alarmList.push(s);
              document
                .getElementById("alarm-div")
                .children[1]
                .innerHTML += "<li class='list-group-item'>" + s + "</li>";
            }
          }
        }
      }
    }
  };

  if (rABS)
    reader.readAsBinaryString(f);
  else
    reader.readAsArrayBuffer(f);
}

document
  .getElementById('cmmsControlFile')
  .addEventListener('change', handleCmmsFile, false);
var rABS = true;

function handleCmmsFile(e) {
  f = e.target.files[0];
  var reader = new FileReader();
  reader.onload = function (e) {
    var data = e.target.result;
    if (!rABS)
      data = new Uint8Array(data);
    var workbook = XLSX.read(data, {
      type: rABS ?
        'binary' : 'array'
    });
    worksheet = workbook.Sheets["Sheet1"];
    // console.log(worksheet);
    var jsonData = XLSX
      .utils
      .sheet_to_json(worksheet);
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
                document
                  .getElementById("maintainance-div")
                  .children[1]
                  .innerHTML += "<li class='list-group-item'>CMMS ID : " + jsonData[key]['CMMS ID'] + "</li>";
                document
                  .getElementById("maintainance-div")
                  .children[1]
                  .innerHTML += "<li class='list-group-item'>Location : " + jsonData[key]['Room'] + "</li>";
                document
                  .getElementById("maintainance-div")
                  .children[1]
                  .innerHTML += "<li class='list-group-item'>Maintenance Type : " + jsonData[key]['Maintenance Type'] + "</li>";
                document
                  .getElementById("maintainance-div")
                  .children[1]
                  .innerHTML += "<li class='list-group-item'>Manufacturer : " + jsonData[key]['Mfr'] + "</li>";
                document
                  .getElementById("maintainance-div")
                  .children[1]
                  .innerHTML += "<li class='list-group-item'>Model number : " + jsonData[key]['Model number'] + "</li>";
                document
                  .getElementById("maintainance-div")
                  .children[1]
                  .innerHTML += "<li class='list-group-item'>Serial No : " + jsonData[key]['Serial No'] + "</li>";
                document
                  .getElementById("maintainance-div")
                  .children[1]
                  .innerHTML += "<li class='list-group-item'>Serves : " + jsonData[key]['Serves'] + "</li>";
                document
                  .getElementById("maintainance-div")
                  .children[1]
                  .innerHTML += "<li class='list-group-item'>Warranty Date : " + jsonData[key]['Warranty Date'] + "</li>";
                document
                  .getElementById("maintainance-div")
                  .children[1]
                  .innerHTML += "<li class='list-group-item'>Maintenance cost : " + jsonData[key]['Total Costs/WO'] + "</li>";
              }
            });
          }
        }
      }
    }
  };

  if (rABS)
    reader.readAsBinaryString(f);
  else
    reader.readAsArrayBuffer(f);
}

document
  .getElementById('ifcControlFile')
  .addEventListener('change', handleIFCFile, false);
var allLines;
var data;
var metadata = {
  ifcAssocMaterial: {},
  ifcBuildingElementProxyType: {},
  identityData: {},
  BEMSID: {}
};
var info,
  endPosition = 0,
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
        // main group with zones
        if (line.includes("#195620")) {
          //find the subgroups(childs) and store in array
          var ifcAssocMaterial = (line.match(/\((#.*)\),/)[1]).split(',');
          // console.warn(line);
          // console.log(ifcAssocMaterial);

          ifcAssocMaterial.forEach(element => {
            metadata.ifcAssocMaterial[element] = '#195620';
          });
          // console.log(metadata);
        }
      }
    });

    //IFCBUILDINGELEMENTPROXYTYPE metadata generation
    for (const key in metadata) {
      if (metadata.hasOwnProperty(key)) {
        for (const key1 in metadata[key]) {
          allLines.map((line) => {
            if (line.startsWith(key1) && line.includes("IFCBUILDINGELEMENTPROXYTYPE")) {
              // console.log(line);
              var regex = (line.match(/\((#.*)\),\(/)[1]).split(',');
              // console.warn(line);
              // console.log(regex);

              regex.forEach(element => {
                metadata.ifcBuildingElementProxyType[element] = key1;
              });
              // console.log(metadata);
            }
          });
        }
      }
    }

    //Identity Data metadata generation
    for (const key in metadata.ifcBuildingElementProxyType) {
      if (metadata.ifcBuildingElementProxyType.hasOwnProperty(key)) {
        // console.log(key);
        allLines.map((line) => {
          if (line.startsWith(key) && line.includes("Identity Data")) {
            // console.log(line);
            var regex = (line.match(/\((#.*)\)\)/)[1]).split(',');
            // console.log(regex);

            regex.forEach(element => {
              metadata.identityData[element] = key;
            });
            // console.log(metadata);
          };
        });
      }
    };

    //BEMSID metadata generation
    for (const key in metadata.identityData) {
      if (metadata.identityData.hasOwnProperty(key)) {
        // console.log(key);
        allLines.map((line) => {
          if (line.startsWith(key) && line.includes("BEMS ID")) {
            // console.log(line);
            // #17171= IFCPROPERTYSINGLEVALUE('BEMS ID', $, IFCTEXT('TAB-009'), $);

            var regex = (line.match(/IFCTEXT\('(.*)'\)/)[1]);
            // console.log(regex);
            metadata.BEMSID[regex] = key;
            console.log(metadata);
          };
        });
      }
    };
  }

  reader.onerror = (evt) => {
    alert(evt.target.error.name);
  };

  reader.readAsText(file);
}

function findIdentitySet(id) {
  for (const key in metadata.BEMSID) {
    if (key == id) {
      return metadata.identityData[findBEMSID(id)];
    }
  }
}

function findBEMSID(id) {
  return metadata.BEMSID[id];
}

function findBuildingProxyType(id) {
  return metadata.ifcBuildingElementProxyType[findIdentitySet(id)];
}

function getIdentitySet(id) {
  var returnid = findIdentitySet(id);
  for (const key in metadata.identityData) {
    if (returnid == metadata.identityData[key])
      console.log(key);
  }
}