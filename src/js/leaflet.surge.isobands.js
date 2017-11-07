import { CanvasLayer } from './leaflet.canvasLayer'

export var SurgeISOBands = CanvasLayer.extend({

  initialize: function (options, config) {
    CanvasLayer.prototype.initialize.call(this, options);
    this.cfg = Object.assign({
      lat: '0',
      lng: '1',
      value: '2',
      dir: '3',
      data: [],
      isDrawLeftRight: true
    }, config);
    this._data = this.cfg.data;
  },

  setData: function (data) {
    // -- custom data set
    this._data = data;
    this.needRedraw(); // -- call to drawLayer
  },

  onLayerDidMount: function () {
    // -- prepare custom drawing
  },

  onLayerWillUnmount: function () {
    // -- custom cleanup
  },

  onDrawLayer: function (info) {
    // -- custom  draw
    var canvas = this._canvas = info.canvas;
    var ctx = this._ctx = info.canvas.getContext('2d');
    var map = this._map = info.layer._map;
    var zoom = map.getZoom();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var pointGrid = this.getPointsFeatureCollection(this._data);
    var breaks = [0, 1, 2, 3, 4, 5, 6, 7];
    var isobands = turf.isobands(pointGrid, breaks);
    L.geoJSON(isobands).addTo(map);
  },

  getPointsFeatureCollection: function (data) {
    var features = [], p;
    for(let i = 0, len = data.length; i < len; i++) {
      p = turf.point([ Number(data[i][this.cfg.lng]), Number(data[i][this.cfg.lat]) ], { elevation: Number(data[i][this.cfg.value]) });
      features.push(p);
    }
    return turf.featureCollection(features);
  }

});
