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
       <UserEdit ref="user-edit" @reload="load" :info="info"></UserEdit>
    </b-navbar>
</template>

<script>
import UserEdit from './UserEdit.vue'
export default {
    name: 'Nav',
    components: {
        UserEdit
    },
    data(){
        return {
            user: this.$store.state.username,
            group: this.$store.state.group,
            email: this.$store.state.email,
            info: {}
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
            this.info = {
                group: this.group,
                name: this.user,
                address: this.$store.state.address,
                contact: this.$store.state.contact,
                email: this.email,
                id: this.$store.state.user_id
            }
            this.$refs['user-edit'].$refs['person-info'].show()
        },
        async load(){
            await this.axios.get('/api/users/current').then(response => {
                this.$store.commit('setUserid', response.data.id)
                this.$store.commit('setUsername', response.data.name)
                this.$store.commit('setGroup', response.data.group)
                this.$store.commit('setEmail', response.data.email)
                this.$store.commit('setAddress', response.data.address)
                this.$store.commit('setContact', response.data.contact)
                this.group = response.data.group
                this.user = response.data.name
                this.email = response.data.email
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