<template>
    <div class="home">
        <Nav></Nav>
        <div class="overflow-auto">
            <b-table id="my-table" :items="items" :per-page="perPage" :current-page="currentPage" :fields="fields">
                <template v-slot:cell(status)="data">
                    {{ status(data.item) }}
                </template>
                <template v-slot:cell(actions)="data">
                    <b-button size="sm" @click="info(data.item)" class="mr-1" variant="outline-primary">
                        详情
                    </b-button>
                </template>
            </b-table>
            <b-pagination align="center" v-model="currentPage" :total-rows="rows" :per-page="perPage" aria-controls="my-table" pills></b-pagination>
        </div>
        <b-modal id="equip-info" ref="equip-info" title="设备详情" hide-footer>
            <p>设备编号：{{ equip_info.equip_id }}</p>
            <p>设备名：{{ equip_info.name }}</p>
            <p>设备地址：{{ equip_info.address }}</p>
            <p>提供者：{{ equip_info.provider_name }}</p>
            <p>联系方式：{{ equip_info.contact }}</p>
            <p>上架状态：{{ equip_info.launched ? '已上架': '未上架'}}</p>
            <p v-if="equip_info.launched">借出状态：{{ equip_info.used ? '已借出': '未借出' }}</p>
            <p v-if="!equip_info.launched">申请情况：{{ equip_info.requesting ? '正在申请上架': '未申请上架' }}</p>
            <b-button v-if="$store.state.group === 'admin' && !equip_info.launched" class="mt-3" block variant="success" @click="launch">上架</b-button>
            <b-button v-if="(equip_info.provider_id === $store.state.user_id && $store.state.group !== 'admin') && !equip_info.launched && !equip_info.requesting" class="mt-3" block variant="success" @click="request">申请上架</b-button>
            <b-button v-if="(equip_info.provider_id === $store.state.user_id || $store.state.group === 'admin') && equip_info.launched" class="mt-3" block variant="warning" @click="discontinue">下架</b-button>
            <b-button v-if="equip_info.provider_id === $store.state.user_id || $store.state.group === 'admin'" class="mt-3" block variant="primary" @click="update">修改</b-button>
            <b-button v-if="$store.state.group === 'admin'" class="mt-3" block variant="danger" @click="del">删除</b-button>
            <b-button class="mt-3" block @click="$bvModal.hide('equip-info')">关闭</b-button>
        </b-modal>
        <b-modal ref="update-equipment" title="修改设备" @ok='handleSubmit'>
            <b-form ref="form" @submit.stop.prevent="handleSubmit">
                <b-form-group label="设备名" label-for="name-input">
                    <b-input-group>
                        <b-input-group-prepend is-text>
                            <b-icon icon="grid3x3-gap-fill"></b-icon>
                        </b-input-group-prepend>
                        <b-form-input id="name-input" v-model="equip_name"></b-form-input>
                    </b-input-group>
                </b-form-group>
                <b-form-group label="设备地址" label-for="address-input">
                    <b-input-group>
                        <b-input-group-prepend is-text>
                            <b-icon icon="house-door-fill"></b-icon>
                        </b-input-group-prepend>
                        <b-form-input id="address-input" v-model="equip_addr"></b-form-input>
                    </b-input-group>
                </b-form-group>
                <b-form-group label="结束出租时间" label-for="email-input">
                    <b-form-datepicker v-model="equip_date" class="mb-3" placeholder="请选择日期"></b-form-datepicker>
                    <b-form-timepicker v-model="equip_time" show-seconds :hour12="false" placeholder="请选择时间"></b-form-timepicker>
                </b-form-group>
            </b-form>
        </b-modal>
    </div>
</template>

