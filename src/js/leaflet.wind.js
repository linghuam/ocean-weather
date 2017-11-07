import { CanvasLayer } from './leaflet.canvasLayer'

class  Wind {
  /**
   * 构造函数
   * @param  {L.LatLng} latlng 经纬度
   * @param  {Number} speed  风速（海里/小时）
   * @param  {Number} dir    风向（度，正北方向为0度，顺时针）
   * @param  {Object} options    绘制选项
   * @return {Null}        [description]
   */
   constructor (latlng, speed, dir, options = {}) {
     this._latlng = latlng;
     this._speed = this._convertToMileS(speed);
     this._dir = dir;
     this.options = Object.assign({
       windLineLen: 16,
       levelLineMinLen: 4,
       chunkCount: 6 //等分点个数，至少六等分
     },options);
   }

   get latLng (){
     return this._latlng;
   }

   set latLng (value){
     this._latlng = value;
   }

   get speed () {
     return this._speed;
   }

   set speed (value) {
     this._speed = this._convertToMileS(value);
   }

   get dir () {
     return this._dir;
   }

   set dir (value) {
     this._dir = value;
   }

   get level () {
    //  return 10;
     var level = 0;
     var speed = this._speed;
     if (speed <= 0.2) {
       level = 0;
     } else if ( speed > 0.2 && speed <= 1.5 ){
       level = 1;
     } else if ( speed > 1.5 && speed <= 3.3 ){
       level = 2;
     } else if ( speed > 3.3 && speed <= 5.4 ){
       level = 3;
     } else if ( speed > 5.4 && speed <= 7.9 ){
       level = 4;
     } else if ( speed > 7.9 && speed <= 10.7 ){
       level = 5;
     } else if ( speed > 10.7 && speed <= 13.8 ){
       level = 6;
     } else if ( speed > 13.8 && speed <= 17.1 ){
       level = 7;
     } else if ( speed > 17.1 && speed <= 20.7 ){
       level = 8;
     } else if ( speed > 20.7 && speed <= 24.4 ){
       level = 9;
     } else if (  speed > 24.4 && speed <= 28.4 ){
       level = 10;
     } else if ( speed > 28.4 && speed <= 32.6 ){
       level = 11;
     } else if ( speed > 32.6 && speed <= 36.9 ){
       level = 12;
     } else if ( speed > 36.9 && speed <= 41.4 ){
       level = 13;
     } else if ( speed > 41.4 && speed <= 46.1 ){
       level = 14;
     } else if ( speed > 46.1 && speed <= 50.9 ){
       level = 15;
     } else if ( speed > 50.9 && speed <= 56.0 ){
       level = 16;
     } else if ( speed > 56.0 ){
       level = 17;
     }
    //  switch (speed) {
    //    case speed <= 0.2: level = 0; break;
    //    case speed > 0.2 && speed <= 1.5: level = 1; break;
    //    case speed > 1.5 && speed <= 3.3: level = 2; break;
    //    case speed > 3.3 && speed <= 5.4: level = 3; break;
    //    case speed > 5.4 && speed <= 7.9: level = 4; break;
    //    case speed > 7.9 && speed <= 10.7: level = 5; break;
    //    case speed > 10.7 && speed <= 13.8: level = 6; break;
    //    case speed > 13.8 && speed <= 17.1: level = 7; break;
    //    case speed > 17.1 && speed <= 20.7: level = 8; break;
    //    case speed > 20.7 && speed <= 24.4: level = 9; break;
    //    case speed > 24.4 && speed <= 28.4: level = 10; break;
    //    case speed > 28.4 && speed <= 32.6: level = 11; break;
    //    case speed > 32.6 && speed <= 36.9: level = 12; break;
    //    case speed > 36.9 && speed <= 41.4: level = 13; break;
    //    case speed > 41.4 && speed <= 46.1: level = 14; break;
    //    case speed > 46.1 && speed <= 50.9: level = 15; break;
    //    case speed > 50.9 && speed <= 56.0: level = 16; break;
    //    case speed > 56.0 : level = 17; break;
    //    default:;
    //  }
     return level;
   }

   get color (){
     var speed = this._speed;
     if (speed <= 7.9) {
       // 0-4级风
       return '#D3DE44';
     } else if (speed > 7.9 && speed <= 20.7){
       // 5-8级风
       return '#E68514';
     } else if (speed > 20.7 && speed <= 36.9) {
       // 9-12级风
       return '#E82318';
     } else {
       // 13-17级风
       return '#B80D75';
     }
   }

