<template>
    <div class="login">
        <b-form>
            <b-form-group label="邮箱" label-for="input-1" invalid-feedback="邮箱格式错误" :state="emailState">
                <b-input-group>
                    <b-input-group-prepend is-text>
                        <b-icon icon="envelope-fill"></b-icon>
                    </b-input-group-prepend>
                    <b-form-input id="input-1" v-model="email" type="email" :state="emailState"></b-form-input>
                </b-input-group>
            </b-form-group>
            <b-form-group label="密码" label-for="input-2" invalid-feedback="请输入密码" :state="pwdState">
                <b-input-group>
                    <b-input-group-prepend is-text>
                        <b-icon icon="shield-lock-fill"></b-icon>
                    </b-input-group-prepend>
                    <b-form-input id="input-2" v-model="password" type="password" :state="pwdState"></b-form-input>
                </b-input-group>
            </b-form-group>
            <b-button variant="outline-primary" id="login-btn" @click.prevent="login">登录</b-button>
        </b-form>
        <div id="hint">没有账号？<a href="/signup">立即注册</a></div>
    </div>
</template>

<script>
export default {
    name: 'Login',
    data(){
        return {
            email: '',
            password: '',
            onceTry: false
        }
    },
    computed: {
        emailState(){
            if(this.email == '' && !this.onceTry){
                return null
            }
            let pattern = /^\w[\w\\-]*@\w[\w\\-]*(\.\w[\w\\-]*)+$/
            return pattern.test(this.email)
        },
        pwdState(){
            if(!this.onceTry) return null
            return this.password != ''
        }
    },
    methods: {
        login(){
            this.onceTry = true
            if(this.emailState && this.pwdState){
                this.axios.post('/api/login').then({

                })
            }
        }
    }
}
</script>

<style scoped>
.login {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

#login-btn {
    margin-top: 20px;
    width: 100%;
}

#hint {
    margin-top: 10px;
    color: gray;
    font-size: 80%;
    font-weight: 400;
    text-align: center;
}

.form-group {
    width: 280px;
    height: 100px;
}
</style>
