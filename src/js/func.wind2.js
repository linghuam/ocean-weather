import Papa from 'papaparse'
import { WindLayer } from './ocean.weather.wind'

export class FuncWind2 {

  constructor(map) {
    this._map = map;
  }

  start() {
    Papa.parse('./static/data/wind.csv', {
      download: true,
      complete: function (results) {
        var datas = results.data;
        var config = {
          lat: '0',
          lng: '1',
          dir: '3',
          value: '2',
          data: datas
        };
        if(this._map.hasLayer(this._windLayer)) {
          this._map.removeLayer(this._windLayer);
        }
        this._windLayer = new WindLayer(null, config);
        this._map.addLayer(this._windLayer);
      }.bind(this)
    });
  }

  stop　() {
    if(this._map.hasLayer(this._windLayer)) {
      this._map.removeLayer(this._windLayer);
    }
  }
}
