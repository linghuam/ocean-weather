import { ParseData } from './tool.parseData'
import { HeatmapOverlay } from './leafletHeatmap/leaflet-heatmap'
import { TemperatureLayer } from './ocean.weather.temperature'
import  ClipLand  from './tool.clipLand'

export class FuncTemperature {

  constructor(map) {
    this._map = map;
  }

  start() {
    this.heatMapData = [];
    this.contourData = [];
    this.hlData = [];
    var row , temp = [];
    var url = './static/data/temperature.csv';
    ParseData(url, function(results, parser) {
      row = results.data[0];
      if (row.length === 1) {
        if (temp.length) this.contourData.push(temp);
        temp = [];
      } else if (row.length === 3) {
        if ( typeof row[0] !== 'string') {
          temp.push(row);
          this.heatMapData.push(row);
        }
      } else if (row.length === 4) {
        if ( typeof row[0] !== 'string') this.hlData.push(row);
      }
    },function (results) {
      this.getDataCallback();
    }, this);
  }

  stop　() {
    if(this._map.hasLayer(this._layer)) {
      this._map.removeLayer(this._layer);
    }
    if(this._map.hasLayer(this._heatLayer)) {
      this._map.removeLayer(this._heatLayer);
    }
  }

  getDataCallback () {
    // contour
    this._layer = new TemperatureLayer({
        isclip:true
    }, {
      data: this.contourData,
      hlData: this.hlData
    }).addTo(this._map);

    // heatmap
    var datacfg = {
      max: 39,
      data: this.heatMapData
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
