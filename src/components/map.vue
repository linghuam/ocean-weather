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
      zoom: 4,
      center: [24, 106]
    });
    new GoogleLayer('http://mt2.google.cn/vt/lyrs=m&hl=zh-CN&gl=cn&s=Gal&z={z}&x={x}&y={y}').addTo(map);
  }
};

</script>

<style scoped>
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
