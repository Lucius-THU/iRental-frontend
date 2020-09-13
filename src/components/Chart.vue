<template>
  <div class="echarts-box" :id="id">
  </div>
</template>
 
<script>
import * as echarts from 'echarts';
export default {
    name: 'Chart',
    props: ['options','id'],
    mounted(){
        let myChart = echarts.init(document.getElementById(this.id));
        myChart.setOption(this.options);
    }
}
</script>
