<template>
<div id="menu">
<el-button-group>
  <el-button type="primary" v-for="item in items" @click="btnClickEvt(item)">{{item}}</el-button>
</el-button-group>
</div>
</template>

<script>
  export default {
    data () {
      return {
        items:['风','洋流','海温']
      };
    },

    methods:{
      btnClickEvt (type) {
          if (type === '风') {

          } else if (type === '洋流') {

          } else if (type === '海温') {

          }
      }
    }
  };
</script>

<style scoped>
#menu{
  position: absolute;
  top:10px;
  left:0;
  right:0;
  margin-left:auto;
  margin-right:auto;
  z-index:999;
  text-align:center;
}
</style>
