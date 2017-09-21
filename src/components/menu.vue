<template>
  <div id="menu">
    <el-button-group>
      <el-button type="primary" v-for="item in items" @click="btnClickEvt(item)">{{item}}</el-button>
    </el-button-group>
  </div>
</template>

<script>
import { FuncWind } from '../js/func.wind'
import { FuncWindMe } from '../js/func.wind.me'
import { FuncFlow } from '../js/func.flow'

export default {
  data() {
    return {
      items: ['风', '风2', '洋流', '气压', '能见度']
    };
  },

  methods: {
    btnClickEvt(type) {
      if(type === '风') {
        if(!this._funcWind) {
          this._funcWind = new FuncWind(this.$parent.$data.map);
        }
        this._funcWind.stop();
        this._funcWind.start();
      } else if(type === '风2') {
        if(!this._funcWind2) {
          this._funcWind2 = new FuncWindMe(this.$parent.$data.map);
        }
        this._funcWind2.stop();
        this._funcWind2.start();
      } else if(type === '洋流') {
        if(!this._funcFlow) {
          this._funcFlow = new FuncFlow(this.$parent.$data.map);
        }
        this._funcFlow.stop();
        this._funcFlow.start();
      } else if(type === '气压') {

      }else if(type === '能见度') {

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
