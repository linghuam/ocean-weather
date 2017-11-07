import { CanvasLayer } from './leaflet.canvasLayer'

export var WindLayer = CanvasLayer.extend({

  initialize: function (options, config) {
    CanvasLayer.prototype.initialize.call(this, options);
    this.cfg = config;
    this._data = config && config.data || [];
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
    var latOffset = 1, lngOffset = 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(zoom < 2){
      latOffset = 16;
      lngOffset = 16;
    }else if (zoom >= 2 && zoom < 3){
      latOffset = 8;
      lngOffset = 8;
    } else if (zoom >= 3 && zoom < 5){
      latOffset = 4;
      lngOffset = 4;
    } else {
      latOffset = 1;
      lngOffset = 1;
    }

   var latPts , latlng, point, lpoint, rpoint, level, dir;
   for (let i = 0, len = sortData.length; i < len; i+=latOffset) {
     latPts = sortData[i];
     for (let j = 0, lenj = latPts.length; j < lenj; j+=lngOffset){
       latlng = L.latLng(latPts[j][this.cfg.lat], latPts[j][this.cfg.lng]);
       point =  map.latLngToContainerPoint(latlng);
       lpoint =  map.latLngToContainerPoint(latlng.getSubtract360LatLng());
       rpoint =  map.latLngToContainerPoint(latlng.getAdd360LatLng());
       level = latPts[j][this.cfg.value];
       dir = latPts[j][this.cfg.dir];
       this._drawWind(ctx, point, dir, level);
       this._drawWind(ctx, lpoint, dir, level);
       this._drawWind(ctx, rpoint, dir, level);
     }
   }
  },

  sortByLat: function (data) {
    console.time('按纬度分隔');
    var newData = [];
    var temp = [];
    // 将数据按纬度划分
    for (let i = 0, len = data.length; i < len; i++){
      if (temp.length === 0){
        temp.push(data[i]);
      } else {
        if (data[i][0] === temp[temp.length-1][0]){
          temp.push(data[i]);
        }else{
          newData.push(temp);
          temp = [];
        }
      }
    }
    console.timeEnd('按纬度分隔');
    return newData;
  },

  /**
   * 绘制风
   * @param  {obj} ctx 绘制context对象
   * @param  {obj} startpoint 起始点
   * @param  {Number} dir        方向
   * @param  {Number} level      风等级
   * @param  {Number} r          线段的长度 pixel
   * @return {null}            null
   */
  _drawWind: function (ctx, startpoint, dir, level, r) {
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
    ctx.strokeStyle = '#2A3BFD';
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
