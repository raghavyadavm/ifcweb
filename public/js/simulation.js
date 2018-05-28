var rABS = true; // true: readAsBinaryString ; false: readAsArrayBuffer
var flagsData = {};

function handleSimulationFile(e) {
  var files = e.target.files,
    f = files[0];
  var reader = new FileReader();
  reader.onload = function (e) {
    var data = e.target.result;
    if (!rABS) data = new Uint8Array(data);
    var workbook = XLSX.read(data, {
      type: rABS ? 'binary' : 'array'
    });
    var jsonData;
    for (var i = 0; i < workbook.SheetNames.length; ++i) {
      var worksheet = workbook.Sheets[workbook.SheetNames[i]];
      console.log(`IFCPROPERTYSINGLEVALUE('Zone',$,IFCTEXT('${workbook.SheetNames[i]}'),$);`)
      jsonData = XLSX.utils.sheet_to_json(worksheet);
      var flagcount = 0;
      jsonData.forEach(element => {
        console.log(element);
        for (const key in element) {
          console.warn(`IFCPROPERTYSINGLEVALUE('${key}',$,IFCTEXT('${element[key]}'),$);`);
          if (key == 'Difference Occupied' && Number(element['Difference Occupied']) < 0) {
            flagcount++;
          }
          if (key == 'Difference Unoccupied' && Number(element['Difference Unoccupied']) < 0) {
            flagcount++;
          }
        }
      });
      flagsData[workbook.SheetNames[i]] = flagcount;
      document
        .getElementById("flag-div")
        .children[1]
        .innerHTML += "<li class='list-group-item'>" + workbook.SheetNames[i] + ' : ' + flagcount + "</li>";
    }


    /* DO SOMETHING WITH workbook HERE */
  };
  if (rABS) reader.readAsBinaryString(f);
  else reader.readAsArrayBuffer(f);
}
document.getElementById('simulationControlFile')
  .addEventListener('change', handleSimulationFile, false);