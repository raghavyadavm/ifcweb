document.getElementById('bemsControlFile').addEventListener('change', handleBemsFile, false);
var rABS = true;

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
              console.log(innerkey.slice(innerkey.indexOf('TAB')));
              var s = innerkey.slice(innerkey.indexOf('TAB'));
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