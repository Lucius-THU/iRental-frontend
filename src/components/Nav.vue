<template>
    <b-navbar toggleable="lg" type="dark" variant="info">
        <b-navbar-brand href="/">iRental</b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
            <b-navbar-nav>
                <b-nav-item href="/rental">租借信息</b-nav-item>
                <b-nav-item v-if="auth(['admin', 'provider'])" @click="toMyEquipment">我的设备</b-nav-item>
                <b-nav-item v-if="auth(['admin'])" @click="toUsers">管理用户</b-nav-item>
            </b-navbar-nav>
            <b-navbar-nav class="ml-auto">
                <b-nav-item-dropdown right>
                    <template v-slot:button-content>
                        {{ user == '' ? email: user }}
                    </template>
                    <b-dropdown-item @click="showModal">个人信息</b-dropdown-item>
                    <b-dropdown-item @click="logout">登出</b-dropdown-item>
                </b-nav-item-dropdown>
            </b-navbar-nav>
        </b-collapse>
        <b-modal ref="person-info" title="个人信息" @hidden="hideModal" @ok="handleSubmit">
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
                        <b-form-select id="auth-input" v-model="group" :options="options" :disabled="group !== 'admin'"></b-form-select>
                    </b-input-group>
                </b-form-group>
            </b-form>
        </b-modal>
    </b-navbar>
</template>

<script>
export default {
    name: 'Nav',
    data(){
        return {
            user: this.$store.state.username,
            group: this.$store.state.group,
            name: '',
            email: '',
            address: '',
            contact: '',
            options: [
                { value: 'admin', text: '管理员' },
                { value: 'provider', text: '设备提供者' },
                { value: 'user', text: '普通用户' }
            ]
        }
    },
    async created(){
        await this.load()
        this.$emit('getContent', this.$store.state.user_id)
    },
    methods: {
        logout(){
            this.axios.post('/api/logout').then(() => {
                this.$router.push('/login')
            })
        },
        auth(groups){
            return groups.indexOf(this.group) > -1
        },
        toMyEquipment(){
            this.$router.push('/my-equipment')
        },
        toUsers(){
            this.$router.push('/users')
        },
        showModal(){
            this.$refs['person-info'].show()
        },
        hideModal(){
            this.name = this.$store.state.username
            this.address = this.$store.state.address
            this.contact = this.$store.state.contact
            this.$refs['person-info'].hide()
        },
        handleSubmit(){
            this.axios.post('/api/users/' + this.$store.state.user_id + '/update', {
                name: this.name,
                address: this.address,
                contact: this.contact,
                group: this.group
            }).then(() => {
                this.load()
            })
        },
        async load(){
            await this.axios.get('/api/users/current').then(response => {
                this.$store.commit('setUserid', response.data.id)
                this.$store.commit('setUsername', response.data.name)
                this.$store.commit('setGroup', response.data.group)
                this.$store.commit('setAddress', response.data.address)
                this.$store.commit('setContact', response.data.contact)
                this.$store.commit('setEmail', response.data.email)
                this.group = response.data.group
                this.name = response.data.name
                this.user = response.data.name
                this.email = response.data.email
                this.address = response.data.address
                this.contact = response.data.contact
            }).catch(error => {
                if(error.response.status === 403) this.$router.push('/login')
            })
        }
    }
}
</script>

<style scoped>
nav {
    box-shadow: 0 0.25rem 0.25rem rgba(0,0,0,.25), inset 0 -1px 5px rgba(0,0,0,.25);
}
</style>