<script>
import Nav from '../components/Nav.vue'
export default {
    name: 'Home',
    components: {
        Nav
    },
    data(){
        return {
            currentPage: 1,
            rows: 0,
            perPage: 10,
            equip_name: '',
            equip_addr: '',
            equip_date: '',
            equip_time: '',
            equip_info: {
                address: '',
                contact: '',
                equip_id: 0,
                launched: false,
                used: false,
                name: '',
                requesting: false,
                provider_name: '',
                provider_id: 0
            },
            fields: [
                {
                    key: 'id',
                    label: '设备编号',
                    sortable: true
                },
                {
                    key: 'name',
                    label: '设备名',
                    sortable: true
                },
                {
                    key: 'address',
                    label: '设备地址'
                },
                {
                    key: 'status',
                    label: '状态',
                    sortable: true
                },
                {
                    key: 'actions',
                    label: '操作'
                }
            ],
            items: []
        }
    },
    created(){
        this.load()
    },
    methods: {
        status(item){
            if(item['user_id'] !== null) return '已借出'
            if(item['launched']) return '在架上'
            if(item['requesting']) return '正在申请上架'
            return '待上架'
        },
        async info(item){
            this.equip_info.address = item.address
            this.equip_info.equip_id = item.id
            this.equip_info.launched = item.launched
            this.equip_info.name = item.name
            this.equip_info.requesting = item.requesting
            this.equip_info.used = (item.user_id !== null)
            this.equip_info.provider_id = item.provider_id
            this.equip_info.expire_at = item.expire_at
            this.equip_info.date
            await this.axios.get('/api/users/' + item.provider_id).then(response => {
                this.equip_info.contact = response.data.contact
                this.equip_info.provider_name = response.data.name === '' ? response.data.email: response.data.name
            })
            this.$refs['equip-info'].show()
        },
        format(time, format) {
            let t = new Date(time)
            let tf = i => ((i < 10 ? '0' : '') + i)
            return format.replace(/yyyy|MM|dd|HH|mm|ss/g, a => {
                switch(a) {
                    case 'yyyy':
                        return tf(t.getFullYear())
                    case 'MM':
                        return tf(t.getMonth() + 1)
                    case 'mm':
                        return tf(t.getMinutes())
                    case 'dd':
                        return tf(t.getDate())
                    case 'HH':
                        return tf(t.getHours())
                    case 'ss':
                        return tf(t.getSeconds())
                    }
            })
        },
        update(){
            this.equip_name = this.equip_info.name
            this.equip_addr = this.equip_info.address
            let time = this.format(this.equip_info.expire_at, 'yyyy-MM-dd HH:mm:ss').split(' ')
            this.equip_date = time[0]
            this.equip_time = time[1]
            this.$refs['update-equipment'].show()
        },
        load(){
            this.axios.get('/api/equipment/').then(response => {
                this.rows = response.data.total
                this.items = response.data.list
            }).catch(() => {
                this.$router.push('/login')
            })
        },
        handleSubmit(){
            this.axios.post('/api/equipment/' + this.equip_info.equip_id + '/update', {
                name: this.equip_name,
                address: this.equip_addr,
                expire_at: this.equip_date + 'T' + this.equip_time + '+08:00'
            }).then(() => {
                this.$refs['equip-info'].hide()
                this.load()
            })
        },
        del(){
            this.axios.post('/api/equipment/' + this.equip_info.equip_id + '/delete').then(() => {
                this.$refs['equip-info'].hide()
                this.load()
            })
        },
        launch(){
            this.axios.post('/api/equipment/' + this.equip_info.equip_id + '/launch').then(() => {
                this.$refs['equip-info'].hide()
                this.load()
            })
        },
        discontinue(){
            this.axios.post('/api/equipment/' + this.equip_info.equip_id + '/discontinue').then(() => {
                this.$refs['equip-info'].hide()
                this.load()
            })
        },
        request(){
            this.axios.post('/api/equipment/' + this.equip_info.equip_id + '/request').then(() => {
                this.$refs['equip-info'].hide()
                this.load()
            })
        }
    }
}
</script>