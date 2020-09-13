<template>
    <b-navbar toggleable="lg" type="dark" variant="info">
        <b-navbar-brand href="/">iRental</b-navbar-brand>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
            <b-navbar-nav>
                <b-nav-item href="/rental">租借信息</b-nav-item>
                <b-nav-item v-if="auth(['admin', 'provider'])" @click="$router.push('/my-equipment')">我的设备</b-nav-item>
                <b-nav-item v-if="auth(['admin'])" @click="$router.push('/users')">管理用户</b-nav-item>
                <b-nav-item v-if="auth(['admin'])" @click="$router.push('/stat')">统计信息</b-nav-item>
            </b-navbar-nav>
            <b-navbar-nav class="ml-auto">
                <b-nav-item-dropdown right>
                    <template v-slot:button-content>
                        <b-badge v-if="noti_num" pill variant="primary">{{ noti_num }}</b-badge>
                        {{ user == '' ? email: user }}
                    </template>
                    <b-dropdown-item @click="showModal">个人信息</b-dropdown-item>
                    <b-dropdown-item @click="showNotifications" v-if="notifications.length > 0 || alerts !== 0 || alerts2 !== 0">
                        通知
                        <b-badge v-if="noti_num" pill variant="primary">{{ noti_num }}</b-badge>
                    </b-dropdown-item>
                    <b-dropdown-item @click="logout">登出</b-dropdown-item>
                </b-nav-item-dropdown>
            </b-navbar-nav>
        </b-collapse>
        <UserEdit ref="user-edit" @reload="load" :info="info"></UserEdit>
        <b-modal ref="notifications" title="通知" size="lg" @hide="load">
            <b-alert variant="danger" v-if="alerts2 !== 0" show>您有 {{ alerts2 }} 个租借已经到期，请及时归还！</b-alert>
            <b-alert variant="warning" v-if="alerts !== 0" show>您有 {{ alerts }} 个租借距离到期时间不足 2 天，请及时归还。</b-alert>
            <div v-for="(post, index) in notifications" :key="index">
                <b-alert show>
                    {{ post.content }}
                    <b-button size="sm" class="mr-1" variant="outline-primary" @click="read(post.id, $event)">已读</b-button>
                </b-alert>
            </div>
            <template v-slot:modal-footer="{ cancel }">
                <b-button variant="success" @click="allread">
                    全部已读
                </b-button>
                <b-button @click="cancel()">
                    关闭
                </b-button>
            </template>
        </b-modal>
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
            info: {},
            notifications: {},
            alerts: 0,
            alerts2: 0
        }
    },
    computed: {
        noti_num(){
            return this.notifications.length + (this.alerts !== 0) + (this.alerts2 !== 0)
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
            this.alerts = 0
            this.alerts2 = 0
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
            await this.axios.get('/api/notifications/').then(response => {
                this.notifications = response.data.list
            })
            this.notifications = this.notifications.filter(notification => notification.unread)
            await this.axios.get('/api/equipment/', {
                params: {
                    user_id: this.$store.state.user_id
                }
            }).then(response => {
                let now = new Date()
                response.data.list.forEach(item => {
                    let t = new Date(item.rent_until)
                    let diff = (t - now) / 1000
                    if(diff < 0) this.alerts2 += 1
                    else if(diff / 86400 < 2) this.alerts += 1
                })
            })
        },
        showNotifications(){
            this.$refs['notifications'].show()
        },
        allread(){
            for(let i = 0; i < this.notifications.length; i++){
                this.axios.post('/api/notifications/update', {
                    id: this.notifications[i].id
                })
            }
            this.$refs['notifications'].hide()
        },
        read(id, event){
            event.target.disabled = true
            this.axios.post('/api/notifications/update', {
                id: id
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