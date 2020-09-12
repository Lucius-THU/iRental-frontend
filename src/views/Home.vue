<template>
    <div class="home">
        <Nav></Nav>
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
                <b-form-group label="选择字段或状态进行筛选" label-cols-sm="3" label-align-sm="left" label-size="sm" class="mb-0">
                    <b-form-checkbox-group v-model="filterOn" class="mt-1">
                        <b-form-checkbox value="id">设备编号</b-form-checkbox>
                        <b-form-checkbox value="name">设备名</b-form-checkbox>
                        <b-form-checkbox value="address">设备地址</b-form-checkbox>
                    </b-form-checkbox-group>
                    <b-form-text>留空时默认对部分字段（包括未显示的）进行筛选</b-form-text>
                    <b-form-checkbox-group label="" v-model="filter2On" class="mt-1">
                        <b-form-checkbox value="requesting" @click="load">待同意上架</b-form-checkbox>
                        <b-form-checkbox value="returning" @click="load">待确认归还</b-form-checkbox>
                    </b-form-checkbox-group>
                </b-form-group>
            </b-col>
        </b-row>
        <div class="overflow-auto">
            <b-table id="my-table" :items="items" :per-page="perPage" :current-page="currentPage" :fields="fields" :filter="filter" :filterIncludedFields="filterOn"
            :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" :busy="isBusy">
                <template v-slot:table-colgroup="scope">
                    <col v-for="field in scope.fields" :key="field.key" :style="{ width: field.key === 'id' ? '100px' : (field.key === 'address' ? '300px': '200px') }">
                </template>
                <template v-slot:table-busy>
                    <div class="text-center text-primary my-2">
                        <b-spinner class="align-middle"></b-spinner>
                        <strong>  加载中……</strong>
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
        <Equipment ref="equipment" :equip_info="equip_info" @reload="load"></Equipment>
    </div>
</template>

<script>
import Nav from '../components/Nav.vue'
import Equipment from '../components/Equipment.vue'
import format from '../components/public.js'
export default {
    name: 'Home',
    components: {
        Nav,
        Equipment
    },
    data(){
        return {
            filter: '',
            filterOn: [],
            filter2On: [],
            currentPage: 1,
            rows: 0,
            perPage: 10,
            sortBy: 'status',
            sortDesc: true,
            equip_info: {},
            isBusy: false,
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
                    label: '设备地址',
                    sortable: true
                },
                {
                    key: 'status',
                    label: '状态',
                    sortable: true,
                    formatter: (value, key, item) => {
                        if(item['returning']) return '正等待确认归还'
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
            items: []
        }
    },
    created(){
        this.load()
    },
    watch: {
        filter2On(){
            this.load()
        }
    },
    methods: {
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
                email: item.provider.email,
                returning: item.returning
            }
            this.$refs['equipment'].$refs['equip-info'].show()
        },
        async load(){
            this.isBusy = true
            let params = {}
            if(this.filter2On.indexOf('requesting') !== -1) params['requesting'] = 'True'
            if(this.filter2On.indexOf('returning') !== -1) params['returning'] = 'True'
            await this.axios.get('/api/equipment/', {
                params: params
            }).then(response => {
                this.rows = response.data.total
                this.items = response.data.list
            }).catch(error => {
                if(error.response.status === 403) this.$router.push('/login')
            })
            this.isBusy = false
        }
    }
}
</script>