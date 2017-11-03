/*
 * 线写文字 canvas
 */
export var LineTextCanvas = L.Canvas.extend({

  _updatePoly: function (layer, closed) {
    L.Canvas.prototype._updatePoly.call(this, layer, closed);
    this._updateText(layer, closed);
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

    // 线分段算法
    var geojson = layer.toGeoJSON();
    var chunk = turf.lineChunk(geojson, 10, 'kilometers');
    // L.geoJSON(chunk).addTo(map);
    
    // 根据级别进行数据抽稀
    if (zoom < 3) {

    } else if (zoom >= 3 && zoom < 5){

    } else {

    }
    if(!parts.length) {
      return;
    }
    try {
      var center = layer.getCenter();
      var pt = map.latLngToLayerPoint(center);
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
    } catch(ex) {
      var width = this._container.width;
      var height = this._container.height;
      // ctx.clearRect(0, 0, width * 2, height * 2);
    }
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

