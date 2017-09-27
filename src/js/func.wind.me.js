import Papa from 'papaparse'
import { WindLayer } from './leaflet.windLayer'
import { CanvasLayer } from './leaflet.canvasLayer'

export class FuncWindMe {

  constructor(map) {
    this._map = map;
  }

  start() {

    var myCustomCanvasDraw = function () {
      CanvasLayer.call(this);

      this.onLayerDidMount = function () {
        // -- prepare custom drawing
      };

      this.onLayerWillUnmount = function () {
        // -- custom cleanup
      };

      this.setData = function (data) {
        // -- custom data set
        this.needRedraw(); // -- call to drawLayer
      };

      this.onDrawLayer = function (info) {
        // -- custom  draw
        var ctx = info.canvas.getContext('2d');
        ctx.clearRect(0, 0, info.canvas.width, info.canvas.height);
        ctx.fillStyle = "rgba(255,116,0, 0.2)";
         var pt = info.layer._map.latLngToContainerPoint([39, 116]);
         ctx.fillRect(pt.x, pt.y, 100, 100);
      }

    }

    myCustomCanvasDraw.prototype = Object.create(CanvasLayer.prototype); //new CanvasLayer(); // -- setup prototype
    myCustomCanvasDraw.prototype.constructor = myCustomCanvasDraw;

    if(this._map.hasLayer(this._windLayer)) {
      this._map.removeLayer(this._windLayer);
    }
    this._windLayer = new myCustomCanvasDraw();
    this._windLayer.addTo(this._map);

    // Papa.parse('./static/data/wind.csv', {
    //   download: true,
    //   complete: function (results) {
    //     var datas = results.data;
    //     var config = {
    //       lat: '0',
    //       lng: '1',
    //       dir: '3',
    //       value: '2',
    //       data: datas
    //     };
    //     if(this._map.hasLayer(this._windLayer)) {
    //       this._map.removeLayer(this._windLayer);
    //     }
    //     this._windLayer = new WindLayer(null, config);
    //     this._map.addLayer(this._windLayer);
    //   }.bind(this)
    // });
  }

  stop　() {
    if(this._map.hasLayer(this._windLayer)) {
      this._map.removeLayer(this._windLayer);
    }
  }
}
