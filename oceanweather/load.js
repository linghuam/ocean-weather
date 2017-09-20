var map = L.map('map', {
    center: [30, 116],
    zoom: 4,
    zoomControl: false
});
map.on("mousemove", function(e) {
    var latlng = e.latlng;
    $('#msg').text(JSON.stringify(latlng));
}, this);
L.tileLayer.GoogleLayer().addTo(map);

//test
// var latlngs = [
//     [45.51, -122.68],
//     [37.77, -122.43],
//     [34.04, -118.2]
// ];
// var renderer = L.canvas();
// var ply = L.polyline(latlngs, { renderer: renderer });
// map.addLayer(ply); //map.removeLayer(ply);


//test
// var data = [{ lat: 45.51, lng: -122.68, value: 1, dir: 90 },
//     { lat: 37.77, lng: -122.43, value: 2, dir: 120 },
//     { lat: 34.04, lng: -118.2, value: 3, dir: 200 },
//     { lat: 39.04, lng: 116.2, value: 3, dir: 180 },
//     { lat: 36.04, lng: 116.2, value: 3, dir: 270 },
//     { lat: 34.04, lng: 116.2, value: 3, dir: 360 },
//     { lat: 30.04, lng: 116.2, value: 3, dir: 0 }
// ];
// new L.CustomLayer(null, data).addTo(map);

var OceanWeather = {};
OceanWeather.pressure = function() {
    PapaParseLine('data/pressure.csv');
    // PapaParsePressureBand('data/pressurehl.csv');
}
OceanWeather.mb500 = function() {
    PapaParseLine('data/500mb.csv');
}
OceanWeather.wind = function() {
    PapaParseWind2('data/wind.csv');
}
OceanWeather.waveheight = function() {
    PapaParseLine('data/waveheight.csv');
}
OceanWeather.surge = function() {
    PapaParseArea('data/surge.csv');
}
OceanWeather.flow = function() {
    PapaParseFlow('data/flow.csv');
}
OceanWeather.temperature = function() {
    PapaParseLine('data/temperature.csv');
}
OceanWeather.visibility = function() {
    PapaParseArea('data/visibility.csv');
}
OceanWeather.heatmap = function() {
    PapaParseHeatmap('data/heatmap.csv');
}


var featueGroup = L.featureGroup([]).addTo(map);
// var renderer = new L.TextLineSvg();
var renderer = new L.TextCanvas();

function PapaParseArea(url) {
    if (map.hasLayer(featueGroup)) map.removeLayer(featueGroup);
    featueGroup = L.featureGroup([]).addTo(map);
    var options = {
        renderer: renderer,
        color: '#000',
        weight: 1,
        fill: true,
        fillColor: '#f00'
    };
    var arr = [];
    Papa.parse(url, {
        download: true,
        complete: function(results) {
            // console.log("Finished:", results.data);
        },
        step: function(results, parser) {
            if (results.data[0][0] === '' && arr.length) {
                // console.log(JSON.stringify(arr));

                // handler data -------------start------------------------
                var latlngs = [];
                for (var i = 0, len = arr.length; i < len; i++) {
                    var row = arr[i];
                    var lat = +row[0];
                    var lng = +row[1];
                    var value = options.text = +row[2];
                    var latlng = L.latLng(lat, lng);

                    if (i === 0) {
                        latlngs.push(latlng);
                    } else {
                        var lastlng = (latlngs[latlngs.length - 1]).lng;
                        var extend = Math.abs(lng - lastlng);
                        if (extend >= 180) { //解决经度范围超过180连线异常
                            featueGroup.addLayer(L.polygon(latlngs, options));
                            latlngs = [];
                            latlngs.push(latlng);
                        } else {
                            latlngs.push(latlng);
                            if (i === len - 1) {
                                featueGroup.addLayer(L.polygon(latlngs, options));
                                latlngs = [];
                            }
                        }
                    }
                }
                // handler datq ----------------end-----------------------------

                arr = [];
            } else {
                if (arr) {
                    arr.push(results.data[0]);
                } else {
                    arr = [];
                }
            }
        }
    });
}

