import 'leaflet-velocity/dist/leaflet-velocity.min.css'
import 'leaflet-velocity'
import { ParseData } from './tool.parseData'

export class FuncWind2 {

  constructor(map) {
    this._map = map;
  }

  start() {
    var url = './static/data/wind.csv';
    ParseData(url, null ,function (results) {
      this.getDataCallBack(results);
    }, this);
  }

  stop　() {
    if(this._map.hasLayer(this._layer)) {
      this._map.removeLayer(this._layer);
    }
  }

  getDataCallBack(results) {
    var data = [];
    var windUObj = {
      data: [],
      header: {
        "dx": 1.0,
        "dy": 1.0,
        "la1": 75,
        "la2": -75,
        "lo1": -180,
        "lo2": 180,
        "nx": 361,
        "ny": 151,
        "parameterCategory": 2,
        "parameterNumber": 2,
        "parameterUnit": "m.s-1",
        "refTime": "2017-02-01 23:00:00"
      }
    };
    var windVObj = {
      data: [],
      header: {
        "dx": 1.0,
        "dy": 1.0,
        "la1": 75,
        "la2": -75,
        "lo1": -180,
        "lo2": 180,
        "nx": 361,
        "ny": 151,
        "parameterCategory": 2,
        "parameterNumber": 3,
        "parameterUnit": "m.s-1",
        "refTime": "2017-02-01 23:00:00"
      }
    };
    for(var i = 1, len = results.data.length; i < len; i++) {
      var value = results.data[i][2] * 1852 / 3600;
      var rad = Math.PI * results.data[i][3] / 180;
      windUObj.data.push(value * Math.sin(rad));
      windVObj.data.push(value * Math.cos(rad));
    }
    data.push(windUObj, windVObj);
    var velocityLayer = this._layer = L.velocityLayer({
      displayValues: true,
      displayOptions: {
        velocityType: 'Global Wind',
        displayPosition: 'bottomleft',
        displayEmptyString: 'No wind data'
      },
      data: data,
      maxVelocity: 15
    });
    if(this._map.hasLayer(this._layer)) {
      this._map.removeLayer(this._layer);
    }
    this._map.addLayer(velocityLayer);
  }

}
