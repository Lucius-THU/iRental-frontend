<template>
    <div class="signup">
        <b-form>
            <b-form-group label="邮箱" label-for="input-1" invalid-feedback="邮箱格式错误" :state="emailState">
                <b-input-group>
                    <b-input-group-prepend is-text>
                        <b-icon icon="envelope-fill"></b-icon>
                    </b-input-group-prepend>
                    <b-form-input id="input-1" v-model="email" type="email" :state="emailState"></b-form-input>
                </b-input-group>
                <b-form-text v-if="emailError" style="color: red !important;">此邮箱已注册！</b-form-text>
            </b-form-group>
            <b-form-group label="密码" label-for="input-2" invalid-feedback="密码长度不足" :state="pwdState">
                <b-input-group>
                    <b-input-group-prepend is-text>
                        <b-icon icon="shield-lock"></b-icon>
                    </b-input-group-prepend>
                    <b-form-input id="input-2" v-model="password" type="password" :state="pwdState"></b-form-input>
                </b-input-group>
                <b-form-text>密码至少为 6 位</b-form-text>
            </b-form-group>
            <b-form-group label="确认密码" label-for="input-3"  invalid-feedback="两次输入密码不同" :state="pwd2State">
                <b-input-group>
                    <b-input-group-prepend is-text>
                        <b-icon icon="shield-lock-fill"></b-icon>
                    </b-input-group-prepend>
                    <b-form-input id="input-3" v-model="password2" type="password" :state="pwd2State"></b-form-input>
                </b-input-group>
            </b-form-group>
            <b-form-group label="验证码" label-for="input-4"  invalid-feedback="验证码错误" :state="tokenState">
                <b-input-group>
                    <b-form-input id="input-4" v-model="token"></b-form-input>
                    <b-input-group-append>
                        <b-button variant="outline-primary" @click="change" :disabled="seen">向邮箱发送</b-button>
                    </b-input-group-append>
                </b-input-group>
                <b-form-text v-if="seen">两分钟后可再次发送</b-form-text>
            </b-form-group>
            <b-button variant="outline-primary" id="signup-btn" @click.prevent="signup" :disabled="cantSignup">注册</b-button>
        </b-form>
    </div>
</template>

<script>
export default {
    name: 'Signup',
    data(){
        return {
            email: '',
            password: '',
            password2: '',
            token: '',
            onceTry: false,
            tokenState: true,
            timer: null,
            seen: false,
            emailError: false,
            cantSignup: true
        }
    },
    computed: {
        state(){
            return this.emailState && this.pwdState && this.pwd2State
        },
        emailState(){
            if(this.email == '' && !this.onceTry){
                return null
            }
            let pattern = /^\w[\w\\-]*@\w[\w\\-]*(\.\w[\w\\-]*)+$/
            return pattern.test(this.email)
        },
        pwdState(){
            if(this.password == '' && !this.onceTry){
                return null
            }
            return this.password.length > 5
        },
        pwd2State(){
            if(this.password2 == ''){
                if(this.onceTry && this.password != '') return false
                return null
            }
            return this.password == this.password2
        }
    },
    methods: {
        signup(){
            this.axios.post('/api/signup', {
                email: this.email,
                password: this.password,
                token: this.token
            }).then(response => {
                if(response.data.error === 'invalid token'){
                    this.tokenState = false
                } else {
                    if(this.timer !== null) clearInterval(this.timer);
                    this.timer = null;
                    this.$router.push('/login')
                }
            })
        },
        change(evt){
            this.onceTry = true
            if(this.state){
                this.cantSignup = false
                this.emailError = false
                this.axios.post('/api/signup', {
                    email: this.email,
                    password: this.password
                }).then(response => {
                    if(response.data.error === 'email exists'){
                        this.emailError = true
                    } else {
                        this.emailError = false
                        evt.target.innerText = '再次发送'
                        this.seen = true
                        if(!this.timer){
                            this.count = 120;
                            this.timer = setInterval(() => {
                                if(this.count > 0){
                                    this.count--;
                                } else {
                                    clearInterval(this.timer);
                                    this.timer = null;
                                    this.seen = false;
                                }
                            }, 1000)
                        }
                    }
                })
            }
        }
    }
}
</script>

<style scoped>
.signup {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

#signup-btn {
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
