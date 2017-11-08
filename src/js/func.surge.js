import Papa from 'papaparse'
import { SurgeLayer } from './ocean.weather.surge'
// import { SurgeISOBands } from './leaflet.surge.isobands'

export class FuncSurge {

  constructor(map) {
    this._map = map;
  }

  start() {
    Papa.parse('./static/data/surge.csv', {
      download: true,
      header: false,
      complete: function (results) {
        var datas = results.data;
        var config = {
          lat: '0',
          lng: '1',
          dir: '3',
          value: '2',
          data: datas
        };
        if(this._map.hasLayer(this._surgeLayer)) {
          this._map.removeLayer(this._surgeLayer);
        }
        this._surgeLayer = new SurgeLayer(null, config);
        // var surgeIsobands = new SurgeISOBands(null, config);
        this._map.addLayer(this._surgeLayer);
        // this._map.addLayer(surgeIsobands);
      }.bind(this)
    });
  }

  stop　() {
    if(this._map.hasLayer(this._surgeLayer)) {
      this._map.removeLayer(this._surgeLayer);
    }
  }
}
