document.getElementById('bemsControlFile').addEventListener('change', handleBemsFile, false);
var alarmList = []; //list of alarm zones
var maintainanceList = [];
var maintainanceElement = document.getElementById("maintainance-list");

function handleBemsFile(e) {
  f = e.target.files[0];
  console.log(f);
  var reader = new FileReader();
  reader.onload = function (e) {
    var data = e.target.result;
    var workbook = XLSX.read(data, {
      type: 'binary'
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
  reader.readAsBinaryString(f);
}

document.getElementById('cmmsControlFile').addEventListener('change', handleCmmsFile, false);


function handleCmmsFile(e) {
  f = e.target.files[0];
  var reader = new FileReader();
  reader.onload = function (e) {
    var data = e.target.result;
    var workbook = XLSX.read(data, {type: 'binary'});
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
              }
            });
          }
        }
      }
    }
  };
  reader.readAsBinaryString(f);
}

document
  .getElementById('ifcControlFile')
  .addEventListener('change', handleIFCFile, false);
var allLines, lastLineNo;
var data;
var identityArray = [];
var metadata = {
  ifcAssocMaterial: {},
  ifcBuildingElementProxyType: {},
  identityData: {},
  BEMSID: {},
  simulationData: {},
  comfortData: {}
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
        lastLineNo = line.match(/\#(.*)\=/)[1];
        // main group with zones
        if (line.includes("#195620")) {
          //find the subgroups(childs) and store in array
          var ifcAssocMaterial = (line.match(/\((#.*)\),/)[1]).split(',');
          // console.warn(line); console.log(ifcAssocMaterial);

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
              // console.warn(line); console.log(regex);

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
            // console.log(line); #17171= IFCPROPERTYSINGLEVALUE('BEMS ID', $,
            // IFCTEXT('TAB-009'), $);

            var regex = (line.match(/IFCTEXT\('(.*)'\)/)[1]);
            // console.log(regex);
            metadata.BEMSID[regex] = key;
            console.log(metadata);
          };
        });
      }
    };

    //update cmms data for alarm zones in ifc file
    alarmList.map((element) => {
      maintainanceList.map((e) => {
        if (e['CMMS ID'] == element) {
          updateCMMSData(element, e);
        }
      });
    });
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
  var set = [];
  for (const key in metadata.identityData) {
    if (returnid == metadata.identityData[key]) {
      console.log(key);
      set.push(key);
    }
  }
  return set;
}

function updateCMMSData(id, cmmsdata) {
  var identityArray = getIdentitySet(id);
  identityArray.forEach((element) => {
    allLines.map((line) => {
      if (line.startsWith(element + '=')) {
        // console.log(line);
        if (line.includes('serves')) {
          var replacedString = line.replace(/IFCTEXT\('(.*)'\)/, `IFCTEXT('${cmmsdata['Serves']}')`);
          console.log(replacedString);
        } else if (line.includes('model number')) {
          var replacedString = line.replace(/IFCTEXT\('(.*)'\)/, `IFCTEXT('${cmmsdata['Model number']}')`);
          console.log(replacedString);
        } else if (line.includes('Warranty date')) {
          var replacedString = line.replace(/IFCTEXT\('(.*)'\)/, `IFCTEXT('${cmmsdata['Warranty Date']}')`);
          console.log(replacedString);
        } else if (line.includes('Previous Maintenance number')) {
          var replacedString = line.replace(/IFCTEXT\('(.*)'\)/, `IFCTEXT('${cmmsdata['Work Number']}')`);
          console.log(replacedString);
        } else if (line.includes('Previous Maintenance description')) {
          var replacedString = line.replace(/IFCTEXT\('(.*)'\)/, `IFCTEXT('${cmmsdata['Work Description']}')`);
          console.log(replacedString);
        } else if (line.includes('Maintenance Type')) {
          var replacedString = line.replace(/IFCTEXT\('(.*)'\)/, `IFCTEXT('${cmmsdata['Maintenance Type']}')`);
          console.log(replacedString);
        } else if (line.includes('Maintenance cost')) {
          var replacedString = line.replace(/IFCTEXT\('(.*)'\)/, `IFCTEXT('${cmmsdata['Total Costs/WO']}')`);
          console.log(replacedString);
        } else if (line.includes('PM Maintenance tasks')) {
          var replacedString = line.replace(/IFCTEXT\('(.*)'\)/, `IFCTEXT('${cmmsdata['Task List']}')`);
          console.log(replacedString);
        }
      }
    });
  })
}

var flagsData = {};
var zoneset;

function handleSimulationFile(e) {
  var files = e.target.files,
    f = files[0];
  var reader = new FileReader();
  reader.onload = function (e) {
    var data = e.target.result;
    var workbook = XLSX.read(data, {type: 'binary'});
    var jsonData;
    
    for (var i = 0; i < workbook.SheetNames.length; ++i) {
      var appendString = '';
      var worksheet = workbook.Sheets[workbook.SheetNames[i]];
      console.error(`#${++lastLineNo}= IFCPROPERTYSINGLEVALUE('Zone',$,IFCTEXT('${workbook.SheetNames[i]}'),$);`);
      appendString += `#${lastLineNo},`;
      jsonData = XLSX.utils.sheet_to_json(worksheet);
      var flagcount = 0;
      jsonData.forEach(element => {
        console.log(element);
        for (const key in element) {
          console.warn(`#${++ lastLineNo}= IFCPROPERTYSINGLEVALUE('${key}',$,IFCTEXT('${element[key]}'),$);`);
          appendString += `#${lastLineNo},`;
          if (key == 'Difference Occupied' && Number(element['Difference Occupied']) < 0) {
            flagcount++;
          }
          if (key == 'Difference Unoccupied' && Number(element['Difference Unoccupied']) < 0) {
            flagcount++;
          }
        }
      });
      console.error(`#${++ lastLineNo}= IFCPROPERTYSET('2HZC0ilWv7AOiYYnC807LW',#41,'SimulationData',$,(${appendString}));`);
      metadata.simulationData[workbook.SheetNames[i]] = lastLineNo;
      flagsData[workbook.SheetNames[i]] = flagcount;
      document
        .getElementById("flag-list")
        .innerHTML += "<li class='list-group-item'>" + workbook.SheetNames[i] + ' : ' + flagcount + "</li>";
    }
    
  };
  reader.readAsBinaryString(f);
}
document
  .getElementById('simulationControlFile')
  .addEventListener('change', handleSimulationFile, false);