<template>
    <div class="home">
        <Nav></Nav>
        <div class="overflow-auto">
            <b-table id="my-table" :items="items" :per-page="perPage" :current-page="currentPage" :fields="fields">
                <template v-slot:cell(status)="data">
                    {{ status(data.item) }}
                </template>
            </b-table>
            <b-pagination align="center" v-model="currentPage" :total-rows="rows" :per-page="perPage" aria-controls="my-table" pills></b-pagination>
        </div>
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
            items: []
        }
    },
    mounted(){
        this.axios.get('/api/equipment/').then(response => {
            this.rows = response.data.total
            this.items = response.data.list
        })
    },
    methods: {
        status(item){
            if(item['user_id'] !== null) return '已借出'
            if(item['requesting']) return '已有申请待审核'
            if(item['launched']) return '在架上'
            return '待上架'
        }
    }
}
</script>