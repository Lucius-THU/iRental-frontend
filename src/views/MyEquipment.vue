<template>
    <div class="my-equipment">
        <Nav @getContent="load"></Nav>
        <b-row style="margin-top: 30px;">
            <b-col lg="6" class="my-1">
                <b-form-group label="筛选器" label-cols-sm="3" label-align-sm="right" label-size="sm" label-for="filterInput" class="mb-0">
                    <b-input-group size="sm">
                        <b-form-input v-model="filter" type="search" id="filterInput" placeholder="键入以检索"></b-form-input>
                        <b-input-group-append>
                            <b-button :disabled="!filter" @click="filter = ''">清空</b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
            </b-col>
            <b-col lg="6" class="my-1">
                <b-form-group label="选择字段以进行针对性筛选" label-cols-sm="3" label-align-sm="left" label-size="sm" class="mb-0">
                    <b-form-checkbox-group v-model="filterOn" class="mt-1">
                        <b-form-checkbox value="id">设备编号</b-form-checkbox>
                        <b-form-checkbox value="name">设备名</b-form-checkbox>
                        <b-form-checkbox value="address">设备地址</b-form-checkbox>
                    </b-form-checkbox-group>
                </b-form-group>
                <b-form-text>留空时默认对部分字段（包括未显示的）进行筛选</b-form-text>
            </b-col>
        </b-row>
        <div class="overflow-auto">
            <b-button class="add-equip" variant="outline-primary" @click="create">添加设备</b-button>
            <b-table id="my-table" :items="items" :per-page="perPage" :current-page="currentPage" :fields="fields" :busy="isBusy" :filter="filter" :filterIncludedFields="filterOn">
                <template v-slot:table-colgroup="scope">
                    <col v-for="field in scope.fields" :key="field.key" :style="{ width: field.key === 'id' ? '100px' : (field.key === 'address' ? '300px': '200px') }">
                </template>
                <template v-slot:table-busy>
                    <div class="text-center text-primary my-2">
                        <b-spinner class="align-middle"></b-spinner>
                        <strong>Loading...</strong>
                    </div>
                </template>
                <template v-slot:cell(actions)="data">
                    <b-button size="sm" @click="info(data.item)" class="mr-1" variant="outline-primary">
                        详情
                    </b-button>
                    <b-button size="sm" @click="load_data(data.item)" v-b-modal.modal-xl class="mr-1" variant="outline-primary">
                        历史记录
                    </b-button>
                </template>
            </b-table>
            <b-pagination align="center" v-model="currentPage" :total-rows="rows" :per-page="perPage" aria-controls="my-table" pills></b-pagination>
        </div>
        <b-modal ref="create-equipment" title="添加设备" @hidden="hideModal" @ok='handleSubmit'>
            <b-form ref="form" @submit.stop.prevent="handleSubmit">
                <b-form-group label="设备名" label-for="name-input">
                    <b-input-group>
                        <b-input-group-prepend is-text>
                            <b-icon icon="grid3x3-gap-fill"></b-icon>
                        </b-input-group-prepend>
                        <b-form-input id="name-input" v-model="new_equip_name"></b-form-input>
                    </b-input-group>
                </b-form-group>
                <b-form-group label="设备地址" label-for="address-input">
                    <b-input-group>
                        <b-input-group-prepend is-text>
                            <b-icon icon="house-door-fill"></b-icon>
                        </b-input-group-prepend>
                        <b-form-input id="address-input" v-model="new_equip_addr"></b-form-input>
                    </b-input-group>
                </b-form-group>
                <b-form-group label="结束出租时间" label-for="email-input">
                    <b-form-datepicker v-model="new_equip_date" class="mb-3" placeholder="请选择日期"></b-form-datepicker>
                    <b-form-timepicker v-model="new_equip_time" show-seconds :hour12="false" placeholder="请选择时间"></b-form-timepicker>
                </b-form-group>
                <b-form-text v-if="seen" style="color: red !important;">请完整填写设备信息！</b-form-text>
            </b-form>
        </b-modal>
        <Equipment ref="equipment" :equip_info="equip_info" @reload="load"></Equipment>
        <b-modal id="modal-xl" size="xl" title="历史记录" ok-only>
            <b-table id="my-table2" :items="items2" :per-page="perPage2" :current-page="currentPage2" :fields="fields2" :busy="isBusy2" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc">
                <template v-slot:table-busy>
                    <div class="text-center text-primary my-2">
                        <b-spinner class="align-middle"></b-spinner>
                        <strong>Loading...</strong>
                    </div>
                </template>
            </b-table>
            <b-pagination align="center" v-model="currentPage2" :total-rows="rows2" :per-page="perPage2" aria-controls="my-table2" pills></b-pagination>
        </b-modal>
    </div>