function PapaParseLine(url) {
    if (map.hasLayer(featueGroup)) map.removeLayer(featueGroup);
    featueGroup = L.featureGroup([]).addTo(map);
    var options = {
        renderer: renderer,
        color: '#000',
        weight: 1,
        fill: false
    };
    var arr = [];
    Papa.parse(url, {
        download: true,
        complete: function(results) {
            // console.log("Finished:", results.data);
        },
        step: function(results, parser) {
            if (results.data[0][0] === '' && arr.length) {
                // console.log(JSON.stringify(arr));

                // handler data -------------start------------------------
                var latlngs = [];
                for (var i = 0, len = arr.length; i < len; i++) {
                    var row = arr[i];
                    var lat = +row[0];
                    var lng = +row[1];
                    var value = options.text = +row[2];
                    var latlng = L.latLng(lat, lng);

                    if (i === 0) {
                        latlngs.push(latlng);
                    } else {
                        var lastlng = (latlngs[latlngs.length - 1]).lng;
                        var extend = Math.abs(lng - lastlng);
                        if (extend >= 180) { //解决经度范围超过180连线异常
                            featueGroup.addLayer(L.polyline(latlngs, options));
                            latlngs = [];
                            latlngs.push(latlng);
                        } else {
                            latlngs.push(latlng);
                            if (i === len - 1) {
                                featueGroup.addLayer(L.polyline(latlngs, options));
                                latlngs = [];
                            }
                        }
                    }
                }
                // handler datq ----------------end-----------------------------

                arr = [];
            } else {
                if (arr) {
                    arr.push(results.data[0]);
                } else {
                    arr = [];
                }
            }
        }
    });
}

function PapaParsePressureBand(url) {
    var options = {
        renderer: renderer,
        color: '#000',
        weight: 6,
        fill: true
    };
    var arr = [];
    Papa.parse(url, {
        download: true,
        complete: function(results) {
                var datas = results.data;
                var res = datas.groupBy(o => o[3]);
                for (var i = 0, len = res.length; i < len; i++) {
                    var objitem = res[i];
                    options.text = objitem.key;
                    if (objitem.value.length < 2) {
                        continue;
                    }
                    var latlngs = [];
                    for (var j = 0, lenj = objitem.value.length; j < lenj; j++) {
                        var row = objitem.value[j];
                        var lat = +row[0];
                        var lng = +row[1];
                        var v = +row[2];
                        v === 0 ? options.fillColor = '#f00' : options.fillColor = '#00f';
                        var latlng = L.latLng(lat, lng);
                        latlngs.push(latlng);
                    }
                    featueGroup.addLayer(L.polyline(latlngs, options));
                }
            }
            // step: function(results, parser) {
            // if (results.data[0][0] === '' && this.arr.length) {
            //     // console.log(JSON.stringify(this.arr));

        //     // handler data -------------start------------------------
        //     var latlngs = [];
        //     for (var i = 0, len = this.arr.length; i < len; i++) {
        //         var row = this.arr[i];
        //         var lat = +row[0];
        //         var lng = +row[1];
        //         var value = options.text = +row[2];
        //         var latlng = L.latLng(lat, lng);

        //         if (i === 0) {
        //             latlngs.push(latlng);
        //         } else {
        //             var lastlng = (latlngs[latlngs.length - 1]).lng;
        //             var extend = Math.abs(lng - lastlng);
        //             if (extend >= 180) { //解决经度范围超过180连线异常
        //                 featueGroup.addLayer(L.polyline(latlngs, this.options));
        //                 latlngs = [];
        //                 latlngs.push(latlng);
        //             } else {
        //                 latlngs.push(latlng);
        //                 if (i === len - 1) {
        //                     featueGroup.addLayer(L.polyline(latlngs, this.options));
        //                     latlngs = [];
        //                 }
        //             }
        //         }
        //     }
        //     // handler datq ----------------end-----------------------------

        //     this.arr = [];
        // } else {
        //     if (this.arr) {
        //         this.arr.push(results.data[0]);
        //     } else {
        //         this.arr = [];
        //     }
        // }
        // }
    });
}

function PapaParseWind(url) {
    var options = {
        pointRadius: 5,
        strokeLength: 20
    };
    Papa.parse(url, {
        download: true,
        complete: function(results) {
            var datas = results.data;
            for (var i = 0, len = datas.length; i < len; i++) {
                var row = datas[i];
                var lat = +row[0];
                var lng = +row[1];
                var sp = options.speed = +row[2];
                var dir = options.deg = +row[3];
                var icon = L.WindBarb.icon(options);
                var latlng = L.latLng(lat, lng);
                var marker = L.marker(latlng, { icon: icon });
                featueGroup.addLayer(marker);
            }
        }
    });
}

