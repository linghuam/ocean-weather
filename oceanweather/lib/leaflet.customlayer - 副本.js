L.CustomLayer = L.Layer.extend({

    options: {
        pane: 'overlayPane'
    },

    initialize: function(options, data) {
        L.setOptions(this, options);
        this._data = data || []; //{lat:...,lon:....,dir:...,value:...}
    },

    onAdd: function(map) {
        this._map = map;
        var pane = map.getPane(this.options.pane);
        var container = this._container = L.DomUtil.create('canvas');
        this._ctx = container.getContext('2d');
        pane.appendChild(this._container);

        // Calculate initial position of container with `L.Map.latLngToLayerPoint()`, `getPixelOrigin()` and/or `getPixelBounds()`
        var size = map.getSize();
        this._container.style.width = size.x + 'px';
        this._container.style.height = size.y + 'px';
        this._container.style.position = 'absolute';
        // L.DomUtil.setPosition(this._container, point);

        // Add and position children elements if needed

        map.on('zoomend viewreset', this._update, this);
    },

    onRemove: function(map) {
        L.DomUtil.remove(this._container);
        map.off('zoomend viewreset', this._update, this);
    },

    _draw: function() {
        if (!this._map) {
            return; }

        var mapPane = this._map.getPanes().mapPane;
        var point = mapPane._leaflet_pos;

        // reposition the layer
        this._container.style[L.CustomLayer.CSS_TRANSFORM] = 'translate(' +
            -Math.round(point.x) + 'px,' +
            -Math.round(point.y) + 'px)';

        this._update();
    },

    _update: function() {
        var ctx = this._ctx;
        var latlng = L.latLng(30, 116);
        var pt = this._map.latLngToLayerPoint(latlng);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'middle';
        ctx.font = 'Microsoft YaHei';
        ctx.fillStyle = "#f00";
        ctx.fillText('texfafaft', pt.x, pt.y);
    }
});

L.CustomLayer.CSS_TRANSFORM = (function() {
    var div = document.createElement('div');
    var props = [
        'transform',
        'WebkitTransform',
        'MozTransform',
        'OTransform',
        'msTransform'
    ];

    for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        if (div.style[prop] !== undefined) {
            return prop;
        }
    }
    return props[0];
})();
