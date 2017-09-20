/*
 * 线写文字 canvas
 */
L.TextCanvas = L.Canvas.extend({

    _updatePoly: function(layer, closed) {
        L.Canvas.prototype._updatePoly.call(this, layer, closed);
        if (layer.options.text) {
            this._text(layer, closed);
        }
    },

    _text: function(layer, closed) {
        var ctx = this._ctx,
            text = layer.options.text,
            parts = layer._parts,
            map = this._map;
        if (!parts.length) {
            return;
        }
        try {
            var center = layer.getCenter();
            var pt = map.latLngToLayerPoint(center);
            ctx.textAlign = 'start';
            ctx.textBaseline = 'middle';
            ctx.font = 'Microsoft YaHei';
            ctx.fillStyle = "#000";
            ctx.fillText(text, pt.x, pt.y);
        } catch (ex) {
            var width = this._container.width;
            var height = this._container.height;
            ctx.clearRect(0, 0, width * 2, height * 2);
            // console.log(ex);
            // console.log(this._layers);
        }
    }
});

/*
 * 线写文字 svg
 */
L.TextLineSvg = L.SVG.extend({

    _updatePoly: function(layer, closed) {
        L.SVG.prototype._updatePoly.call(this, layer, closed);
        if (!layer.options.text) {
            return;
        } else {
            this._text(layer, closed);
        }
    },

    _initContainer: function() {
        L.SVG.prototype._initContainer.call(this);
        this._defs = L.SVG.create('defs');
        this._container.appendChild(this._defs);
    },

    _initPath: function(layer) {
        L.SVG.prototype._initPath.call(this, layer);
        if (layer.options.text) {
            layer._textele = L.SVG.create('text');
            layer._textpath = L.SVG.create('textPath');
            layer._textele.appendChild(layer._textpath);
            layer._textdefpath = L.SVG.create('path');
            layer._textdefpath.setAttribute('id', 'textpath' + L.stamp({}));
        }
    },

    _addPath: function(layer) {
        L.SVG.prototype._addPath.call(this, layer);
        if (layer._textele) {
            this._rootGroup.appendChild(layer._textele);
            this._defs.appendChild(layer._textdefpath);
        }
    },

    _removePath: function(layer) {
        L.SVG.prototype._removePath.call(this, layer);
        if (layer._textele) {
            L.DomUtil.remove(layer._textele);
            L.DomUtil.remove(layer._textdefpath);
        }
    },

    _text: function(layer, closed) {
        var container = this._container,
            text = layer.options.text,
            textele = layer._textele,
            pathd = layer._path.getAttribute('d'),
            hrefid = layer._textdefpath.getAttribute('id'),
            map = this._map;
        layer._textdefpath.setAttribute('d', pathd);
        var len = layer._textdefpath.getTotalLength();
        layer._textele.setAttribute('dx', len / 2);
        layer._textele.setAttribute('dy', '2');
        layer._textpath.setAttribute('href', '#' + hrefid);
        layer._textpath.setAttribute('style', 'font-size:12px;font-family:Microsoft YaiHei;stroke:#f00;');
        layer._textpath.innerHTML = text;
        // var center = layer.getBounds().getCenter();
        // var pt = map.latLngToLayerPoint(center);
        // textele.setAttribute('x', pt.x);
        // textele.setAttribute('y', pt.y + 7);
        // textele.setAttribute('text-anchor', 'middle');
        // textele.setAttribute('style', 'font-family:"Microsoft YaHei";font-size:14px;');
        // textele.innerHTML = text;
    }
});
