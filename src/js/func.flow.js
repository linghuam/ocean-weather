import Papa from 'papaparse'
import { FlowLayer } from './ocean.weather.flow'

export class FuncFlow {

  constructor(map) {
    this._map = map;
  }

  start() {
    Papa.parse('./static/data/flow.csv', {
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
        if(this._map.hasLayer(this._flowLayer)) {
          this._map.removeLayer(this._flowLayer);
        }
        this._flowLayer = new FlowLayer(null, config);
        this._map.addLayer(this._flowLayer);
      }.bind(this)
    });
  }

  stop　() {
    if(this._map.hasLayer(this._flowLayer)) {
      this._map.removeLayer(this._flowLayer);
    }
  }
}