   _convertToMileS (speed){
     return Number(speed) * 1852 / 3600;
   }
}

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

   var latPts , latlng, point, lpoint, rpoint, speed, dir, windobj;
   for (let i = 0, len = sortData.length; i < len; i+=latOffset) {
     latPts = sortData[i];
     for (let j = 0, lenj = latPts.length; j < lenj; j+=lngOffset){
       latlng = L.latLng(latPts[j][this.cfg.lat], latPts[j][this.cfg.lng]);
       point =  map.latLngToContainerPoint(latlng);
       lpoint =  map.latLngToContainerPoint(latlng.getSubtract360LatLng());
       rpoint =  map.latLngToContainerPoint(latlng.getAdd360LatLng());
       speed = Number(latPts[j][this.cfg.value]);
       dir = Number(latPts[j][this.cfg.dir]);
       windobj = new Wind(latlng, speed, dir);
       this.drawWind(ctx, windobj);
      //  this._drawWind(ctx, point, dir, speed);
      //  this._drawWind(ctx, lpoint, dir, speed);
      //  this._drawWind(ctx, rpoint, dir, speed);
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

  drawWind: function (ctx, WindObj){
    var startPoint = this._map.latLngToContainerPoint(WindObj.latLng);
    var len = WindObj.options.windLineLen;
    var r = WindObj.options.levelLineMinLen;
    var arc = Math.PI / 180 * WindObj.dir;
    var a = startPoint.x;
    var b = startPoint.y;
    var x0 = a;
    var y0 = b - len;
    var endPoint = {
      x :  a + (x0 - a) * Math.cos(arc) - (y0 - b) * Math.sin(arc),
      y :  b + (x0 - a) * Math.sin(arc) + (y0 - b) * Math.cos(arc)
    };
    var level = WindObj.level;
    var floorLevel = Math.floor(level / 8);
    var color = WindObj.color;

    var count8 = floorLevel; // 8级个数
    var count2 = Math.floor(level % 8 / 2); // 2级个数
    var count1 = level % 2 === 0 ? 0 : 1; // 1级个数
    var count = WindObj.options.chunkCount;// 等分点个数

    ctx.save();
    ctx.beginPath();
    if (count8 === 0 && count2 === 0 && count1 === 0){
      ctx.arc(startPoint.x , startPoint.y, r, 0, Math.PI * 2);
    } else {
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      // 8 级
      for (let i = 0; i < count8; i++){
        let sp = this.getChunkPoint(startPoint, endPoint, count, 2 * i + 1);
        let sp2 = this.getChunkPoint(startPoint, endPoint, count, 2 * i + 1 + 2);
        let lp = this.getPointByDistance(startPoint, sp, r * 2);
        ctx.moveTo(sp.x, sp.y);
        ctx.lineTo(lp.x, lp.y);
        ctx.lineTo(sp2.x, sp2.y);
      }
      // 2级
      for (let i = 0; i < count2; i++){
        // let sp = this.getChunkPoint(startPoint, endPoint, count, count8 + (count8 === 0 ? 1 : 2) + i);
        let sp = this.getChunkPoint(startPoint, endPoint, count,  2 * count8 + 1 + i);
        let lp = this.getPointByDistance(startPoint, sp, r * 2);
        ctx.moveTo(sp.x, sp.y);
        ctx.lineTo(lp.x, lp.y);
      }
      // 1级
      for (let i = 0; i < count1; i++){
        // let sp = this.getChunkPoint(startPoint, endPoint, count, count8 + count2 + (count8 === 0 ? 1 : 2) + i);
        let sp = this.getChunkPoint(startPoint, endPoint, count, 2 * count8 + 1 + count2 + i);
        let lp = this.getPointByDistance(startPoint, sp, r);
        ctx.moveTo(sp.x, sp.y);
        ctx.lineTo(lp.x, lp.y);
      }
    }
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
  },

  //取一条线的 count 等分点的第number(1,2,3...)个点，从endPoint开始计数。
  getChunkPoint: function (startPoint, endPoint, count, number){
     var points = [];
     var xn, yn;
     points.push(startPoint);
     for (let i = 1; i < count; i++) {
       xn = startPoint.x + i * (endPoint.x - startPoint.x) / count;
       yn = startPoint.y + i * (endPoint.y - startPoint.y) / count;
       points.push(L.point(xn, yn));
     }
     points.push(endPoint);
     points = points.reverse();
     return points[number-1];
  },

  getPointByDistance: function (sp, ep, r) {
    var x, y;
    var k = (ep.y - sp.y) / (ep.x - sp.x);
    var r2 = Math.pow(r, 2);
    var k2 = Math.pow(k, 2);
    //不同坐标系符号问题
    if(ep.x > sp.x) {
      if(ep.y < sp.y) {
         x = ep.x + Math.sqrt((r2 * k2) / (1 + k2));
         y = ep.y + Math.sqrt(r2 / (1 + k2));
      } else {
         x = ep.x - Math.sqrt((r2 * k2) / (1 + k2));
         y = ep.y + Math.sqrt(r2 / (1 + k2));
      }

    } else if(ep.x < sp.x) {
      if(ep.y > sp.y) {
         x = ep.x - Math.sqrt((r2 * k2) / (1 + k2));
         y = ep.y - Math.sqrt(r2 / (1 + k2));
      } else {
         x = ep.x + Math.sqrt((r2 * k2) / (1 + k2));
         y = ep.y - Math.sqrt(r2 / (1 + k2));
      }
    } else {
      if(ep.y > sp.y) {
         x = ep.x - r;
         y = ep.y;
      } else {
         x = ep.x + r;
         y = ep.y;
      }
    }
    return L.point(x, y);
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
