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
      minZoom: 2,
      maxZoom: 18,
      zoom: 6,
      center: [23.473323877771172, 134.42871093750003],
      worldCopyJump:true,
      // maxBounds:L.latLngBounds(L.latLng(-90,-540),L.latLng(90,540))
    });
    new GoogleLayer('http://mt2.google.cn/vt/lyrs=m&hl=zh-CN&gl=cn&s=Gal&z={z}&x={x}&y={y}').addTo(map);
    this.$parent.$data.map = map;
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
