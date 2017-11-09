import { ParseData } from './tool.parseData'
import { WindLayer } from './ocean.weather.wind'

export class FuncWind {

  constructor(map) {
    this._map = map;
  }

  start() {
    var url = './static/data/wind.csv';
    ParseData(url, null ,function (results) {
      this.getDataCallback(results);
    }, this);
  }

  stop() {
    if(this._map.hasLayer(this._layer)) {
      this._map.removeLayer(this._layer);
    }
  }

  getDataCallback (results) {
    var datas = results.data;
    datas.shift();
    var config = {
      lat: '0',
      lng: '1',
      value: '2',
      dir: '3',
      data: datas
    };
    if(this._map.hasLayer(this._layer)) {
      this._map.removeLayer(this._layer);
    }
    this._layer = new WindLayer({}, config);
    this._map.addLayer(this._layer);
  }
}
