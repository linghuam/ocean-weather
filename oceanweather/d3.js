/*
 * https://github.com/d3/d3-contour
 * https://en.wikipedia.org/wiki/Marching_squares
 * http://blog.csdn.net/silangquan/article/details/47054309
 * https://bost.ocks.org/mike/leaflet/
 */
OceanWeather.d3 = function() {
    if (map.hasLayer(this.d3Overlay)) { map.removeLayer(this.d3Overlay); }
    this.d3Overlay = L.d3SvgOverlay(function(selection, projection) {
        d3DrawChina(selection, projection);
        // d3DrawContour(selection, projection);
        // d3Test(selection, projection)
    });
    map.addLayer(this.d3Overlay);
};

function d3DrawChina(selection, projection) {

    d3.json('data/geojson.json', function(data) {

        var transform = d3.geoTransform({
            point: function(x, y) {
                var pt = projection.latLngToLayerPoint(L.latLng(y, x));
                this.stream.point(pt.x, pt.y);
            }
        });
        selection.append("path")
            .datum(data)
            .attr("d", d3.geoPath().projection(transform));
    });
}

function d3DrawContour(selection, projection) {
    d3.json('data/d3.json', function(data) {
        var transform = d3.geoTransform({
            point: function(x, y) {
                var pt = projection.latLngToLayerPoint(L.latLng(y, x));
                this.stream.point(pt.x, pt.y);
            }
        });

        var values = [];
        for (var i = 0, len = data.length; i < len; i++) {
            values.push(data[i].value);
        }
        var contours = d3.contours()
            .size([-180, 180])
            .thresholds(d3.range(2, 800, 10))
            (values);

        selection.selectAll('path')
            .data(contours)
            .enter()
            .append('path')
            .attr('d', d3.geoPath().projection(transform))

    });
}

function d3Test(selection, projection) {
    // Populate a grid of n×m values where -2 ≤ x ≤ 2 and -2 ≤ y ≤ 1.
    var n = 360,
        m = 180,
        values = new Array(n * m);
    for (var j = 0.5, k = 0; j < m; ++j) {
        for (var i = 0.5; i < n; ++i, ++k) {
            values[k] = goldsteinPrice(i / n * 4 - 2, 1 - j / m * 3);
        }
    }


    var svg = selection,
        width = +2304,
        height = +1140;

    var thresholds = d3.range(1, 21)
        .map(function(p) {
            return Math.pow(2, p); });

    var contours = d3.contours()
        .size([n, m])
        .thresholds(thresholds);

    var color = d3.scaleLog()
        .domain(d3.extent(thresholds))
        .interpolate(function() {
            return d3.interpolateYlGnBu; });

    svg.selectAll("path")
        .data(contours(values))
        .enter().append("path")
        .attr("d", d3.geoPath())
        .attr("fill", function(d) {
            return color(d.value); });

    // See https://en.wikipedia.org/wiki/Test_functions_for_optimization
    function goldsteinPrice(x, y) {
        return (1 + Math.pow(x + y + 1, 2) * (19 - 14 * x + 3 * x * x - 14 * y + 6 * x * x + 3 * y * y)) * (30 + Math.pow(2 * x - 3 * y, 2) * (18 - 32 * x + 12 * x * x + 48 * y - 36 * x * y + 27 * y * y));
    }
}