</template>

<script>
import Nav from '../components/Nav.vue'
import Equipment from '../components/Equipment.vue'
import format from '../components/public.js'
export default {
    name: 'MyEquipment',
    components: {
        Nav,
        Equipment
    },
    data(){
        return {
            filter: '',
            filterOn: [],
            currentPage: 1,
            rows: 0,
            perPage: 10,
            currentPage2: 1,
            rows2: 0,
            perPage2: 10,
            new_equip_name: '',
            new_equip_addr: '',
            new_equip_date: '',
            new_equip_time: '',
            sortBy: 'id',
            sortDesc: true,
            items: [],
            items2: [],
            isBusy: true,
            isBusy2: true,
            equip_info: {},
            seen: false,
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
                    sortable: true,
                    formatter: (value, key, item) => {
                        if(item['user_id'] !== null) return '已借出'
                        if(item['launched']) return '在架上'
                        if(item['requesting']) return '正在申请上架'
                        return '待上架'
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
                    label: '租借编号',
                    sortable: true
                },
                {
                    key: 'user_id',
                    label: '用户编号',
                    sortable: true
                },
                {
                    key: 'username',
                    label: '用户名',
                    sortale: true
                },
                {
                    key: 'email',
                    label: '邮箱',
                    sortable: true
                },
                {
                    key: 'contact',
                    label: '联系电话',
                    sortable: true
                },
                {
                    key: 'returned',
                    label: '状态',
                    sortable: true,
                    formatter: (value) => {
                        return value ? '已归还': '未归还'
                    },
                    sortByFormatted: true,
                }
            ]
        }
    },
    methods: {
        create(){
            this.$refs['create-equipment'].show()
        },
        load(data){
            this.isBusy = true
            this.axios.get('/api/equipment/', {
                params: {
                    provider_id: data
                }
            }).then(response => {
                this.rows = response.data.total
                this.items = response.data.list
                this.isBusy = false
            }).catch(error => {
                if(error.response.status === 403) this.$router.push('/login')
            })
        },
        hideModal(){
            this.new_equip_name = ''
            this.new_equip_addr = ''
            this.new_equip_date = ''
            this.new_equip_time = ''
            this.seen = false
            this.$refs['create-equipment'].hide()
        },
        async info(item){
            this.equip_info = {
                address: item.address,
                equip_id: item.id,
                launched: item.launched,
                name: item.name,
                requesting: item.requesting,
                used: item.user_id !== null,
                provider_id: item.provider_id,
                expire_at: format(item.expire_at),
                rent_until: item.user_id !== null ? format(item.rent_until): '',
                contact: item.provider.contact,
                provider_name: item.provider.name,
                email: item.provider_email
            }
            this.$refs['equipment'].$refs['equip-info'].show()
        },
        handleSubmit(event){
            event.preventDefault()
            if(this.new_equip_name !== '' && this.new_equip_addr !== '' && this.new_equip_date !== '' && this.new_equip_time !== ''){
                this.axios.post('/api/equipment/create', {
                    name: this.new_equip_name,
                    address: this.new_equip_addr,
                    expire_at: this.new_equip_date + 'T' + this.new_equip_time + '+08:00'
                }).then(() => {
                    this.load(this.$store.state.user_id)
                    this.$refs['create-equipment'].hide()
                })
            } else {
                this.seen = true
            }
        },
        async load_data(item){
            this.isBusy2 = true
            this.perPage2 = 10
            this.currentPage2 = 1
            await this.axios.get('/api/records/', {
                params: {
                    equipment_id: item.id
                }
            }).then(response => {
                this.rows2 = response.data.list.length
                this.items2 = response.data.list
            })
            for(let i = 0; i < this.rows2; i++){
                this.items2[i].username = this.items2[i].user.name
                this.items2[i].email = this.items2[i].user.email
                this.items2[i].contact = this.items2[i].user.contact
            }
            this.isBusy2 = false
        }
    }
}
</script>

<style scoped>
.add-equip {
    margin: 5px 10px 20px 10px;
}
</style>