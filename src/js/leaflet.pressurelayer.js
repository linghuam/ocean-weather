import { CanvasLayer } from './leaflet.canvasLayer'
import geoJson from '../assets/outline.json'

export var PressureLayer = CanvasLayer.extend({

  options:{
    isclip:false
  },

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
    var ctx = this._ctx = info.canvas.getContext('2d');
    var map = this._map = info.layer._map;
    var zoom = map.getZoom();
    var data = this._data;
    var points , lpoints, rpoints, text;
    if(!data.length) {
      return;
    }
    ctx.clearRect(0, 0, info.canvas.width, info.canvas.height);
    for(let i = 0, len = data.length; i < len; i++) {
      points = this.getPoints(map, data[i]);
      lpoints = this.getLeft360Points(map, data[i]);
      rpoints = this.getRight360Points(map, data[i]);
      text = data[i][0][2];
      this._drawLine(ctx, points);
      this._drawLine(ctx, lpoints);
      this._drawLine(ctx, rpoints);
      if (zoom >= 3 && zoom < 5 && text >=1000 || zoom >= 5) {
        this._drawText(ctx, points[Math.floor(points.length / 2)] ,text);
        this._drawText(ctx, lpoints[Math.floor(points.length / 2)] ,text);
        this._drawText(ctx, rpoints[Math.floor(points.length / 2)] ,text);
      }
    }

    // clip
    if (this.options.isclip){
      this._clip(info.canvas, ctx, map);
    }
  },

  getPoints (map, data) {
    // 待处理问题..... 跨180度
    var pts = [];
    var latlngs = [], latlng;
    for (let i = 0, len = data.length; i < len; i++){
      latlng = L.latLng(data[i][0], data[i][1]);
      latlngs.push(latlng);
    }
    // 转化
    latlngs = this._legelLatLngs(latlngs);
    for (let i = 0, len = latlngs.length; i < len; i++){
      pts.push( map.latLngToContainerPoint(latlngs[i]));
    }
    return pts;
  },

  getLeft360Points (map, data) {
    // 待处理问题..... 跨180度
    var pts = [];
    var latlngs = [], latlng;
    for (let i = 0, len = data.length; i < len; i++){
      latlng = L.latLng(data[i][0], Number(data[i][1]) - 360);
      latlngs.push(latlng);
    }
    // 转化
    latlngs = this._legelLatLngs(latlngs);
    for (let i = 0, len = latlngs.length; i < len; i++){
      pts.push( map.latLngToContainerPoint(latlngs[i]));
    }
    return pts;
  },

  getRight360Points (map, data) {
    // 待处理问题..... 跨180度
    var pts = [];
    var latlngs = [], latlng;
    for (let i = 0, len = data.length; i < len; i++){
      latlng = L.latLng(data[i][0], Number(data[i][1]) + 360);
      latlngs.push(latlng);
    }
    // 转化
    latlngs = this._legelLatLngs(latlngs);
    for (let i = 0, len = latlngs.length; i < len; i++){
      pts.push( map.latLngToContainerPoint(latlngs[i]));
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

 // 剪掉陆地部分
  _clip: function (canvas, ctx, map){
    console.time('clip');
    var features = geoJson.features;
    var feature;
    for (let i = 0, len = features.length; i < len; i++){
      feature =  features[i];
      this._clipLand(canvas, ctx, map, feature);
    }
    console.timeEnd('clip');
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
    var pt , lpt, rpt;
    ctx.save();
    ctx.beginPath();
    for (let i = 0 , len = coords.length; i < len; i++) {
      pt = map.latLngToContainerPoint(L.latLng(coords[i][1], coords[i][0]));
      i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    for (let i = 0 , len = coords.length; i < len; i++) {
      lpt = map.latLngToContainerPoint(L.latLng(coords[i][1], Number(coords[i][0]) - 360));
      i === 0 ? ctx.moveTo(lpt.x, lpt.y) : ctx.lineTo(lpt.x, lpt.y);
    }
    ctx.closePath();
    for (let i = 0 , len = coords.length; i < len; i++) {
      rpt = map.latLngToContainerPoint(L.latLng(coords[i][1], Number(coords[i][0]) + 360));
      i === 0 ? ctx.moveTo(rpt.x, rpt.y) : ctx.lineTo(rpt.x, rpt.y);
    }
    ctx.closePath();
    ctx.clip();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  },

 // 计算跨180度问题
  _caculateMeridian: function (latLngA, latLngB) {
    //  var is = this.isCrossMeridian(latLngA, latLngB);
    var is = true;
    if(is) {
      var p = this._map.project(latLngA),
        pb = latLngB,
        pb1 = latLngB.getAdd360LatLng(),
        pb2 = latLngB.getSubtract360LatLng(),
        disb = p.distanceTo(this._map.project(pb)),
        disb1 = p.distanceTo(this._map.project(pb1)),
        disb2 = p.distanceTo(this._map.project(pb2)),
        min = Math.min(disb, disb1, disb2);
      if(min === disb) {
        return pb;
      } else if(min === disb1) {
        return pb1;
      } else {
        return pb2;
      }
    } else {
      return latLngB;
    }
  },

  _legelLatLngs : function (latlngs) {
    var result = [],
      flat = latlngs[0] instanceof L.LatLng,
      len = latlngs.length,
      i;
    for(i = 0; i < len; i++) {
      if(flat) {
        var tempi = latlngs[i];
        if(i >= 1) {
          var tempibefore = result[i - 1];
          result[i] = this._caculateMeridian(tempibefore, tempi);
        } else {
          result[i] = tempi;
        }
      } else {
        result[i] = this._legelLatLngs(latlngs[i]);
      }
    }
    return result;
  }

});
