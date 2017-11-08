L.LatLng.prototype.getSubtract360LatLng = function () {
  return new L.LatLng(this.lat, this.lng - 360, this.alt);
};

L.LatLng.prototype.getAdd360LatLng = function () {
  return new L.LatLng(this.lat, this.lng + 360, this.alt);
};
