import { CanvasLayer } from './leaflet.canvasLayer'

export var SurgeLayer = CanvasLayer.extend({

  initialize: function (options, config) {
    CanvasLayer.prototype.initialize.call(this, options);
    this.cfg = Object.assign({
      lat: '0',
      lng: '1',
      dir: '2',
      data: [],
      isDrawLeftRight: true
    }, config);
    this._data = this.cfg.data;
    this._sortData = this.sortByLat(this._data);
  },

  setData: function (data) {
    // -- custom data set
    this._data = data;
    this._sortData = this.sortByLat(this._data);
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
    var sortData = this._sortData;
    var latOffset = 1;
    var lngOffset = 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 根据不同级别确定抽稀粒度
    if(zoom < 2) {
      latOffset = 16;
      lngOffset = 16;
    } else if(zoom >= 2 && zoom < 3) {
      latOffset = 8;
      lngOffset = 8;
    } else if(zoom >= 3 && zoom < 5) {
      latOffset = 4;
      lngOffset = 4;
    } else {
      latOffset = 1;
      lngOffset = 1;
    }

    // 按纬度绘制
    var latPts, latlng, point, lpoint, rpoint, dir;
    for(let i = 0, len = sortData.length; i < len; i += latOffset) {
      latPts = sortData[i];
      for(let j = 0, lenj = latPts.length; j < lenj; j += lngOffset) {
        latlng = L.latLng(latPts[j][this.cfg.lat], latPts[j][this.cfg.lng]);
        point = map.latLngToContainerPoint(latlng);
        dir = Number(latPts[j][this.cfg.dir]);
        this.drawDirArrow(ctx, point, dir);
        if(this.cfg.isDrawLeftRight) {
          lpoint = map.latLngToContainerPoint(latlng.getSubtract360LatLng());
          rpoint = map.latLngToContainerPoint(latlng.getAdd360LatLng());
          this.drawDirArrow(ctx, lpoint, dir);
          this.drawDirArrow(ctx, rpoint, dir);
        }
      }
    }
  },

  sortByLat: function (data) {
    // console.time('按纬度分隔');
    var newData = [];
    var temp = [];
    // 将数据按纬度划分
    for(let i = 0, len = data.length; i < len; i++) {
      if(temp.length === 0) {
        temp.push(data[i]);
      } else {
        if(data[i][0] === temp[temp.length - 1][0]) {
          temp.push(data[i]);
        } else {
          newData.push(temp);
          temp = [];
        }
      }
    }
    // console.timeEnd('按纬度分隔');
    return newData;
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
    theta = typeof (theta) !== 'undefined' ? theta : 30;
    headlen = typeof (theta) !== 'undefined' ? headlen : 10;
    width = typeof (width) !== 'undefined' ? width : 1;
    color = typeof (color) !== 'color' ? color : '#000';
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
