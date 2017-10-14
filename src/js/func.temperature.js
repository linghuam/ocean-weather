import Papa from 'papaparse'
import { HeatmapOverlay } from './leafletHeatmap/leaflet-heatmap'

export class FuncTemperature {

  constructor(map) {
    this._map = map;
  }

  start() {
    Papa.parse('./static/data/temperature.csv', {
      download: true,
      complete: function (results) {
        var data = results.data || [];
        data = data.filter(function (value) {
          return value !== '' && value.length > 1;
        });
        var datacfg = {
          max: 40,
          data: data
        };

        var cfg = {
          // radius should be small ONLY if scaleRadius is true (or small radius is intended)
          // if scaleRadius is false it will be the constant radius used in pixels
          "radius": 2,
          "maxOpacity": .8,
          // scales the radius based on map zoom
          "scaleRadius": true,
          // if set to false the heatmap uses the global maximum for colorization
          // if activated: uses the data maximum within the current map boundaries
          //   (there will always be a red spot with useLocalExtremas true)
          "useLocalExtrema": true,
          // which field name in your data represents the latitude - default "lat"
          latField: '0',
          // which field name in your data represents the longitude - default "lng"
          lngField: '1',
          // which field name in your data represents the data value - default "value"
          valueField: '2'
        };
        var heatmapLayer = this._tempratureLayer = new HeatmapOverlay(cfg);
        heatmapLayer.setData(datacfg);
        if(this._map.hasLayer(this._tempratureLayer)) {
          this._map.removeLayer(this._tempratureLayer);
        }
        this._map.addLayer(heatmapLayer);
      }.bind(this),
    });
  }

  stop　() {
    if(this._map.hasLayer(this._tempratureLayer)) {
      this._map.removeLayer(this._tempratureLayer);
    }
  }
}
