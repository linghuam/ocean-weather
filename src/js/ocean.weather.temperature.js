import { CanvasLayer } from './leaflet.canvasLayer'
import  ClipLand  from './tool.clipLand'

/**
 * 气象图层 - 温度
 */
export var TemperatureLayer = CanvasLayer.extend({

  options:{
    isclip: true,
    isDrawLeftRight: false,
    showLevel: 4, // 文字的显示级别
    stroke: true,
    color:  '#605FF0', //'#61A5E8',
    weight: 0.8,
    opacity: 0.85,
    lineCap: 'round',
    lineJoin: 'round',
    fill: false,
    fontSize: '12px',
    fontWeight: 600,
    fontFamily: 'Microsoft YaHei',
    fontColor: '#61A5E8',
    fontStrokeSize: 3,
    fontStrokeColor: '#fff'
  },

  initialize: function (options, config) {
    CanvasLayer.prototype.initialize.call(this, options);
    this.cfg = Object.assign({
      lat: '0',
      lng: '1',
      value: '2',
      data: [],
      hlData: []
    }, config);
    this._data = this.cfg.data;
    this._hlData = this.cfg.hlData;
  },

  setData: function (data, hlData) {
    // -- custom data set
    this._data = data;
    this._hlData = hlData || [];
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
    var data = this._data;
    var hlData = this._hlData;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this._drawContour(data, ctx, map, zoom);
    this._drawHL(hlData, ctx, map, zoom);
    if (this.options.isclip)  ClipLand.clip(canvas, map);

    this.fire('drawEnd');
  },

  _drawContour (data, ctx, map, zoom){
    var points , lpoints, rpoints, text;
    // var {hmin, lmax} = this.getHLMaxMinValue();
    for(let i = 0, len = data.length; i < len; i++) {
      points = this.getPoints(map, data[i]);
      text = data[i][0][this.cfg.value];
      this._drawLine(ctx, points);
      if (this.options.isDrawLeftRight){
        lpoints = this.getLeft360Points(map, data[i]);
        rpoints = this.getRight360Points(map, data[i]);
        this._drawLine(ctx, lpoints);
        this._drawLine(ctx, rpoints);
      }
      if (zoom >= this.options.showLevel) { // zoom >= 3 && zoom < 5 && text >= 1000 || zoom >= 5
        this._drawText(ctx, points[Math.floor(points.length / 2)] ,text);
        if (this.options.isDrawLeftRight){
          this._drawText(ctx, lpoints[Math.floor(points.length / 2)] ,text);
          this._drawText(ctx, rpoints[Math.floor(points.length / 2)] ,text);
        }
      }
    }
  },

  _drawHL (data, ctx, map, zoom) {
    var latlng, point, lpoint, rpoint, ishl, value;
    for (let i = 0, len = data.length; i < len; i++){
      latlng = L.latLng(data[i][0], data[i][1]);
      point = map.latLngToContainerPoint(latlng);
      lpoint = map.latLngToContainerPoint(latlng.getSubtract360LatLng());
      rpoint = map.latLngToContainerPoint(latlng.getAdd360LatLng());
      ishl = data[i][2];
      value = data[i][3];
      this._drawHLText(ctx, point, ishl, value);
      if (this.options.isDrawLeftRight) {
          this._drawHLText(ctx, lpoint, ishl, value);
          this._drawHLText(ctx, rpoint, ishl, value);
      }
    }
  },

  getHLMaxMinValue (){
    var hmin, lmax;
    var harr = [], larr = [];
    for (let i = 0, len = this._hlData.length; i < len; i++){
      if (this._hlData[i][2] === 1) harr.push( this._hlData[i][3] );
      else larr.push( this._hlData[i][3] );
    }
    hmin = Math.min(...harr);
    lmax = Math.max(...larr);
    return {hmin, lmax};
  },

  getPoints (map, data) {
    var pts = [];
    var latlngs = [], latlng;
    for (let i = 0, len = data.length; i < len; i++){
      latlng = L.latLng(data[i][this.cfg.lat], data[i][this.cfg.lng]);
      latlngs.push(latlng);
    }
    // 跨180度合理化
    latlngs = this._legelLatLngs(latlngs);
    for (let i = 0, len = latlngs.length; i < len; i++){
      pts.push( map.latLngToContainerPoint(latlngs[i]));
    }
    return pts;
  },

  getLeft360Points (map, data) {
    var pts = [];
    var latlngs = [], latlng;
    for (let i = 0, len = data.length; i < len; i++){
      latlng = L.latLng(data[i][this.cfg.lat], Number(data[i][this.cfg.lng]) - 360);
      latlngs.push(latlng);
    }
    // 跨180度合理化
    latlngs = this._legelLatLngs(latlngs);
    for (let i = 0, len = latlngs.length; i < len; i++){
      pts.push( map.latLngToContainerPoint(latlngs[i]));
    }
    return pts;
  },

  getRight360Points (map, data) {
    var pts = [];
    var latlngs = [], latlng;
    for (let i = 0, len = data.length; i < len; i++){
      latlng = L.latLng(data[i][this.cfg.lat], Number(data[i][this.cfg.lng]) + 360);
      latlngs.push(latlng);
    }
    // 跨180度合理化
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
    this._fillStroke(ctx);
    ctx.restore();
  },

  _drawText: function (ctx, pt, text){
    ctx.save();
    ctx.textAlign = 'start';
    ctx.textBaseline = 'middle';
    ctx.font = 'normal ' + this.options.fontWeight + ' ' + this.options.fontSize + ' ' + this.options.fontFamily;
    ctx.fillStyle = this.options.fontColor;
    ctx.strokeStyle = this.options.fontStrokeColor;
    ctx.lineWidth = this.options.fontStrokeSize;
    ctx.strokeText(text, pt.x, pt.y);
    ctx.fillText(text, pt.x, pt.y);
    ctx.restore();
  },

  _drawHLText: function(ctx, pt, ishl, value){
    var hl = ishl === 1 ? 'H' : 'L';
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'normal normal 12px Microsoft YaHei';
    ctx.fillStyle = ishl ? '#E16757' : '#EECB5F';
    ctx.strokeStyle = this.options.fontStrokeColor;
    ctx.lineWidth = this.options.fontStrokeSize;
    ctx.strokeText(hl, pt.x, pt.y);
    ctx.fillText(hl, pt.x, pt.y);
    ctx.strokeText(value, pt.x, pt.y + 12);
    ctx.fillText(value, pt.x, pt.y + 12);
    ctx.restore();
  },

  _fillStroke: function (ctx) {
		var options = this.options;

		if (options.fill) {
			ctx.globalAlpha = options.fillOpacity;
			ctx.fillStyle = options.fillColor || options.color;
			ctx.fill(options.fillRule || 'evenodd');
		}

		if (options.stroke && options.weight !== 0) {
			if (ctx.setLineDash) {
				ctx.setLineDash(this.options && this.options._dashArray || []);
			}
			ctx.globalAlpha = options.opacity;
			ctx.lineWidth = options.weight;
			ctx.strokeStyle = options.color;
			ctx.lineCap = options.lineCap;
			ctx.lineJoin = options.lineJoin;
			ctx.stroke();
		}
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
