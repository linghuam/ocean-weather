<template>
  <div id="map"></div>
</template>

<script>
import 'leaflet/dist/leaflet.css'
import { GoogleLayer } from '../js/leaflet.googlelayer'

export default {
  data() {
    return {
    };
  },
  mounted() {
    var map = L.map('map', {
      minZoom: 1,
      maxZoom: 18,
      zoom: 2,
      center: [0, 0],
      worldCopyJump:true,
      // maxBounds:L.latLngBounds(L.latLng(-90,-540),L.latLng(90,540))
    });
    new GoogleLayer('http://mt2.google.cn/vt/lyrs=m&hl=zh-CN&gl=cn&s=Gal&z={z}&x={x}&y={y}').addTo(map);
    this.$parent.$data.map = map;

    // add control
    // var attrcontrol = L.control.attribution({ position: 'topright', prefix: false }).addTo(map);
    // map events
    // map.on("mousemove", function (e) {
    //     var latlng = e.latlng;
    //     var layerpoint = e.layerPoint;
    //     var containerpoint = e.containerPoint;
    //     var html = [];
    //     html.push('<span>lng：' + latlng.lng + '&nbsp&nbsplat：' + latlng.lat + '</span><br>');
    //     html.push('<span>layerPoint:[' + layerpoint.x + ',' + layerpoint.y + ']</span><br>');
    //     html.push('<span>containerPoint:[' + containerpoint.x + ',' + containerpoint.y + ']</span><br>');
    //     html.push('<span>zoomLevel:' + map.getZoom() +'</span><br>');
    //     html = html.join('');
    //     if(attrcontrol) {
    //         var container = attrcontrol.getContainer();
    //         $(container).html(html);
    //     }
    // }, this);
    // test -start
    // var area = [[28, 116],[28, -116],[20, -116],[20, 116]];
    // var area1 = [[28, 116+360],[28, -116+360],[20, -116+360],[20, 116+360]];
    // var area2 = [[28, 116-360],[28, -116-360],[20, -116-360],[20, 116-360]];
    // L.polygon(area, {fillColor:'#f00'}).addTo(map);
    // L.polygon(area1, {fillColor:'#0f0'}).addTo(map);
    // L.polygon(area2, {fillColor:'#00f'}).addTo(map);
    // test -end
  }
};

</script>

<style>
#map {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

</style>
