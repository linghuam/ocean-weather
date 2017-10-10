import 'leaflet-velocity/dist/leaflet-velocity.min.css'
import 'leaflet-velocity'
import Papa from 'papaparse'

export class FuncFlow {

  constructor(map) {
    this._map = map;
  }

  start() {
    Papa.parse('./static/data/flow.csv', {
      download: true,
      complete: function (results) {
        var data = [];
        var flowUObj = {
          data: [],
          header: {
            "dx": 1.0,
            "dy": 1.0,
            "la1": 75,
            "la2": -75,
            "lo1": -179,
            "lo2": 179,
            "nx": 359,
            "ny": 151,
            "parameterCategory": 2,
            "parameterNumber": 2,
            "parameterUnit": "m.s-1",
            "refTime": "2017-02-01 23:00:00"
          }
        };
        var flowVObj = {
          data: [],
          header: {
            "dx": 1.0,
            "dy": 1.0,
            "la1": 75,
            "la2": -75,
            "lo1": -179,
            "lo2": 179,
            "nx": 359,
            "ny": 151,
            "parameterCategory": 2,
            "parameterNumber": 3,
            "parameterUnit": "m.s-1",
            "refTime": "2017-02-01 23:00:00"
          }
        };
        for(var i = 0, len = results.data.length; i < len; i++) {
          var value = results.data[i][2] * 1852 / 3600;
          var rad = Math.PI * results.data[i][3] / 180;
          flowUObj.data.push(value * Math.sin(rad));
          flowVObj.data.push(value * Math.cos(rad));
        }
        data.push(flowUObj, flowVObj);
        var velocityLayer = this._velocityLayer = L.velocityLayer({
          displayValues: true,
          displayOptions: {
            velocityType: 'Global Flow',
            displayPosition: 'bottomleft',
            displayEmptyString: 'No wind data'
          },
          data: data,
          maxVelocity: 1
        });
        if(this._map.hasLayer(this._velocityLayer)) {
          this._map.removeLayer(this._velocityLayer);
        }
        this._map.addLayer(velocityLayer);
      }.bind(this)
    });


    // $.getJSON('./static/data/wind-gbr.json', function (data) {

    //   var velocityLayer = L.velocityLayer({
    //     displayValues: true,
    //     displayOptions: {
    //       velocityType: 'Global Wind',
    //       displayPosition: 'bottomleft',
    //       displayEmptyString: 'No wind data'
    //     },
    //     data: data,
    //     maxVelocity: 15
    //   });
    //   this._velocityLayer = velocityLayer;
    //   if(this._map.hasLayer(this._velocityLayer)) {
    //     this._map.removeLayer(this._velocityLayer);
    //   }
    //   this._map.addLayer(velocityLayer);
    // }.bind(this));
  }

  stop　() {
    if(this._map.hasLayer(this._velocityLayer)) {
      this._map.removeLayer(this._velocityLayer);
    }
  }
}
