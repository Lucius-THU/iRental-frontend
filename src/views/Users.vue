<template>
    <div class="users">
        <Nav ref="nav" @getContent="load"></Nav>
        <div class="overflow-auto">
            <b-table id="my-table" :items="items" :per-page="perPage" :current-page="currentPage" :fields="fields" :busy="isBusy">
                <template v-slot:table-busy>
                    <div class="text-center text-primary my-2">
                        <b-spinner class="align-middle"></b-spinner>
                        <strong>Loading...</strong>
                    </div>
                </template>
                <template v-slot:cell(actions)="data">
                    <b-button size="sm" @click="edit(data.item)" class="mr-1" variant="outline-primary">
                        设置
                    </b-button>
                </template>
                <template v-slot:cell(group)="data">
                    {{ status(data.value) }}
                </template>
            </b-table>
            <b-pagination align="center" v-model="currentPage" :total-rows="rows" :per-page="perPage" aria-controls="my-table" pills></b-pagination>
        </div>
        <UserEdit ref="user-edit" @reload="load" :info="info"></UserEdit>
    </div>
</template>

<script>
import Nav from '../components/Nav.vue'
import UserEdit from '../components/UserEdit.vue'
export default {
    name: 'Users',
    components: {
        Nav,
        UserEdit
    },
    data(){
        return {
            currentPage: 1,
            rows: 0,
            perPage: 10,
            items: [],
            info: {},
            group: '',
            name: '',
            address: '',
            contact: '',
            email: '',
            isBusy: false,
            flag: false,
            fields: [
                {
                    key: 'id',
                    label: '用户编号',
                    sortable: true
                },
                {
                    key: 'name',
                    label: '用户名',
                    sortable: true
                },
                {
                    key: 'address',
                    label: '地址'
                },
                {
                    key: 'email',
                    label: '邮箱'
                },
                {
                    key: 'contact',
                    label: '联系电话' 
                },
                {
                    key: 'group',
                    label: '权限'
                },
                {
                    key: 'actions',
                    label: '操作'
                }
            ],
            options: [
                { value: 'admin', text: '管理员' },
                { value: 'provider', text: '设备提供者' },
                { value: 'user', text: '普通用户' }
            ]
        }
    },
    created(){
        this.load()
    },
    methods: {
        async load(){
            if(this.flag) this.$refs['nav'].load()
            this.flag = false
            this.isBusy = true
            await this.axios.get('/api/users/').then(response => {
                this.rows = response.data.list.length
                this.items = response.data.list
            })
            this.isBusy = false
        },
        edit(item){
            this.info = {
                group: item.group,
                name: item.name,
                address: item.address,
                contact: item.contact,
                email: item.email,
                id: item.id
            }
            if(item.id === this.$store.state.user_id) this.flag = true
            this.$refs['user-edit'].$refs['person-info'].show()
        },
        status(value){
            if(value === 'admin') return '管理员'
            if(value === 'provider') return '设备提供者'
            return '普通用户'
        }
    }
}
</script>