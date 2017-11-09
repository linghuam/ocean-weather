import { ParseData } from './tool.parseData'
import { VisibilityLayer } from './ocean.weather.visibility'

export class FuncVisibility {

  constructor(map) {
    this._map = map;
  }

  start() {
    this.contourData = [];
    var row , temp = [];
    var url = './static/data/visibility.csv';
    ParseData(url, function(results, parser) {
      row = results.data[0];
      if (row.length === 1) {
        if (temp.length) this.contourData.push(temp);
        temp = [];
      } else if (row.length === 3) {
        if ( typeof row[0] !== 'string') temp.push(row);
      }
    },function (results) {
      this.getDataCallback();
    }, this);
  }

  stop　() {
    if (this._map.hasLayer(this._layer)) {
      this._layer.remove();
    }
  }

  getDataCallback () {
    if (this._map.hasLayer(this._layer)) {
      this._layer.remove();
    }
    this._layer = new VisibilityLayer({}, {
      data: this.contourData
    }).addTo(this._map)
  }
}
