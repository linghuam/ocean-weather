import 'leaflet-velocity/dist/leaflet-velocity.min.css'
import 'leaflet-velocity'

export class FuncWind {

  constructor(map) {
    this._map = map;
  }

  start() {
    $.getJSON('./static/data/wind-global.json', function (data) {

      var velocityLayer = L.velocityLayer({
        displayValues: true,
        displayOptions: {
          velocityType: 'Global Wind',
          displayPosition: 'bottomleft',
          displayEmptyString: 'No wind data'
        },
        data: data,
        maxVelocity: 15
      });
      this._velocityLayer = velocityLayer;
      if(this._map.hasLayer(this._velocityLayer)) {
        this._map.removeLayer(this._velocityLayer);
      }
      this._map.addLayer(velocityLayer);
    }.bind(this));
  }

  stop　() {
    if(this._map.hasLayer(this._velocityLayer)) {
      this._map.removeLayer(this._velocityLayer);
    }
  }
}
