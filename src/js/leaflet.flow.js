import { CanvasLayer } from './leaflet.canvasLayer'

export var FlowLayer = CanvasLayer.extend({

  initialize: function (options, config) {
    CanvasLayer.prototype.initialize.call(this, options);
    this.cfg = config;
    this._data = (config && config.data) || [];
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
    if(!data.length) {
      return;
    }
    ctx.clearRect(0, 0, info.canvas.width, info.canvas.height);
    for(let i = 0, len = data.length; i < len; i++) {
      var obj = data[i];
      var latlng = L.latLng(obj[this.cfg.lat], obj[this.cfg.lng]);
      var point = map.latLngToContainerPoint(latlng);
      this.drawDirArrow(ctx, point, +obj[this.cfg.dir]);
    }
  },
  /**
   * 绘箭头
   * @param  {object} startpoint 起始点
   * @param  {Number} dir        偏移方向
   * @param  {Number} r          长度
   * @return {null}            null
   */
  drawDirArrow: function (ctx, startpoint, dir, r) {
    r = r || 12;
    var arc = (Math.PI * dir) / 180;
    var a = startpoint.x,
      b = startpoint.y,
      x0 = a,
      y0 = b - r;
    var x1 = a + (x0 - a) * Math.cos(arc) - (y0 - b) * Math.sin(arc);
    var y1 = b + (x0 - a) * Math.sin(arc) + (y0 - b) * Math.cos(arc);
    this.drawArrow(ctx, a, b, x1, y1, 30, 6, 1, '#1494B7');
  },

  /*
   * https://www.w3cplus.com/canvas/drawing-arrow.html
   * https://www.zybang.com/question/fda330126d2232e5159d1ff1b69186b0.html
   */
  /**
   * 绘制箭头
   * @param  {object} ctx     canvas画布
   * @param  {Number} fromX   起始点x坐标
   * @param  {Number} fromY   起始点y坐标
   * @param  {Number} toX     终止点x坐标
   * @param  {Number} toY     终止点y坐标
   * @param  {Number} theta   箭头倾斜角度
   * @param  {Number} headlen 箭头长度
   * @param  {Number} width   线宽
   * @param  {String} color   颜色
   * @return {null}         null
   */
  drawArrow: function (ctx, fromX, fromY, toX, toY, theta, headlen, width, color) {
    theta = typeof (theta) != 'undefined' ? theta : 30;
    headlen = typeof (theta) != 'undefined' ? headlen : 10;
    width = typeof (width) != 'undefined' ? width : 1;
    color = typeof (color) != 'color' ? color : '#000';
    // 计算各角度和对应的P2,P3坐标
    var angle = Math.atan2(fromY - toY, fromX - toX) * 180 / Math.PI,
      angle1 = (angle + theta) * Math.PI / 180,
      angle2 = (angle - theta) * Math.PI / 180,
      topX = headlen * Math.cos(angle1),
      topY = headlen * Math.sin(angle1),
      botX = headlen * Math.cos(angle2),
      botY = headlen * Math.sin(angle2);
    ctx.save();
    ctx.beginPath();
    var arrowX = fromX - topX,
      arrowY = fromY - topY;
    ctx.moveTo(arrowX, arrowY);
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    arrowX = toX + topX;
    arrowY = toY + topY;
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(toX, toY);
    arrowX = toX + botX;
    arrowY = toY + botY;
    ctx.lineTo(arrowX, arrowY);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.restore();
  }
});
