<template>
    <div class="my-equipment">
        <Nav @getContent="load"></Nav>
        <div class="overflow-auto">
            <b-button variant="outline-primary" @click="create">添加设备</b-button>
            <b-table id="my-table" :items="items" :per-page="perPage" :current-page="currentPage" :fields="fields" :busy="isBusy">
                <template v-slot:table-busy>
                    <div class="text-center text-primary my-2">
                        <b-spinner class="align-middle"></b-spinner>
                        <strong>Loading...</strong>
                    </div>
                </template>
                <template v-slot:cell(status)="data">
                    {{ status(data.item) }}
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
    </div>
</template>

<script>
import Nav from '../components/Nav.vue'
export default {
    name: 'MyEquipment',
    components: {
        Nav
    },
    data(){
        return {
            currentPage: 1,
            rows: 0,
            perPage: 10,
            new_equip_name: '',
            new_equip_addr: '',
            new_equip_date: '',
            new_equip_time: '',
            items: [],
            isBusy: true,
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
                }
            ],
        }
    },
    methods: {
        status(item){
            if(item['user_id'] !== null) return '已借出'
            if(item['requesting']) return '已有申请待审核'
            if(item['launched']) return '在架上'
            return '待上架'
        },
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
        handleSubmit(){
            this.axios.post('/api/equipment/create', {
                name: this.new_equip_name,
                address: this.new_equip_addr,
                expire_at: this.new_equip_date + 'T' + this.new_equip_time + '+08:00'
            }).then(() => {
                this.load()
            })
        }
    }
}
</script>

<style scoped>
button {
    margin: 5px 10px 20px 10px;
}
</style>>