function PapaParseWind2(url) {
    if (map.hasLayer(featueGroup)) map.removeLayer(featueGroup);
    featueGroup = L.featureGroup([]).addTo(map);
    Papa.parse(url, {
        download: true,
        complete: function(results) {
            var datas = results.data;
            var config = {
                lat: '0',
                lng: '1',
                dir: '3',
                value: '2',
                data: datas
            };
            var windlayer = new L.WindLayer(null, config);
            featueGroup.addLayer(windlayer);
        }
    });
}

function PapaParseFlow(url) {
    if (map.hasLayer(featueGroup)) map.removeLayer(featueGroup);
    featueGroup = L.featureGroup([]).addTo(map);
    Papa.parse(url, {
        download: true,
        complete: function(results) {
            var datas = results.data;
            var config = {
                lat: '0',
                lng: '1',
                dir: '3',
                value: '2',
                data: datas
            };
            var flowlayer = new L.CustomLayer(null, config);
            featueGroup.addLayer(flowlayer);
        }
    });
}

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function PapaParseHeatmap(url) {
    var url = 'http://localhost:8080/rest/realtime/areaships.do';
    var data = {
        limit: 1000,
        timeout: 1000000,
        mode: 1,
        ldlon: -180,
        ldlat: -90,
        rulon: 180,
        rulat:90
    };
    $.post(url, data, function(res) {
        var d = res.msg.shipList;
        var test = [];
        for (var i = 0, len = d.length; i < len; i++) {
            d[i].la = d[i].la / 600000;
            d[i].lo = d[i].lo / 600000;
            d[i].v = 1;
            test.push({
                lat:d[i].la,
                lng:d[i].lo,
                value:getRandomArbitrary(1,1000)
            });
        }
        console.log(JSON.stringify(test));
        var testData = {
            max: 99999,
            data: d
        };
        var cfg = {
            // radius should be small ONLY if scaleRadius is true (or small radius is intended)
            // if scaleRadius is false it will be the constant radius used in pixels
            "radius": 2,
            "maxOpacity": .8,
            // scales the radius based on map zoom
            "scaleRadius": true,
            // if set to false the heatmap uses the global maximum for colorization
            // if activated: uses the data maximum within the current map boundaries 
            //   (there will always be a red spot with useLocalExtremas true)
            "useLocalExtrema": true,
            // which field name in your data represents the latitude - default "lat"
            latField: 'la',
            // which field name in your data represents the longitude - default "lng"
            lngField: 'lo',
            // which field name in your data represents the data value - default "value"
            valueField: 'v'
        };


        var heatmapLayer = new HeatmapOverlay(cfg);

        map.addLayer(heatmapLayer);

        heatmapLayer.setData(testData);
    },'json');
    
    

    // if (map.hasLayer(featueGroup)) map.removeLayer(featueGroup);
    // featueGroup = L.featureGroup([]).addTo(map);
    // Papa.parse(url, {
    //     download: true,
    //     complete: function(results) {
    //         var datas = results.data;
    //         var testData = {
    //             max: 18,
    //             data: datas
    //         };
    //         var cfg = {
    //             // radius should be small ONLY if scaleRadius is true (or small radius is intended)
    //             // if scaleRadius is false it will be the constant radius used in pixels
    //             "radius": 2,
    //             "maxOpacity": .8,
    //             // scales the radius based on map zoom
    //             "scaleRadius": true,
    //             // if set to false the heatmap uses the global maximum for colorization
    //             // if activated: uses the data maximum within the current map boundaries 
    //             //   (there will always be a red spot with useLocalExtremas true)
    //             "useLocalExtrema": true,
    //             // which field name in your data represents the latitude - default "lat"
    //             latField: '0',
    //             // which field name in your data represents the longitude - default "lng"
    //             lngField: '1',
    //             // which field name in your data represents the data value - default "value"
    //             valueField: '2'
    //         };


    //         var heatmapLayer = new HeatmapOverlay(cfg);

    //         featueGroup.addLayer(heatmapLayer);

    //         heatmapLayer.setData(testData);
    //     }
    // });
}
