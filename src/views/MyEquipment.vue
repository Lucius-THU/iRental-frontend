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
            </b-form>
        </b-modal>
        <b-modal id="equip-info" ref="equip-info" title="设备详情" hide-footer>
            <p>设备编号：{{ equip_info.equip_id }}</p>
            <p>设备名：{{ equip_info.name }}</p>
            <p>设备地址：{{ equip_info.address }}</p>
            <p>提供者：{{ equip_info.provider_name }}</p>
            <p>联系方式：{{ equip_info.contact }}</p>
            <p>上架状态：{{ equip_info.launched ? '已上架': '未上架'}}</p>
            <p v-if="equip_info.launched">借出状态：{{ equip_info.used ? '已借出': '未借出' }}</p>
            <p v-if="equip_info.launched">预计归还时间：{{ equip_info.rent_until }}</p>
            <p v-if="!equip_info.launched">申请情况：{{ equip_info.requesting ? '正在申请上架': '未申请上架' }}</p>
            <p>计划下架时间：{{ equip_info.expire_at }}</p>
            <b-button v-if="$store.state.group === 'admin' && !equip_info.launched" class="mt-3" block variant="success" @click="launch">上架</b-button>
            <b-button v-if="(equip_info.provider_id === $store.state.user_id && $store.state.group !== 'admin') && !equip_info.launched && !equip_info.requesting" class="mt-3" block variant="success" @click="request">申请上架</b-button>
            <b-button v-if="(equip_info.provider_id === $store.state.user_id || $store.state.group === 'admin') && equip_info.launched" class="mt-3" block variant="warning" @click="discontinue">下架</b-button>
            <b-button v-if="equip_info.provider_id === $store.state.user_id || $store.state.group === 'admin'" class="mt-3" block variant="primary" @click="update">修改</b-button>
            <b-button v-if="$store.state.group === 'admin' || equip_info.provider_id === $store.state.user_id" class="mt-3" block variant="danger" @click="del">删除</b-button>
            <b-button class="mt-3" block @click="$bvModal.hide('equip-info')">关闭</b-button>
        </b-modal>
        <b-modal ref="update-equipment" title="修改设备" @ok='handle2Submit'>
            <b-form ref="form" @submit.stop.prevent="handle2Submit">
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
import format from '../components/public.js'
export default {
    name: 'MyEquipment',
    components: {
        Nav
    },
    data(){
        return {
            filter: '',
            filterOn: [],
            currentPage: 1,
            rows: 0,
            perPage: 10,
            new_equip_name: '',
            new_equip_addr: '',
            new_equip_date: '',
            new_equip_time: '',
            equip_name: '',
            equip_addr: '',
            equip_date: '',
            equip_time: '',
            items: [],
            isBusy: true,
            equip_info: {
                address: '',
                contact: '',
                equip_id: 0,
                launched: false,
                used: false,
                name: '',
                requesting: false,
                provider_name: '',
                provider_id: 0,
                rent_until: ''
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
        }
    },
    methods: {
        create(){
            this.$refs['create-equipment'].show()
        },
        load(data){
            this.axios.get('/api/equipment/', {
                params: {
                    provider_id: data
                }
            }).then(response => {
                this.rows = response.data.total
                this.items = response.data.list
                this.isBusy = false
            })
        },
        hideModal(){
            this.new_equip_name = ''
            this.new_equip_addr = ''
            this.new_equip_date = ''
            this.new_equip_time = ''
            this.$refs['create-equipment'].hide()
        },
        async info(item){
            this.equip_info.address = item.address
            this.equip_info.equip_id = item.id
            this.equip_info.launched = item.launched
            this.equip_info.name = item.name
            this.equip_info.requesting = item.requesting
            this.equip_info.used = (item.user_id !== null)
            this.equip_info.provider_id = item.provider_id
            this.equip_info.expire_at = format(item.expire_at)
            if(this.equip_info.used) this.equip_info.rent_until = format(item.rent_until)
            this.equip_info.date
            await this.axios.get('/api/users/' + item.provider_id).then(response => {
                this.equip_info.contact = response.data.contact
                this.equip_info.provider_name = response.data.name === '' ? response.data.email: response.data.name
            })
            this.$refs['equip-info'].show()
        },
        update(){
            this.equip_name = this.equip_info.name
            this.equip_addr = this.equip_info.address
            let time = this.equip_info.expire_at.split(' ')
            this.equip_date = time[0]
            this.equip_time = time[1]
            this.$refs['update-equipment'].show()
        },
        handleSubmit(){
            this.axios.post('/api/equipment/create', {
                name: this.new_equip_name,
                address: this.new_equip_addr,
                expire_at: this.new_equip_date + 'T' + this.new_equip_time + '+08:00'
            }).then(() => {
                this.load()
            })
        },
        handle2Submit(){
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
                this.load(this.$store.state.user_id)
            })
        },
        discontinue(){
            this.axios.post('/api/equipment/' + this.equip_info.equip_id + '/discontinue').then(() => {
                this.$refs['equip-info'].hide()
                this.load(this.$store.state.user_id)
            })
        },
        request(){
            this.axios.post('/api/equipment/' + this.equip_info.equip_id + '/request').then(() => {
                this.$refs['equip-info'].hide()
                this.load(this.$store.state.user_id)
            })
        }
    }
}
</script>

<style scoped>
.add-equip {
    margin: 5px 10px 20px 10px;
}
</style>