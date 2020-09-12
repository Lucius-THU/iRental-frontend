<template>
    <div class="users">
        <Nav ref="nav" @getContent="load"></Nav>
        <div class="overflow-auto">
            <b-tabs content-class="mt-3" pills card>
                <b-tab title="所有用户">
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
                    </b-table>
                    <b-pagination align="center" v-model="currentPage" :total-rows="rows" :per-page="perPage" aria-controls="my-table" pills></b-pagination>
                </b-tab>
                <b-tab title="提供者申请" lazy @click.once="getloads">
                    <b-table id="my-table2" :items="items2" :per-page="perPage2" :current-page="currentPage2" :fields="fields2" :busy="isBusy2">
                        <template v-slot:table-busy>
                            <div class="text-center text-primary my-2">
                                <b-spinner class="align-middle"></b-spinner>
                                <strong>Loading...</strong>
                            </div>
                        </template>
                        <template v-slot:cell(actions)="data">
                            <b-button size="sm" @click="verify(data.item)" class="mr-1" variant="outline-primary">
                                设置
                            </b-button>
                        </template>
                    </b-table>
                    <b-pagination align="center" v-model="currentPage2" :total-rows="rows2" :per-page="perPage2" aria-controls="my-table2" pills></b-pagination>
                </b-tab>
            </b-tabs>
        </div>
        <UserEdit ref="user-edit" @reload="load" :info="info"></UserEdit>
        <b-modal id="request-info" ref="request-info" title="申请详情" hide-footer>
            <p><strong>相关内容</strong></p>
            <br>
            <p>{{ text }}</p>
            <b-button v-if="!checked" class="mt-3" block variant="primary" @click="update(true)">同意</b-button>
            <b-button v-if="!checked" class="mt-3" block variant="danger" @click="update(false)">拒绝</b-button>
            <b-button class="mt-3" block @click="$bvModal.hide('request-info')">关闭</b-button>
        </b-modal>
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
            currentPage2: 1,
            rows2: 0,
            perPage2: 10,
            items2: [],
            info: {},
            group: '',
            name: '',
            address: '',
            contact: '',
            email: '',
            id: 0,
            text: '',
            isBusy: false,
            isBusy2: false,
            flag: false,
            checked: false,
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
                    label: '地址',
                    sortable: true
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
                    key: 'group',
                    label: '权限',
                    sortable: true,
                    formatter: value => {
                        if(value === 'user') return '普通用户'
                        if(value === 'provider') return '提供者'
                        return '管理员'
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
                    label: '申请编号',
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
                    sortable: true
                },
                {
                    key: 'address',
                    label: '地址',
                    sortable: true
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
        },
        async getloads(){
            this.isBusy2 = true
            await this.axios.get('/api/requests/provider/').then(response => {
                this.rows2 = response.data.list.length
                this.items2 = response.data.list
            })
            for(let i = 0; i < this.rows2; i++){
                this.items2[i].username = this.items2[i].user.name
                this.items2[i].email = this.items2[i].user.email
                this.items2[i].address = this.items2[i].user.address
                this.items2[i].contact = this.items2[i].user.contact
            }
            this.isBusy2 = false
        },
        verify(item){
            this.id = item.id
            this.text = item.info
            this.checked = item.approved || item.rejected
            this.$refs['request-info'].show()
        },
        update(flag){
            this.axios.post('/api/requests/provider/' + this.id + '/update', {
                approved: flag,
                notification: '你的提供者申请已被' + (flag ? '同意。': '拒绝。')
            }).then(() => {
                this.$refs['request-info'].hide()
            }).catch(error => {
                if(error.response.status === 403) this.$router.push('/login')
            })
        }
    }
}
</script>