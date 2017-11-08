import Papa from 'papaparse'
import { HeatmapOverlay } from './leafletHeatmap/leaflet-heatmap'
import { TemperatureLayer } from './ocean.weather.temperature'
import  ClipLand  from './tool.clipLand'

export class FuncTemperature {

  constructor(map) {
    this._map = map;
  }

  start() {
    Papa.parse('./static/data/temperature.csv', {
      download: true,
      header: false,
      complete: function (results) {
        this.getDataCallback.call(this, results);
      }.bind(this)
    });
  }

  stop　() {
    if(this._map.hasLayer(this._layer)) {
      this._map.removeLayer(this._layer);
    }
    if(this._map.hasLayer(this._heatLayer)) {
      this._map.removeLayer(this._heatLayer);
    }
  }

  getDataCallback (results) {
    var data = results.data || [];
    var newData = [];
    var temp = [];
    var i, len;
    for (i = 0, len = data.length; i < len; i++){
        if (data[i].length === 1 || i === len - 1) {
          if (temp.length >= 2) newData.push(temp);
          temp = [];
        } else {
          temp.push(data[i]);
        }
    }
    this._layer = new TemperatureLayer({
        isclip:true
    }, {
      data:newData
    }).addTo(this._map);

    // heatmap
    data = data.filter(function (value) {
      return value !== '' && value.length > 1;
    });
    // var ldata = [], rdata = [];
    // for (let i = 0, len = data.length; i < len; i++){
    //   ldata.push([data[i][0], data[i][1] - 360, data[i][2]]);
    //   rdata.push([data[i][0], data[i][1] + 360, data[i][2]]);
    // }
    var datacfg = {
      max: 39,
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
      "useLocalExtrema": false,
      // which field name in your data represents the latitude - default "lat"
      latField: '0',
      // which field name in your data represents the longitude - default "lng"
      lngField: '1',
      // which field name in your data represents the data value - default "value"
      valueField: '2'
    };
    var rheatmapLayer = this._heatLayer = new HeatmapOverlay(cfg);
    rheatmapLayer.setData(datacfg);
    this._map.addLayer(rheatmapLayer);
    this._layer.on('drawEnd', function () {
        ClipLand.clip(rheatmapLayer._heatmap._renderer.canvas, this._map);
    }, this);
    this._map.on('moveend zoomend', function () {
        ClipLand.clip(rheatmapLayer._heatmap._renderer.canvas, this._map);
    }, this);
  }
}
