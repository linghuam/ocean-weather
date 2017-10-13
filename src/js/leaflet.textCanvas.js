import {} from './ctxtextpath'
/*
 * 线写文字 canvas
 */
var LineTextCanvas = L.Canvas.extend({

  _updatePoly: function (layer, closed) {
    L.Canvas.prototype._updatePoly.call(this, layer, closed);
    if(layer.options.text) {
      this._text(layer, closed);
    }
  },

  /*
   * 在移除时移除整个canvas，避免遗留多余canvas元素
   * 只针对气象功能
   */
  _removePath: function (layer) {
    layer._removed = true;
    L.DomUtil.remove(this._container);
  },

  _text: function (layer, closed) {
    var ctx = this._ctx,
      text = layer.options.text,
      parts = layer._parts,
      map = this._map;
    if(!parts.length) {
      return;
    }
    try {
      var center = layer.getCenter();
      var pt = map.latLngToLayerPoint(center);
      // var txtpaths = [];
      // for (let i = 0, len = parts.length; i < len; i++){
      //   txtpaths.push(parts[i].x,parts[i].y);
      // }
      ctx.save();
      ctx.textAlign = 'start';
      ctx.textBaseline = 'middle';
      ctx.font = 'normal normal 600 12px normal Microsoft YaHei';
      ctx.fillStyle = "#000";
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.strokeText(text, pt.x, pt.y);
      ctx.fillText(text, pt.x, pt.y);
      // if (txtpaths.length > 6) {
      //   ctx.textPath(text, txtpaths);        
      // }
      ctx.restore();
    } catch(ex) {
      var width = this._container.width;
      var height = this._container.height;
      ctx.clearRect(0, 0, width * 2, height * 2);
      // console.log(ex);
      // console.log(this._layers);
    }
  }
});

/*
 * 矩形内写文字 canvas
 */
var RectTextCanvas = L.Canvas.extend({

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


export {
  LineTextCanvas,
  RectTextCanvas
}
