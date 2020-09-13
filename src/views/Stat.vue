<template>
    <div class="home">
        <Nav></Nav>
        <div class="loading text-center text-primary" v-if="isBusy">
            <b-spinner class="align-middle"></b-spinner>
            <strong>  加载中……</strong>
        </div>
        <Chart class="mychart" id="echart1" :options="options1" v-if="JSON.stringify(options1) !== '{}'"></Chart>
        <Chart class="mychart" id="echart2" :options="options2" v-if="JSON.stringify(options2) !== '{}'"></Chart>
        <Chart class="mychart" id="echart3" :options="options3" v-if="JSON.stringify(options3) !== '{}'"></Chart>
        <Chart class="mychart" id="echart4" :options="options4" v-if="JSON.stringify(options4) !== '{}'"></Chart>
        <Chart class="mychart" id="echart5" :options="options5" v-if="JSON.stringify(options5) !== '{}'"></Chart>
        <Chart class="mychart" id="echart6" :options="options6" v-if="JSON.stringify(options6) !== '{}'"></Chart>
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
            isBusy: true,
            options1: {},
            options2: {},
            options3: {},
            options4: {},
            options5: {},
            options6: {}
        }
    },
    methods: {
        colorPick(params){
            var colorList = ['#c23531','#2f4554', '#61a0a8', '#d48265', '#91c7ae','#749f83',  '#ca8622', '#bda29a','#6e7074', '#546570', '#c4ccd3']
            return colorList[params.dataIndex]
        }
    },
    async created(){
        let users = await this.axios.get('/api/users/').then(response => {
            let admin = response.data.list.filter(item => item.group === 'admin').length
            let provider = response.data.list.filter(item => item.group === 'provider').length
            return [response.data.list.length, admin, provider, response.data.list.length - admin - provider]
        })
        let equipments = await this.axios.get('/api/equipment/').then(response => {
            let rented = response.data.list.filter(item => item.user_id !== null).length
            let launched = response.data.list.filter(item => item.launched).length - rented
            return [response.data.total, rented, launched, response.data.total - rented - launched]
        })
        let rentals = await this.axios.get('/api/requests/rental/').then(response => {
            let approved = response.data.list.filter(item => item.approved).length
            let rejected = response.data.list.filter(item => item.rejected).length
            return [response.data.total, approved, rejected, response.data.total - approved - rejected]
        })
        let top_equip = await this.axios.get('/api/stats/top_equipment').then(response => {
            return response.data.list
        })
        let top_users = await this.axios.get('/api/stats/top_users').then(response => {
            return response.data.list
        })
        this.options1 = {
            title: {
                text: '全局统计',
                x: 'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{b} <br/>{a} : {c}"
            },
            xAxis: {
                data: ['用户','设备','请求']
            },
            yAxis: {},
            series: {
                name: '总数',
                type: 'bar',
                data: [users[0], equipments[0], rentals[0]],
                itemStyle: {
                    normal: {
                        color: this.colorPick
                    }
                }
            }
        }
        this.options2 = {
            title: {
                text: '用户统计',
                x: 'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                show: true,
                orient: 'vertical',
                left: 'left',
                data: ['管理员','设备提供者','普通用户']
            },
            series: {
                name: '数量',
                type: 'pie',
                radius : '55%',
                center: ['50%', '60%'],
                data: [
                    { value: users[1], name: '管理员' },
                    { value: users[2], name: '设备提供者' },
                    { value: users[3], name: '普通用户'}
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        }
        this.options3 = {
            title: {
                text: '设备统计',
                x: 'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                show: true,
                orient: 'vertical',
                left: 'left',
                data: ['已借出','在架上','未上架']
            },
            series: {
                name: '数量',
                type: 'pie',
                radius : '55%',
                center: ['50%', '60%'],
                data: [
                    { value: equipments[1], name: '已借出' },
                    { value: equipments[2], name: '在架上' },
                    { value: equipments[3], name: '未上架'}
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        }
        this.options4 = {
            title: {
                text: '申请统计',
                x: 'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                show: true,
                orient: 'vertical',
                left: 'left',
                data: ['已同意','已拒绝','待处理']
            },
            series: {
                name: '数量',
                type: 'pie',
                radius : '55%',
                center: ['50%', '60%'],
                data: [
                    { value: rentals[1], name: '已同意' },
                    { value: rentals[2], name: '已拒绝' },
                    { value: rentals[3], name: '待处理' }
                ],
                itemStyle: {
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        }
        this.options5 = {
            title: {
                text: '租用次数最多的设备',
                x: 'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{b} <br/>{a} : {c}"
            },
            xAxis: {
                data: [top_equip[0].name, top_equip[1].name, top_equip[2].name]
            },
            yAxis: {},
            series: {
                name: '总次数',
                type: 'bar',
                data: [top_equip[0].rental_count, top_equip[1].rental_count, top_equip[2].rental_count],
                itemStyle: {
                    normal: {
                        color: this.colorPick
                    }
                }
            }
        }
        this.options6 = {
            title: {
                text: '成功租用次数最多的用户',
                x: 'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{b} <br/>{a} : {c}"
            },
            xAxis: {
                data: [top_users[0].name, top_users[1].name, top_users[2].name]
            },
            yAxis: {},
            series: {
                name: '总次数',
                type: 'bar',
                data: [top_users[0].rental_count, top_users[1].rental_count, top_users[2].rental_count],
                itemStyle: {
                    normal: {
                        color: this.colorPick
                    }
                }
            }
        }
        this.isBusy = false
    }
}
</script>

<style scoped>
.loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.mychart {
    width: 50%;
    height: 400px;
    margin: 20px auto;
    float: left;
}
</style>