import Papa from 'papaparse'
import { SurgeLayer } from './leaflet.surge'

export class FuncSurge2 {

  constructor(map) {
    this._map = map;
  }

  start() {
    Papa.parse('./static/data/surge.csv', {
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
        if(this._map.hasLayer(this._surgeLayer)) {
          this._map.removeLayer(this._surgeLayer);
        }
        this._surgeLayer = new SurgeLayer(null, config);
        this._map.addLayer(this._surgeLayer);
      }.bind(this)
    });
  }

  stop　() {
    if(this._map.hasLayer(this._surgeLayer)) {
      this._map.removeLayer(this._surgeLayer);
    }
  }
}
