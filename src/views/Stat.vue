<template>
    <div class="home">
        <Nav></Nav>
        <Chart id="echart1" :options="options1"></Chart>
    </div>
</template>

<script>
import Nav from '../components/Nav.vue'
import Chart from '../components/Chart.vue'
export default {
    name: 'Stat',
    components: {
        Nav,
        Chart
    },
    data(){
        return {
            options1: {}
        }
    },
    created(){
        this.options1 = {
            
        }
    }
}
</script>