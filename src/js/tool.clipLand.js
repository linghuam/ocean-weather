import geoJson from '../assets/outline.json'

export default class {

  constructor (canvas , map, options) {
    this._canvas = canvas;
    this._ctx = canvas.getContext('2d');
    this._map = map;
    this.options = Object.assign({
      isClipLeftRight: true
    }, options);
  }

  clip () {
    console.time('clip');
    var features = geoJson.features;
    var feature;
    for (let i = 0, len = features.length; i < len; i++){
      feature =  features[i];
      this._clipFeature(feature);
    }
    console.timeEnd('clip');
    return this;
  }

  _clipFeature (feature){
    var coords = [];
    if (feature.geometry.type === 'Polygon'){
      coords = feature.geometry.coordinates[0];
      this._excuteClip(coords);
    } else if (feature.geometry.type === 'MultiPolygon'){
      let lines = feature.geometry.coordinates;
      for (let i = 0, len = lines.length; i < len; i++){
        coords = lines[i][0];
        this._excuteClip(coords);
      }
    }
  }

  _excuteClip (coords) {
    var ctx = this._ctx;
    var map = this._map;
    var canvas = this._canvas;
    var pt , lpt, rpt;
    ctx.save();
    ctx.beginPath();
    for (let i = 0 , len = coords.length; i < len; i++) {
      pt = map.latLngToContainerPoint(L.latLng(coords[i][1], coords[i][0]));
      i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
    }
    ctx.closePath();
    if (this.options.isClipLeftRight){
      for (let i = 0 , len = coords.length; i < len; i++) {
        lpt = map.latLngToContainerPoint(L.latLng(coords[i][1], Number(coords[i][0]) - 360));
        i === 0 ? ctx.moveTo(lpt.x, lpt.y) : ctx.lineTo(lpt.x, lpt.y);
      }
      ctx.closePath();
      for (let i = 0 , len = coords.length; i < len; i++) {
        rpt = map.latLngToContainerPoint(L.latLng(coords[i][1], Number(coords[i][0]) + 360));
        i === 0 ? ctx.moveTo(rpt.x, rpt.y) : ctx.lineTo(rpt.x, rpt.y);
      }
      ctx.closePath();
    }
    ctx.clip();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
}
