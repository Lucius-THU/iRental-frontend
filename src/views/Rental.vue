<template>
    <div class="rental">
        <Nav></Nav>
        <div class="overflow-auto">
            <b-tabs content-class="mt-3" pills card>
                <b-tab title="当前租借" lazy @click.once="getloads">
                    <b-table id="my-table2" :items="items2" :per-page="perPage2" :current-page="currentPage2" :fields="fields2" :busy="isBusy2">
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
                            <b-button size="sm" @click="info2(data.item)" class="mr-1" variant="outline-primary">
                                详情
                            </b-button>
                        </template>
                    </b-table>
                    <b-pagination align="center" v-model="currentPage" :total-rows="rows2" :per-page="perPage2" aria-controls="my-table2" pills></b-pagination>
                    <b-modal id="equip-info" ref="equip-info" title="租借详情" hide-footer>
                        <p>设备编号：{{ equip_info.id }}</p>
                        <p>设备名：{{ equip_info.name }}</p>
                        <p>提供者：{{ equip_info.provider_name }}</p>
                        <p>到期时间：{{ equip_info.rent_until }}</p>
                        <b-button v-if="!equip_info.status" class="mt-3" block variant="outline-primary" @click="close">归还</b-button>
                        <b-button class="mt-3" block @click="$bvModal.hide('equip-info')">关闭</b-button>
                    </b-modal>
                </b-tab>
                <b-tab title="我的审核" lazy @click.once="getloads3" :disabled="$store.state.group === 'user'">
                    <b-table id="my-table3" :items="items3" :per-page="perPage3" :current-page="currentPage3" :fields="fields3" :busy="isBusy3" :sort-by.sync="sortBy" :sort-asc.sync="sortAsc">
                        <template v-slot:table-busy>
                            <div class="text-center text-primary my-2">
                                <b-spinner class="align-middle"></b-spinner>
                                <strong>Loading...</strong>
                            </div>
                        </template>
                        <template v-slot:cell(actions)="data">
                            <b-button size="sm" @click="info(data.item, false)" class="mr-1" variant="outline-primary">
                                详情
                            </b-button>
                        </template>
                    </b-table>
                    <b-pagination align="center" v-model="currentPage3" :total-rows="rows3" :per-page="perPage3" aria-controls="my-table3" pills></b-pagination>
                </b-tab>
                <b-tab title="申请记录" active>
                    <b-table id="my-table" :items="items" :per-page="perPage" :current-page="currentPage" :fields="fields" :busy="isBusy" :sort-by.sync="sortBy" :sort-asc.sync="sortAsc">
                        <template v-slot:table-busy>
                            <div class="text-center text-primary my-2">
                                <b-spinner class="align-middle"></b-spinner>
                                <strong>Loading...</strong>
                            </div>
                        </template>
                        <template v-slot:cell(actions)="data">
                            <b-button size="sm" @click="info(data.item, true)" class="mr-1" variant="outline-primary">
                                详情
                            </b-button>
                        </template>
                    </b-table>
                    <b-pagination align="center" v-model="currentPage" :total-rows="rows" :per-page="perPage" aria-controls="my-table" pills></b-pagination>
                    <b-modal id="request-info" ref="request-info" title="申请详情" hide-footer>
                        <p>申请编号：{{ req_info.id }}</p>
                        <p>设备编号：{{ req_info.equip_id }}</p>
                        <p>设备名：{{ req_info.equip_name }}</p>
                        <p v-if="flag">提供者：{{ req_info.provider_name }}</p>
                        <p>申请者：{{ req_info.username }}</p>
                        <p>申请理由：{{ req_info.purpose }}</p>
                        <p>计划归还时间：{{ req_info.expired_at }}</p>
                        <p>状态：{{ req_info.status }}</p>
                        <b-button v-if="($store.state.group === 'admin' || $store.state.user_id !== req_info.user_id) && req_info.status === '待处理' && req_info.canedit" class="mt-3" block variant="success" @click="update(true)">同意</b-button>
                        <b-button v-if="($store.state.group === 'admin' || $store.state.user_id !== req_info.user_id) && req_info.status === '待处理'  && req_info.canedit" class="mt-3" block variant="warning" @click="update(false)">拒绝</b-button>
                        <b-button v-if="$store.state.group === 'admin'" class="mt-3" block variant="danger" @click="del">删除</b-button>
                        <b-button class="mt-3" block @click="$bvModal.hide('request-info')">关闭</b-button>
                    </b-modal>
                </b-tab>
            </b-tabs>
        </div>
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
            currentPage2: 1,
            rows2: 0,
            perPage2: 10,
            currentPage3: 1,
            rows3: 0,
            perPage3: 10,
            items: [],
            items2: [],
            items3: [],
            isBusy: false,
            isBusy2: false,
            isBusy3: false,
            sortBy: 'status',
            sortAsc: true,
            req_info: {},
            flag: true,
            equip_info: {
                id: 0,
                provider_name: '',
                name: '',
                rent_until: ''
            },
            fields: [
                {
                    key: 'id',
                    label: '申请编号',
                    sortable: true
                },
                {
                    key: 'equipment_id',
                    label: '设备编号',
                    sortable: true
                },
                {
                    key: 'equipment_name',
                    label: '设备名'
                },
                {
                    key: 'provider_name',
                    label: '提供者'
                },
                {
                    key: 'username',
                    label: '申请者'
                },
                {
                    key: 'status',
                    label: '状态',
                    sortable: true,
                    formatter: (value, key, item) => {
                        if(item.approved === false && item.rejected === true) return '已拒绝'
                        if(item.approved === true) return '已同意'
                        return '待处理'
                    },
                    sortByFormatted: true,
                },
                {
                    key: 'actions',
                    label: '操作'
                }
            ],
            fields2: [
                {
                    key: 'id',
                    label: '设备编号',
                    sortable: true
                },
                {
                    key: 'name',
                    label: '设备名'
                },
                {
                    key: 'username',
                    label: '提供者'
                },
                {
                    key: 'rent_until',
                    label: '归还时间',
                    sortable: true,
                    formatter: value => {
                        return format(value)
                    },
                    sortByFormatted: true
                },
                {
                    key: 'returning',
                    label: '状态',
                    sortable: true,
                    formatter: value => {
                        return value ? '正在等待确认归还': '未归还'
                    },
                    sortByFormatted: true
                },
                {
                    key: 'actions',
                    label: '操作'
                }
            ],
            fields3: [
                {
                    key: 'id',
                    label: '申请编号',
                    sortable: true
                },
                {
                    key: 'equipment_id',
                    label: '设备编号',
                    sortable: true
                },
                {
                    key: 'equipment_name',
                    label: '设备名'
                },
                {
                    key: 'username',
                    label: '申请者'
                },
                {
                    key: 'status',
                    label: '状态',
                    sortable: true,
                    formatter: (value, key, item) => {
                        if(item.approved === false && item.rejected === true) return '已拒绝'
                        if(item.approved === true) return '已同意'
                        return '待处理'
                    },
                    sortByFormatted: true,
                },
                {
                    key: 'actions',
                    label: '操作'
                }
            ],
        }
    },
    created(){
        this.load()
    },
    methods: {
        async load(){
            this.isBusy = true
            let items = await this.axios.get('/api/requests/rental/').then(response => {
                this.rows = response.data.total
                return response.data.list
            })
            for(let i = 0; i < this.rows; i++){
                items[i]['canedit'] = items[i].equipment.user_id === null
                items[i]['provider_name'] = items[i].equipment.provider.name === '' ? items[i].equipment.provider.email: items[i].equipment.provider.name
                items[i]['equipment_name'] = items[i].equipment.name
                items[i]['username'] = items[i].user.name === '' ? items[i].user.email: items[i].user.name
            }
            this.items = items
            this.isBusy = false
        },
        status(approved, rejected){
            if(approved === false && rejected === true) return '已拒绝'
            if(approved === true) return '已同意'
            return '待处理'
        },
        info(item, flag){
            this.flag = flag
            this.req_info = {
                id: item.id,
                user_id: item.user_id,
                provider_name: item.provider_name,
                username: item.username,
                equip_id: item.equipment_id,
                equip_name: item.equipment_name,
                purpose: item.purpose,
                expired_at: format(item.rent_until),
                status: this.status(item.approved, item.rejected),
                canedit: item.canedit
            }
            this.$refs['request-info'].show()
        },
        info2(item){
            this.equip_info = {
                id: item.id,
                provider_name: item.username,
                name: item.name,
                rent_until: format(item.rent_until),
                status: item.returning
            }
            this.$refs['equip-info'].show()
        },
        update(flag){
            this.axios.post('/api/requests/rental/' + this.req_info.id + '/update', {
                approved: flag,
                notification: '您对设备（' + this.req_info.equip_name + '，设备编号：' + this.req_info.equip_id + '）的请求已被' + (flag ? '同意。请及时领取设备并按时归还！': '拒绝。')
            }).then(() => {
                this.$refs['request-info'].hide()
                this.getloads3()
                this.load()
            })
        },
        del(){
            this.axios.post('/api/requests/rental/' + this.req_info.id + '/delete').then(() => {
                this.$refs['request-info'].hide()
                this.load()
            })
        },
        close(){
            this.axios.post('/api/equipment/' + this.equip_info.id + '/close').then(() => {
                this.$refs['equip-info'].hide()
                this.getloads()
            })
        },
        async getloads(){
            this.isBusy2 = true
            let items = await this.axios.get('/api/equipment/', {
                params: {
                    user_id: this.$store.state.user_id
                }
            }).then(response => {
                this.rows2 = response.data.total
                return response.data.list
            })
            for(let i = 0; i < this.rows2; i++){
                items[i]['username'] = items[i].provider.name === '' ? items[i].provider.email: items[i].provider.name
            }
            this.items2 = items
            this.isBusy2 = false
        },
        async getloads3(){
            this.isBusy3 = true
            let items = await this.axios.get('/api/requests/rental/', {
                params: {
                    provided: 1
                }
            }).then(response => {
                this.rows3 = response.data.total
                return response.data.list
            })
            for(let i = 0; i < this.rows3; i++){
                items[i]['canedit'] = items[i].equipment.user_id === null
                items[i]['username'] = items[i].user.name === '' ? items[i].user.email: items[i].user.name
                items[i]['equipment_name'] = items[i].equipment.name
            }
            this.items3 = items
            this.isBusy3 = false
        }
    }
}
</script>