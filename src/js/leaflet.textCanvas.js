import geoJson from '../assets/outline.json'

/*
 * 线写文字 canvas
 */
export var LineTextCanvas = L.Canvas.extend({

  _updatePoly: function (layer, closed) {
    L.Canvas.prototype._updatePoly.call(this, layer, closed);
    this._updateText(layer, closed);
    this._updateOutLine(layer);
  },

  /*
   * 在移除时移除整个canvas，避免遗留多余canvas元素
   * 只针对气象功能
   */
  _removePath: function (layer) {
    layer._removed = true;
    L.DomUtil.remove(this._container);
  },

  _updateText: function (layer, closed) {
    var ctx = this._ctx;
    var text = layer.options.text || '';
    var parts = layer._parts;
    var map = this._map;
    var zoom = this._map.getZoom(); // 当前级别

    // 线分段算法 【性能不佳】
    // var geojson = layer.toGeoJSON();
    // var chunk = turf.lineChunk(geojson, 100, 'kilometers');
    // L.geoJSON(chunk).addTo(map);
    //
    //
    // console.time('turf');
    // var latlngs = layer.getChunkLatlngs();
    // console.timeEnd('turf');
    // for (var i = 0, len = latlngs.length; i < len; i++){
    //   var pt = map.latLngToLayerPoint(latlngs[i]);
    //   this._drawText(ctx, text, pt);
    // }
    //
    //
    var pt = map.latLngToLayerPoint(layer.getCenter());
    this._drawText(ctx, text, pt);

    // 根据级别进行数据抽稀
    if (zoom < 3) {

    } else if (zoom >= 3 && zoom < 5){

    } else {

    }
  },

  _drawText: function (ctx, text, pt) {
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

  _updateOutLine: function (layer) {
    var ctx = this._ctx;
    var map = this._map;

    // test -start
    // var pt = map.latLngToLayerPoint(layer.getCenter());
    // ctx.save();
    // ctx.beginPath();
    // ctx.moveTo(pt.x ,pt.y);
    // ctx.lineTo(pt.x + 40, pt.y);
    // ctx.lineTo(pt.x + 40, pt.y + 40);
    // ctx.lineTo(pt.x, pt.y + 40);
    // ctx.closePath();
    // ctx.clip();
    // ctx.clearRect(0, 0, this._container.width *2, this._container.height *2);
    // ctx.restore();
    // test -end

    // $.getJSON('./static/data/outline.json', function (geojson){
    //   L.geoJSON(geojson).addTo(map);
    // });
      // 可行，但每次绘制一个图形要执行clip，浪费时间，所以要自己实现绘制类
      console.time('clip');
      var features = geoJson.features;
      var feature;
      for (var i = 0, len = features.length; i < len; i++){
        feature =  features[i];
        this._clearFeatureArea(feature);
      }
      console.timeEnd('clip');
  },

  _clearFeatureArea: function (feature) {
    var ctx = this._ctx;
    var map = this._map;
    if (feature.geometry.type === 'Polygon'){
      var coords = feature.geometry.coordinates[0];
    } else if (feature.geometry.type === 'MultiPolygon'){
        var coords = feature.geometry.coordinates[0][0];
    }
    ctx.save();
    ctx.beginPath();
    for (var i = 0 , len = coords.length; i < len; i++) {
      var pt = map.latLngToLayerPoint(L.latLng(coords[i][1], coords[i][0]));
      i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    ctx.clip();
    ctx.clearRect(0, 0, this._container.width *2, this._container.height *2);
    ctx.restore();
  }
});

/*
 * 矩形内写文字 canvas
 */
export var RectTextCanvas = L.Canvas.extend({

  initialize: function (options) {
    L.Canvas.prototype.initialize.call(this, options);
    // L.Util.setOptions(this,options);
  },

  _updatePoly: function (layer, closed) {
    L.Canvas.prototype._updatePoly.call(this, layer, closed);
    if(layer.options.text === undefined) {
      return;
    } else {
      this._text(layer, closed);
    }
  },

  _text: function (layer, closed) {
    var ctx = this._ctx,
      text = layer.options.text,
      map = this._map;
    var center = layer.getBounds().getCenter();
    var pt = map.latLngToLayerPoint(center);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'Microsoft YaHei';
    ctx.fillStyle = "#000";
    ctx.fillText(text, pt.x, pt.y);
  }
});
