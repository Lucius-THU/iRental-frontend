<template>
    <div class="rental">
        <Nav></Nav>
        <div class="overflow-auto">
            <b-table id="my-table" :items="items" :per-page="perPage" :current-page="currentPage" :fields="fields" :busy="isBusy">
                <template v-slot:table-busy>
                    <div class="text-center text-primary my-2">
                        <b-spinner class="align-middle"></b-spinner>
                        <strong>Loading...</strong>
                    </div>
                </template>
                <template v-slot:cell(status)="data">
                    {{ status(data.item.approved, data.item.rejected) }}
                </template>
                <template v-slot:cell(actions)="data">
                    <b-button size="sm" @click="info(data.item)" class="mr-1" variant="outline-primary">
                        详情
                    </b-button>
                </template>
            </b-table>
            <b-pagination align="center" v-model="currentPage" :total-rows="rows" :per-page="perPage" aria-controls="my-table" pills></b-pagination>
        </div>
        <b-modal ref="request-info" title="申请详情" hide-footer>
            <p>申请编号：{{ req_info.id }}</p>
            <p>设备编号：{{ req_info.equip_id }}</p>
            <p>设备名：{{ req_info.equip_name }}</p>
            <p>申请者：{{ req_info.username }}</p>
            <p>申请理由：{{ req_info.purpose }}</p>
            <p>计划归还时间：{{ req_info.expired_at }}</p>
            <p>状态：{{ req_info.status }}</p>
            <b-button v-if="($store.state.group === 'admin' || $store.state.user_id === req_info.user_id) && req_info.status === '待处理'" class="mt-3" block variant="success" @click="update(true)">同意</b-button>
            <b-button v-if="($store.state.group === 'admin' || $store.state.user_id === req_info.user_id) && req_info.status === '待处理'" class="mt-3" block variant="warning" @click="update(false)">拒绝</b-button>
            <b-button v-if="$store.state.group === 'admin'" class="mt-3" block variant="danger" @click="del">删除</b-button>
            <b-button class="mt-3" block @click="$bvModal.hide('equip-info')">关闭</b-button>
        </b-modal>
    </div>
</template>

<script>
import Nav from '../components/Nav.vue'
import format from '../components/public.js'
export default {
    name: 'Rental',
    components: {
        Nav
    },
    data(){
        return {
            currentPage: 1,
            rows: 0,
            perPage: 10,
            items: [],
            isBusy: false,
            req_info: {
                id: 0,
                user_id: 0,
                equip_id: 0,
                equip_name: '',
                username: '',
                purpose: '',
                expired_at: '',
                status: ''
            },
            fields: [
                {
                    key: 'id',
                    label: '申请编号',
                    sortable: true
                },
                {
                    key: 'username',
                    label: '申请者'
                },
                {
                    key: 'equipment_id',
                    label: '设备编号'
                },
                {
                    key: 'equipment_name',
                    label: '设备名'
                },
                {
                    key: 'status',
                    label: '状态'
                },
                {
                    key: 'actions',
                    label: '操作'
                }
            ]
        }
    },
    created(){
        this.load()
    },
    methods: {
        async load(){
            this.isBusy = true
            let items = await this.axios.get('/api/requests/rental').then(response => {
                this.rows = response.data.total
                return response.data.list
            })
            for(let i = 0; i < this.rows; i++){
                await this.axios.get('/api/users/' + items[i]['user_id']).then(response => {
                    items[i]['username'] = response.data.name === '' ? response.data.email: response.data.name
                })
                await this.axios.get('/api/equipment/', {
                    id: items[i]['equipment_id']
                }).then(response => {
                    items[i]['equipment_name'] = response.data.list[0].name
                })
            }
            this.items = items
            this.isBusy = false
        },
        status(approved, rejected){
            if(approved === false && rejected === true) return '已拒绝'
            if(approved === true) return '已同意'
            return '待处理'
        },
        info(item){
            this.req_info.id = item.id
            this.req_info.user_id = item.user_id
            this.req_info.username = item.username
            this.req_info.equip_id = item.equipment_id
            this.req_info.equip_name = item.equipment_name
            this.req_info.purpose = item.purpose
            this.req_info.expired_at = format(item.expire_at)
            this.req_info.status = this.status(item.approved, item.rejected)
            this.$refs['request-info'].show()
        },
        update(flag){
            this.axios.post('/api/requests/rental/' + this.req_info.id + '/update', {
                approved: flag
            }).then(() => {
                this.$refs['request-info'].hide()
                this.load()
            })
        },
        del(){
            this.axios.post('/api/requests/rental/' + this.req_info.id + '/delete').then(() => {
                this.$refs['request-info'].hide()
                this.load()
            })
        }
    }
}
</script>