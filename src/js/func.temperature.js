import { ParseData } from './tool.parseData';
import { HeatmapOverlay } from './leafletHeatmap/leaflet-heatmap';
import { TemperatureLayer } from './ocean.weather.temperature';
import ClipLand from './tool.clipLand';

export class FuncTemperature {

  constructor(map) {
    this._map = map;
  }

  start() {
    this.heatMapData = [];
    this.contourData = [];
    this.hlData = [];
    let row,
      temp = [];
    const url = './static/data/temperature.csv';
    ParseData(url, function (results, parser) {
      row = results.data[0];
      if (row.length === 1) {
        if (temp.length) this.contourData.push(temp);
        temp = [];
      } else if (row.length === 3) {
        if (typeof row[0] !== 'string') {
          temp.push(row);
          this.heatMapData.push(row);
        }
      } else if (row.length === 4) {
        if (typeof row[0] !== 'string') this.hlData.push(row);
      }
    }, function (results) {
      this.getDataCallback();
    }, this);
  }

  stop() {
    if (this._map.hasLayer(this._layer)) {
      this._map.removeLayer(this._layer);
    }
    if (this._map.hasLayer(this._heatLayer)) {
      this._map.removeLayer(this._heatLayer);
    }
  }

  getDataCallback() {
    // this.interpolate(this.heatMapData);
    // contour
    this._layer = new TemperatureLayer({
      isclip: true,
    }, {
      data: this.contourData,
      hlData: this.hlData,
    }).addTo(this._map);

    // heatmap
    const datacfg = {
      max: 100,
      data: this.heatMapData,
    };
    const cfg = {
      // radius should be small ONLY if scaleRadius is true (or small radius is intended)
      // if scaleRadius is false it will be the constant radius used in pixels
      radius: 4.0,
      maxOpacity: 0.68,
      // scales the radius based on map zoom
      scaleRadius: true,
      // if set to false the heatmap uses the global maximum for colorization
      // if activated: uses the data maximum within the current map boundaries
      //   (there will always be a red spot with useLocalExtremas true)
      useLocalExtrema: false,
      // defaultGradient: { 0.05: "#CC00FF", 0.25: "#6699FF", 0.45: "#99FF33", 0.65: "#FFFF33", 0.85: "#FF9933", 1.0: "#FF0000" },
      // which field name in your data represents the latitude - default "lat"
      latField: '0',
      // which field name in your data represents the longitude - default "lng"
      lngField: '1',
      // which field name in your data represents the data value - default "value"
      valueField: '2',
    };
    const rheatmapLayer = this._heatLayer = new HeatmapOverlay(cfg);
    rheatmapLayer.setData(datacfg);
    this._map.addLayer(rheatmapLayer);
    this._layer.on('drawEnd', function () {
      ClipLand.clip(rheatmapLayer._heatmap._renderer.canvas, this._map);
    }, this);
    this._map.on('moveend zoomend', function () {
      ClipLand.clip(rheatmapLayer._heatmap._renderer.canvas, this._map);
    }, this);
  }

  // test
  interpolate(data) {
    const points = this.getPointsFeatureCollection(data);
    console.time('iterpolateTime');
    const tin = turf.tin(points, 'elevation');
    // var grid = turf.interpolate(points, 100);
    console.timeEnd('iterpolateTime');
    L.geoJSON(tin, {
      style: function (feature) {
        return {
          color: this.getColor(feature.properties.c),
        };
      }.bind(this),
    }).addTo(this._map);
    // L.geoJSON(grid, {
    //   style: function (feature) {
    //     return {
    //       color: this.getColor(feature.properties.elevation)
    //     };
    //   }.bind(this)
    // }).addTo(this._map);
  }

  getPointsFeatureCollection(data) {
    let features = [],
      p;
    for (let i = 0, len = data.length; i < len; i++) {
      p = turf.point([Number(data[i][1]), Number(data[i][0])], { elevation: Number(data[i][2]) });
      features.push(p);
    }
    return turf.featureCollection(features);
  }

  getColor(value) {
    if (value <= 12) {
      return '#CC00FF';
    } else if (value > 12 && value <= 13) {
      return '#6699FF';
    } else if (value > 13 && value <= 14) {
      return '#99FF33';
    } else if (value > 14 && value <= 15) {
      return '#FFFF33';
    } else if (value > 15 && value <= 16) {
      return '#FF9933';
    }
    return '#FF0000';
  }

}
