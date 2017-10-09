import { CanvasLayer } from './leaflet.canvasLayer'

export var WindLayer = CanvasLayer.extend({

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
      var level = obj[this.cfg.value];
      this._drawWind(ctx, point, +obj[this.cfg.dir], null, level);
    }
  },

  /**
   * 绘制风
   * @param  {obj} ctx 绘制context对象
   * @param  {obj} startpoint 起始点
   * @param  {Number} dir        方向
   * @param  {Number} r          线的长度 pixel
   * @param  {Number} level      风等级
   * @return {null}            null
   */
  _drawWind: function (ctx, startpoint, dir, r, level) {
    r = r || 16;
    var arc = (Math.PI * dir) / 180;
    var a = startpoint.x,
      b = startpoint.y,
      x0 = a,
      y0 = b - r;
    var x1 = a + (x0 - a) * Math.cos(arc) - (y0 - b) * Math.sin(arc);
    var y1 = b + (x0 - a) * Math.sin(arc) + (y0 - b) * Math.cos(arc);
    var endPoint = { x: x1, y: y1 };

    this.wind(ctx, startpoint, endPoint, level);
  },

  /**
   * 绘制风向和风力
   * @param  {object} ctx        canvas画布
   * @param  {obj} startPoint 起始点
   * @param  {obj} endPoint   终止点
   * @param  {Number} level      等级
   * @return {null}            null
   */
  wind: function (ctx, startPoint, endPoint, level) {
    var sp = startPoint,
      ep = endPoint;

    ctx.beginPath();

    //画风向
    ctx.moveTo(sp.x, sp.y);
    ctx.lineTo(ep.x, ep.y);

    //画等级
    var prs = this.getPRByLevel(startPoint, endPoint, level);
    for(var i = 0, len = prs.length; i < len; i++) {
      ep = prs[i].point;
      var r = prs[i].r;
      var k = (ep.y - sp.y) / (ep.x - sp.x);
      var r2 = Math.pow(r, 2);
      var k2 = Math.pow(k, 2);
      //不同坐标系符号问题
      if(ep.x > sp.x) {
        if(ep.y < sp.y) {
          var x = ep.x + Math.sqrt((r2 * k2) / (1 + k2));
          var y = ep.y + Math.sqrt(r2 / (1 + k2));
        } else {
          var x = ep.x - Math.sqrt((r2 * k2) / (1 + k2));
          var y = ep.y + Math.sqrt(r2 / (1 + k2));
        }

      } else if(ep.x < sp.x) {
        if(ep.y > sp.y) {
          var x = ep.x - Math.sqrt((r2 * k2) / (1 + k2));
          var y = ep.y - Math.sqrt(r2 / (1 + k2));
        } else {
          var x = ep.x + Math.sqrt((r2 * k2) / (1 + k2));
          var y = ep.y - Math.sqrt(r2 / (1 + k2));
        }
      } else {
        if(ep.y > sp.y) {
          var x = ep.x - r;
          var y = ep.y;
        } else {
          var x = ep.x + r;
          var y = ep.y;
        }
      }
      ctx.moveTo(ep.x, ep.y);
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#D8F2EC';
    ctx.stroke();
    ctx.closePath();
  },

  /**
   * 获取风的等级线的点和半径
   * @param  {obj} startPoint 起始点
   * @param  {obj} endPoint   终止点
   * @param  {Number} level      等级
   * @return {Array}            返回等级数组
   */
  getPRByLevel: function (startPoint, endPoint, level) {
    var prs = [],
      L2 = 4, // 等级为2时线的长度
      L4 = 8; // 等级为4时线的长度

    var p0 = endPoint,
      p1 = {
        x: (startPoint.x + 4 * endPoint.x) / 5,
        y: (startPoint.y + 4 * endPoint.y) / 5
      },
      p2 = {
        x: (2 * startPoint.x + 3 * endPoint.x) / 5,
        y: (2 * startPoint.y + 3 * endPoint.y) / 5
      },
      p3 = {
        x: (3 * startPoint.x + 2 * endPoint.x) / 5,
        y: (3 * startPoint.y + 2 * endPoint.y) / 5
      },
      p4 = {
        x: (4 * startPoint.x + endPoint.x) / 5,
        y: (4 * startPoint.y + endPoint.y) / 5
      };

    level = Math.round(level);
    var z = Math.floor(level / 4);
    var y = level % 4;
    if(z <= 0) {
      prs.push({
        point: p0,
        r: L2
      });
    } else if(z <= 1) {
      prs.push({
        point: p0,
        r: L4
      });
      if(y > 0) prs.push({
        point: p1,
        r: L2
      });
    } else if(z <= 2) {
      prs.push({
        point: p0,
        r: L4
      });
      prs.push({
        point: p1,
        r: L4
      });
      if(y > 0) prs.push({
        point: p2,
        r: L2
      });
    } else if(z <= 3) {
      prs.push({
        point: p0,
        r: L4
      });
      prs.push({
        point: p1,
        r: L4
      });
      prs.push({
        point: p2,
        r: L4
      });
      if(y > 0) prs.push({
        point: p3,
        r: L2
      });
    } else if(z <= 4) {
      prs.push({
        point: p0,
        r: L4
      });
      prs.push({
        point: p1,
        r: L4
      });
      prs.push({
        point: p2,
        r: L4
      });
      prs.push({
        point: p3,
        r: L4
      });
      if(y > 0) prs.push({
        point: p4,
        r: L2
      });
    } else {
      prs.push({
        point: p0,
        r: L4
      });
      prs.push({
        point: p1,
        r: L4
      });
      prs.push({
        point: p2,
        r: L4
      });
      prs.push({
        point: p3,
        r: L4
      });
      prs.push({
        point: p4,
        r: L4
      });
    }
    return prs;
  }
});
