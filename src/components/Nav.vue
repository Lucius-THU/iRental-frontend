<template>
    <b-navbar toggleable="lg" type="dark" variant="info">
        <b-navbar-brand href="/">iRental</b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
            <b-navbar-nav>
                <b-nav-item href="/my-rental">我的租借</b-nav-item>
                <b-nav-item v-if="auth(['admin', 'provider'])" @click="toMyEquipment">我的设备</b-nav-item>
            </b-navbar-nav>
            <b-navbar-nav class="ml-auto">
                <b-nav-form>
                    <b-form-input size="sm" class="mr-sm-2" placeholder="输入待查找的设备名……"></b-form-input>
                    <b-button size="sm" class="my-2 my-sm-0" type="submit">搜索</b-button>
                </b-nav-form>
                <b-nav-item-dropdown right>
                    <template v-slot:button-content>
                        {{ user }}
                    </template>
                    <b-dropdown-item href="#">个人信息</b-dropdown-item>
                    <b-dropdown-item @click="logout">登出</b-dropdown-item>
                </b-nav-item-dropdown>
            </b-navbar-nav>
        </b-collapse>
    </b-navbar>
</template>

<script>
export default {
    name: 'Nav',
    data(){
        return {
            user: this.$store.state.username,
            group: this.$store.state.group
        }
    },
    created(){
        this.axios.get('/api/users/current').then(response => {
            this.$store.commit('setUserid', response.data.id)
            this.$store.commit('setUsername', response.data.name == '' ? response.data.email: response.data.name)
            this.$store.commit('setAddress', response.data.address)
            this.$store.commit('setContact', response.data.contact)
            this.$store.commit('setGroup', response.data.group)
            this.user = this.$store.state.username
            this.group = this.$store.state.group
        })
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
        }
    }
}
</script>

<style scoped>
nav {
    box-shadow: 0 0.25rem 0.25rem rgba(0,0,0,.25), inset 0 -1px 5px rgba(0,0,0,.25);
}
</style>