import { CanvasLayer } from './leaflet.canvasLayer'
import geoJson from '../assets/outline.json'

export var PressureLayer = CanvasLayer.extend({

  initialize: function (options, config) {
    CanvasLayer.prototype.initialize.call(this, options);
    this.cfg = config;
    this._data = config && config.data || [];
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
    var ctx = info.canvas.getContext('2d');
    var map = info.layer._map;
    var data = this._data;
    var points , text;
    if(!data.length) {
      return;
    }
    ctx.clearRect(0, 0, info.canvas.width, info.canvas.height);
    for(let i = 0, len = data.length; i < len; i++) {
      points = this.getPoints(map, data[i]);
      text = data[i][0][2];
      this._drawLine(ctx, points);
      this._drawText(ctx, points[Math.floor(points.length / 2)] ,text);
    }

    // clip
    console.time('clip');
    var features = geoJson.features;
    var feature;
    for (let i = 0, len = features.length; i < len; i++){
      feature =  features[i];
      this._clipLand(info.canvas, ctx, map, feature);
    }
    console.timeEnd('clip');
  },

  getPoints (map, data) {
    // 待处理问题..... 跨180度
    var pts = [];
    var latlng;
    for (let i = 0, len = data.length; i < len; i++){
      latlng = L.latLng(data[i][0], data[i][1]);
      pts.push( map.latLngToContainerPoint(latlng));
    }
    return pts;
  },

  _drawLine: function (ctx, points) {
    var p ;
    ctx.save();
    ctx.beginPath();
    for (let i = 0, len = points.length; i < len; i++){
      p = points[i];
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();
  },

  _drawText: function (ctx, pt, text){
    ctx.save();
    ctx.textAlign = 'start';
    ctx.textBaseline = 'middle';
    ctx.font = 'normal normal 600 12px normal Microsoft YaHei';
    ctx.fillStyle = "#000";
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.strokeText(text, pt.x, pt.y);
    ctx.fillText(text, pt.x, pt.y);
    ctx.restore();
  },

  _clipLand:function (canvas, ctx, map, feature){
    var coords = [];
    if (feature.geometry.type === 'Polygon'){
      coords = feature.geometry.coordinates[0];
      this._drawClip(canvas, ctx, map, coords);
    } else if (feature.geometry.type === 'MultiPolygon'){
      var lines = feature.geometry.coordinates;
      for (let i = 0, len = lines.length; i < len; i++){
        coords = lines[i][0];
        this._drawClip(canvas, ctx, map, coords);
      }
    }
  },

  _drawClip: function (canvas, ctx, map, coords) {
    ctx.save();
    ctx.beginPath();
    for (let i = 0 , len = coords.length; i < len; i++) {
      var pt = map.latLngToContainerPoint(L.latLng(coords[i][1], coords[i][0]));
      i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.clip();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

});
