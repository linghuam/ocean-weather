import Papa from 'papaparse'
import { LineTextCanvas } from './leaflet.textCanvas'

export class FuncVisibility {

  constructor(map) {
    this._map = map;
  }

  start() {
    var renderer = new LineTextCanvas();
    var optionsArea = {
      renderer: renderer,
      stroke:false,
      fill: true,
      fillColor: '#f00'
    };
    var optionsLine = {
      renderer: renderer,
      color: '#000',
      weight: 1,
      fill: false,
      opacity:0.6
    };
    var arr = [];

    if(this._visibilityFeatureGroup && this._map.hasLayer(this._visibilityFeatureGroup)) {
      this._map.removeLayer(this._visibilityFeatureGroup);
    }
    this._visibilityFeatureGroup = L.featureGroup([]).addTo(this._map);

    var allSplitLatLngs = [];
    var allSplitTxt = [];

    Papa.parse('./static/data/visibility.csv', {
      download: true,
      complete: function (results) {
        // console.log(allSplitLatLngs.length);
        for (let i =0 , len = allSplitLatLngs.length; i < len; i++){
                if(this._map.hasLayer(this._visibilityFeatureGroup)) {
                  this._visibilityFeatureGroup.addLayer(L.polygon(allSplitLatLngs[i], optionsArea));
                }          
        }
        for (let i =0 , len = allSplitLatLngs.length; i < len; i++){
                if(this._map.hasLayer(this._visibilityFeatureGroup)) {
                  optionsLine.text = allSplitTxt[i];
                  this._visibilityFeatureGroup.addLayer(L.polyline(allSplitLatLngs[i], optionsLine));
                }          
        }        
      }.bind(this),
      step: function (results, parser) {
        if(results.data[0][0] === '' && arr.length) {

          // handler data -------------start------------------------
          var latlngs = [];
          for(var i = 0, len = arr.length; i < len; i++) {
            var row = arr[i];
            var lat = +row[0];
            var lng = +row[1];
            var value = +row[2];
            var latlng = L.latLng(lat, lng);

            if(i === 0) {
              latlngs.push(latlng);
            } else {
              var lastlng = (latlngs[latlngs.length - 1]).lng;
              var extend = Math.abs(lng - lastlng);
              if(extend >= 180) { //解决经度范围超过180连线异常
                // if(this._map.hasLayer(this._visibilityFeatureGroup)) {
                //   this._visibilityFeatureGroup.addLayer(L.polygon(latlngs, optionsArea));
                //   this._visibilityFeatureGroup.addLayer(L.polyline(latlngs, optionsLine));
                // }
                if (latlngs.length > 2) {
                  allSplitLatLngs.push(latlngs);
                  allSplitTxt.push(value);
                }
                latlngs = [];
                latlngs.push(latlng);
              } else {
                latlngs.push(latlng);
                if(i === len - 1) {
                  // if(this._map.hasLayer(this._visibilityFeatureGroup)) {
                  //   this._visibilityFeatureGroup.addLayer(L.polygon(latlngs, optionsArea));
                  //   this._visibilityFeatureGroup.addLayer(L.polyline(latlngs, optionsLine));
                  // }
                if (latlngs.length > 2) {
                  allSplitLatLngs.push(latlngs);
                  allSplitTxt.push(value);                  
                }                  
                  latlngs = [];
                }
              }
            }
          }
          // handler datq ----------------end-----------------------------

          arr = [];
        } else {
          if(arr) {
            arr.push(results.data[0]);
          } else {
            arr = [];
          }
        }
      }.bind(this)
    });
  }

  stop　() {
    if(this._map.hasLayer(this._visibilityFeatureGroup)) {
      this._map.removeLayer(this._visibilityFeatureGroup);
    }
  }
}
