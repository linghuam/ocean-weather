<template>
  <div id="menu">
    <el-button-group>
      <el-button type="primary" v-for="item in items" @click="btnClickEvt(item)">{{item}}</el-button>
    </el-button-group>
  </div>
</template>

<script>
import { FuncWind } from '../js/func.wind'
import { FuncWind2 } from '../js/func.wind2'
import { FuncFlow } from '../js/func.flow'
import { FuncFlow2 } from '../js/func.flow2'
import { FuncPressure } from '../js/func.pressure'
import { FuncVisibility } from '../js/func.visibility'

export default {
  data() {
    return {
      items: ['风', '风2', '洋流', '洋流2', '涌', '涌2', '气压', '500mb', '海温', '能见度', '浪高']
    };
  },

  methods: {
    btnClickEvt(type) {

      this._funcWind && this._funcWind.stop();
      this._funcWind2 && this._funcWind2.stop();
      this._funcFlow && this._funcFlow.stop();
      this._funcFlow2 && this._funcFlow2.stop();
      this._funcPressure && this._funcPressure.stop();
      this._funcVisibility && this._funcVisibility.stop();

      if(type === '风') {
        if(!this._funcWind) {
          this._funcWind = new FuncWind(this.$parent.$data.map);
        }
        this._funcWind.start();
      } else if(type === '风2') {
        if(!this._funcWind2) {
          this._funcWind2 = new FuncWind2(this.$parent.$data.map);
        }
        this._funcWind2.start();
      } else if(type === '洋流') {
        if(!this._funcFlow) {
          this._funcFlow = new FuncFlow(this.$parent.$data.map);
        }
        this._funcFlow.start();
      } else if(type === '洋流2') {
        if(!this._funcFlow2) {
          this._funcFlow2 = new FuncFlow2(this.$parent.$data.map);
        }
        this._funcFlow2.start();
      } else if(type === '气压') {
        if(!this._funcPressure) {
          this._funcPressure = new FuncPressure(this.$parent.$data.map);
        }
        this._funcPressure.start();
      } else if(type === '能见度') {
        if(!this._funcVisibility) {
          this._funcVisibility = new FuncVisibility(this.$parent.$data.map);
        }
        this._funcVisibility.start();
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
