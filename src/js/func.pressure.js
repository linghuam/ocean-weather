import Papa from 'papaparse'
import { LineTextCanvas } from './leaflet.textCanvas'
// import turf from 'turf'
import { PressureLayer } from './leaflet.pressurelayer'

export class FuncPressure {

  constructor(map) {
    this._map = map;
  }

  start() {
    Papa.parse('./static/data/pressure.csv', {
      download: true,
      header: false,
      complete: function (results) {
        if (results.errors.length || !results.data.length) return;
        this.getDataCallback(results.data);
      }.bind(this)
    });
  }

  stop　() {
    if (this._map.hasLayer(this._layer)) {
      this._layer.remove();
    }
  }

  getDataCallback (data) {
    // split data by line
    var newData = [];
    var temp = [];
    var i, len, latlngs, leftlatlngs, rightlatlngs;
    for (i = 0, len = data.length; i < len; i++){
        if (data[i].length === 1 || i === len-1) {
          if (temp.length >= 2) newData.push(temp);
          temp = [];
        } else {
          temp.push(data[i]);
        }
    }

    // new layer
    if (this._map.hasLayer(this._layer)) {
      this._layer.remove();
    }
    this._layer = new PressureLayer({}, {
      data: newData
    }).addTo(this._map)
  }
}
