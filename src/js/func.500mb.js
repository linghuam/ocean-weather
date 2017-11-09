import { ParseData } from './tool.parseData'
import { MB500Layer } from './ocean.weather.mb500'

export class Func500mb {

    constructor(map) {
      this._map = map;
    }

    start() {
      this.contourData = [];
      this.hlData = [];
      var row , temp = [];
      var url = './static/data/500mb.csv';
      ParseData(url, function(results, parser) {
        row = results.data[0];
        if (row.length === 1) {
          if (temp.length) this.contourData.push(temp);
          temp = [];
        } else if (row.length === 3) {
          if ( typeof row[0] !== 'string') temp.push(row);
        } else if (row.length === 4) {
          if ( typeof row[0] !== 'string') this.hlData.push(row);
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
      this._layer = new MB500Layer({}, {
        data: this.contourData,
        hlData: this.hlData
      }).addTo(this._map);
    }
}
