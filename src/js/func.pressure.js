import { ParseData } from './tool.parseData'
import { PressureLayer } from './ocean.weather.pressure'

export class FuncPressure {

  constructor(map) {
    this._map = map;
  }

  start() {
    this.contourData = [];
    this.hlData = [];
    var row , temp = [];
    var url = './static/data/水文气象样例数据/20120820_12Z_PC_气压/20120820_12Z_PC.txt';
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
    this._layer = new PressureLayer({}, {
      data: this.contourData,
      hlData: this.hlData
    }).addTo(this._map);
  }
}
