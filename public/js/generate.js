var XL_row_object;
var worksheet;
var data = [];
var complyCount = 0;
var doesntcomplyCount = 0;

function result(d) {
  d.ta = Number(d.ta);
  d.tr = Number(d.tr);
  d.vel = Number(d.vel);
  d.rh = Number(d.rh);
  d.met = Number(d.met);
  d.clo = Number(d.clo);
  //console.log("new d is ");
  console.table(d);
  var r = comf.pmvElevatedAirspeed(d.ta, d.tr, d.vel, d.rh, d.met, d.clo, 0);
  calcPmvElevCompliance(d, r);

}

function calcPmvElevCompliance(d, r) {
  console.log("d is ", d);
  var pmv_comply = (Math.abs(r.pmv) <= 0.5);
  var met_comply = d.met <= 2 && d.met >= 1;
  //console.log("met_comply ", met_comply)
  var clo_comply = d.clo <= 1.5;
  //    var local_control = $('#local-control').is(':checked');
  var local_control = "noairspeedcontrol";
  var special_msg = '';
  var compliance_ranges, unit_t, unit_v;
  comply = true;

  if (!met_comply) {
    comply = false;
    special_msg += '&#8627; Metabolic rates below 1.0 or above 2.0 are not covered by this Standard<br>';
  }
  if (!clo_comply) {
    comply = false;
    special_msg += '&#8627; Clo values above 1.5 are not covered by this Standard<br>';
  }
  if (!pmv_comply) {
    comply = false;
  }

  if (d.vel > 0.2) {
    console.log('PMV with elevated air speed')
    console.log('PPD with elevated air speed')
  }

  //    if (!local_control) {
  if (local_control == 'noairspeedcontrol') {
    var max_airspeed;
    var to = (d.ta + d.tr) / 2;
    if (to > 25.5) {
      max_airspeed = 0.8;
    } else if (to < 23.0) {
      max_airspeed = 0.2
    } else {
      max_airspeed = 50.49 - 4.4047 * to + 0.096425 * to * to;
      if (max_airspeed < 0.2) max_airspeed = 0.2;
      if (max_airspeed > 0.8) max_airspeed = 0.8;
    }
    if (d.vel > max_airspeed) {
      comply = false;
      special_msg += '&#8627; Maximum air speed has been limited due to no occupant control<br>';
    }
  }

  var comply_msg = '%c Complies with ASHRAE Standard 55-2017';
  var no_comply_msg = '%c Does not comply with ASHRAE Standard 55-2017';
  var msg;
  //$('#vel-range').html('');
  if (comply) {
    msg = "Complies";
    console.log(comply_msg, 'color: green;');
    // $('#comply-msg').css('color', 'green')
    console.log(special_msg);
    complyCount++;
  } else {
    msg = "Does not comply";
    console.log(no_comply_msg, 'color: red;');
    // $('#comply-msg').css('color', 'red')
    console.log(special_msg);
    doesntcomplyCount++;
  }

  var result_data = {
    pmv: r.pmv.toFixed(2),
    ppd: r.ppd.toFixed(0),
    sensation: util.getSensation(r.pmv),
    set: r.set.toFixed(1),
    standard: msg
  };
  data.push(result_data);
  console.table(result_data);
}

var f;
var d = {
  ta: '',
  tr: '',
  vel: '',
  rh: '',
  met: '',
  clo: '',
  trm: '',
  vel_a: ''
};
var rABS = true;

function handleFile(e) {
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
    for (const key in jsonData) {
      if (jsonData.hasOwnProperty(key)) {
        console.log(jsonData[key]);
        d = jsonData[key];
      }
      result(d);
    }
    generateChart();
  };

  if (rABS) reader.readAsBinaryString(f);
  else reader.readAsArrayBuffer(f);
}

document.getElementById('generate').onclick = function () {
  var wb = XLSX.utils.book_new();
  console.log(data);
  var d = data;
  var ws = XLSX.utils.json_to_sheet(d);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  var wbout = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array'
  });
  saveAs(new Blob([wbout], {
    type: "application/octet-stream"
  }), 'output.xlsx');
};

document.getElementById('comfortInputFile').addEventListener('change', handleFile, false);

function generateChart() {
  var chart = document.getElementById('piechart');
  var chartData = [{
      "label": "comply",
      "value": complyCount,
      "color": "green"
    },
    {
      "label": "doesntcomply",
      "value": doesntcomplyCount,
      "color": "red"
    }
  ];
  var pie = new d3pie(chart, {
    "labels": {
      "outer": {
        "pieDistance": 10
      },
      "inner": {
        "hideWhenLessThanPercentage": 3
      },
      "mainLabel": {
        "fontSize": 10
      },
      "percentage": {
        "color": "#ffffff",
        "decimalPlaces": 0
      },
      "value": {
        "color": "#adadad",
        "fontSize": 11
      },
      "lines": {
        "enabled": true
      },
      "truncation": {
        "enabled": false
      }
    },
    "size": {
      "canvasHeight": 400,
      "canvasWidth": 400,
      "pieOuterRadius": "50%"
    },
    "effects": {
      "pullOutSegmentOnClick": {
        "effect": "linear",
        "speed": 400,
        "size": 8
      }
    },
    "data": {
      "content": chartData
    }
  });
}