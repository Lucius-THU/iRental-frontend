<template>
    <div class="hello">
        <h1>{{ msg }}</h1>
        <b-button-group @click.prevent style="margin-left: 20px;margin-top: 20px">
            <b-button @click="makeActive('按钮1')">按钮1</b-button>
            <b-button @click="makeActive('按钮2')">按钮2</b-button>
            <b-button @click="makeActive('按钮3')" variant="outline-primary">按钮3</b-button>
        </b-button-group>
        <div>当前选择的是:{{ select }}</div>
        <b-input-group prepend="Username" class="mt-3">
            <b-form-input v-model="inp"></b-form-input>
        </b-input-group>
        <b-button variant="outline-success">
            <b-icon icon="search"></b-icon>
            {{ inp }}
        </b-button>
    </div>
</template>

<script>
export default {
    name: 'HelloWorld',
    props: {
        msg: String
    },
    data(){
        return {
            select: '按钮1',
            inp: '请输入'
        }
    },
    methods:{
        makeActive(item){
            this.select = item
        }
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
    margin: 40px 0 0;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    display: inline-block;
    margin: 0 10px;
}

a {
    color: #42b983;
}

.mt-3 {
    margin: 10px auto;
    width: 400px;
}
</style>
