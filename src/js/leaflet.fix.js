L.LatLng.prototype.getSubtract360LatLng = function () {
  return new L.LatLng(this.lat, this.lng - 360, this.alt);
};

L.LatLng.prototype.getAdd360LatLng = function () {
  return new L.LatLng(this.lat, this.lng + 360, this.alt);
};

L.Polyline.addInitHook(function () {

  this._caculateMeridian = function (latLngA, latLngB) {
    //  var is = this.isCrossMeridian(latLngA, latLngB);
    var is = true;
    if(is) {
      var p = this._map.project(latLngA),
        pb = latLngB,
        pb1 = latLngB.getAdd360LatLng(),
        pb2 = latLngB.getSubtract360LatLng(),
        disb = p.distanceTo(this._map.project(pb)),
        disb1 = p.distanceTo(this._map.project(pb1)),
        disb2 = p.distanceTo(this._map.project(pb2)),
        min = Math.min(disb, disb1, disb2);
      if(min === disb) {
        return pb;
      } else if(min === disb1) {
        return pb1;
      } else {
        return pb2;
      }
    } else {
      return latLngB;
    }
  };

  this._legelLatLngs = function (latlngs) {
    var result = [],
      flat = latlngs[0] instanceof L.LatLng,
      len = latlngs.length,
      i;
    for(i = 0; i < len; i++) {
      if(flat) {
        var tempi = latlngs[i];
        if(i >= 1) {
          var tempibefore = result[i - 1];
          result[i] = this._caculateMeridian(tempibefore, tempi);
        } else {
          result[i] = tempi;
        }
        this._bounds.extend(result[i]);
      } else {
        result[i] = this._legelLatLngs(latlngs[i]);
      }
    }
    return result;
  };

  this._project = function () {
    var pxBounds = new L.Bounds();
    this._rings = [];
    this._bounds = new L.LatLngBounds();
    this._latlngs = this._legelLatLngs(this._latlngs);
    this._projectLatlngs(this._latlngs, this._rings, pxBounds);

    var w = this._clickTolerance(),
      p = new L.Point(w, w);

    if(this._bounds.isValid() && pxBounds.isValid()) {
      pxBounds.min._subtract(p);
      pxBounds.max._add(p);
      this._pxBounds = pxBounds;
    }
  };

  this.getChunkLatlngs = function () {
      var results = [];
      var geojson = this.toGeoJSON();
      var length = turf.lineDistance(geojson, 'kilometers');
      var center = this.getCenter();
      var points = this._rings[0];
      var stlatlng = this._map.layerPointToLatLng(points[0]);
      var edlatlng = this._map.layerPointToLatLng(points[points.length - 1]);
      if (length > 50000) {
          var start1 = turf.point([stlatlng.lng, stlatlng.lat]);
          var start2 = turf.point([center.lng, center.lat]);
          var stop  = turf.point([edlatlng.lng, edlatlng.lat]);
          var slice1 = turf.lineSlice(start1, start2, geojson);
          var slice2 = turf.lineSlice(start2, stop, geojson);
          var c1 =  turf.getCoord( turf.centroid(slice1) );
          var c2 = turf.getCoord( turf.centroid(slice2) );
          results.push( L.latLng(c1[1], c1[0]) );
          results.push( center );
          results.push( L.latLng(c2[1], c2[0]) );
      } else {
        results.push(center);
      }
      return results;
  };
});
