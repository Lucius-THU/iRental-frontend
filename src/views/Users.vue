<template>
    <div class="users">
        <Nav @getContent="load"></Nav>
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
        <b-modal ref="person-info" title="用户信息" @ok="handleSubmit">
            <b-form ref="form" @submit.stop.prevent="handleSubmit">
                <b-form-group label="用户名" label-for="name-input">
                    <b-input-group>
                        <b-input-group-prepend is-text>
                            <b-icon icon="person-circle"></b-icon>
                        </b-input-group-prepend>
                        <b-form-input id="name-input" v-model="name"></b-form-input>
                    </b-input-group>
                </b-form-group>
                <b-form-group label="地址" label-for="address-input">
                    <b-input-group>
                        <b-input-group-prepend is-text>
                            <b-icon icon="house-door-fill"></b-icon>
                        </b-input-group-prepend>
                        <b-form-input id="address-input" v-model="address"></b-form-input>
                    </b-input-group>
                </b-form-group>
                <b-form-group label="邮箱" label-for="email-input">
                    <b-input-group>
                        <b-input-group-prepend is-text>
                            <b-icon icon="envelope-fill"></b-icon>
                        </b-input-group-prepend>
                        <b-form-input id="email-input" v-model="email" disabled></b-form-input>
                    </b-input-group>
                </b-form-group>
                <b-form-group label="联系电话" label-for="contact-input">
                    <b-input-group>
                        <b-input-group-prepend is-text>
                            <b-icon icon="phone-fill"></b-icon>
                        </b-input-group-prepend>
                        <b-form-input id="contact-input" v-model="contact" type="tel"></b-form-input>
                    </b-input-group>
                </b-form-group>
                <b-form-group label="权限" label-for="auth-input">
                    <b-input-group>
                        <b-input-group-prepend is-text>
                            <b-icon icon="gear-wide-connected"></b-icon>
                        </b-input-group-prepend>
                        <b-form-select id="auth-input" v-model="group" :options="options"></b-form-select>
                    </b-input-group>
                </b-form-group>
                <b-button v-if="group !== 'admin'" class="mt-3" block variant="danger" @click="del">删除</b-button>
            </b-form>
        </b-modal>
    </div>
</template>

<script>
import Nav from '../components/Nav.vue'
export default {
    name: 'Users',
    components: {
        Nav
    },
    data(){
        return {
            currentPage: 1,
            rows: 0,
            perPage: 10,
            items: [],
            group: '',
            name: '',
            address: '',
            contact: '',
            email: '',
            isBusy: false,
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
            this.isBusy = true
            await this.axios.get('/api/users/').then(response => {
                this.rows = response.data.list.length
                this.items = response.data.list
            })
            this.isBusy = false
        },
        edit(item){
            this.name = item.name
            this.address = item.address
            this.contact = item.contact
            this.email = item.email
            this.group = item.group
            this.id = item.id
            this.$refs['person-info'].show()
        },
        handleSubmit(){
            this.axios.post('/api/users/' + this.id + '/update', {
                name: this.name,
                address: this.address,
                contact: this.contact,
                group: this.group
            }).then(() => {
                this.load()
            })
        },
        status(value){
            if(value === 'admin') return '管理员'
            if(value === 'provider') return '设备提供者'
            return '普通用户'
        },
        del(){
            this.axios.post('api/users/' + this.id + '/delete').then(() => {
                this.$refs['person-info'].hide()
                this.load()
            })
        }
    }
}
</script>