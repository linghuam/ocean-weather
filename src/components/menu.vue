<template>
  <div id="menu">
    <el-button-group>
      <el-button type="primary" v-for="item in items" @click="btnClickEvt(item)">{{item}}</el-button>
    </el-button-group>
  </div>
</template>

<script>
import { FuncWind } from '../js/func.wind'

export default {
  data() {
    return {
      items: ['风', '洋流', '海温']
    };
  },

  methods: {
    btnClickEvt(type) {
      if(type === '风') {
        if (!this._funcWind) {
          this._funcWind = new FuncWind(this.$parent.$data.map );
        }
        this._funcWind.stop();
        this._funcWind.start();
      } else if(type === '洋流') {

      } else if(type === '海温') {

      }
    }
  },

  mounted() {

  }
};

</script>

<style>
#menu {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  z-index: 999;
  text-align: center;
}

</style>
