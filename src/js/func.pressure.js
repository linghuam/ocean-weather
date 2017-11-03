import Papa from 'papaparse'
import { LineTextCanvas } from './leaflet.textCanvas'
// import turf from 'turf'

export class FuncPressure {

  constructor(map) {
    this._map = map;
  }

  start() {    
    this._renderer = new LineTextCanvas();
    this._lineOptions = {
      renderer: this._renderer,
      color: '#354656',
      weight: 0.8,
      opacity: 0.85,
      fill: false,
      text: '',
      // noClip:true,
      // smoothFactor:0.1
    };        
    Papa.parse('./static/data/pressure.csv', {
      download: true,
      header: false,
      complete: function (results) {
        if (results.errors.length || !results.data.length) return;
        this.getDataCallback(results.data);
      }.bind(this)
    });
  }

  stop　() {
    if (this._renderer) {
      this._renderer.remove();
    }
  }

  getDataCallback (data) {
    // split data by line
    var newData = [];
    var temp = [];    
    var i, len, latlngs, leftlatlngs, rightlatlngs;
    for (i = 0, len = data.length; i < len; i++){
        if (data[i].length === 1 || i === len-1) {
          if (temp.length >= 2) newData.push(temp);
          temp = [];
        } else {
          temp.push(data[i]);
        }
    }
    // draw line 
    for (i = 0, len = newData.length; i < len; i++ ) {
        latlngs = this.getLatLngs(newData[i]);
        leftlatlngs = this.getLeftLatLngs(newData[i]);
        rightlatlngs = this.getRightLatLngs(newData[i]);
        this._lineOptions.text = this.getValue(newData[i]);
        L.polyline(latlngs, this._lineOptions).addTo(this._map);
        L.polyline(leftlatlngs, this._lineOptions).addTo(this._map);
        L.polyline(rightlatlngs, this._lineOptions).addTo(this._map);
    }
  }

  getLatLngs (data) {
    var latlngs = [];
    var latlng;
    for (var i = 0, len = data.length; i < len; i++){
      latlng = L.latLng(data[i][0], data[i][1]);
      latlngs.push(latlng);
    }
    return latlngs;
  }

  getLeftLatLngs (data) {
    var latlngs = [];
    var latlng;
    for (var i = 0, len = data.length; i < len; i++){
      latlng = L.latLng(data[i][0], Number(data[i][1]) - 360);
      latlngs.push(latlng);
    }
    return latlngs;
  }

  getRightLatLngs (data) {
    var latlngs = [];
    var latlng;
    for (var i = 0, len = data.length; i < len; i++){
      latlng = L.latLng(data[i][0], Number(data[i][1]) + 360);
      latlngs.push(latlng);
    }
    return latlngs;
  }    

  getValue (data) {
    return data[0][2];
  }
}
