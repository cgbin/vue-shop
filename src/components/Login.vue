<template>
 <div class="login_container"> 
    <div class="login_box">
        <div class="avatar_box"><img src="@/assets/logo.png"></div>

    <div class="login_form">

      <el-form ref="login_form" :rules="rules" :model="login_form" label-width="0px">  
       <el-form-item prop="username"> 
        <el-input
            placeholder="请输入用户名"
            prefix-icon="el-icon-user-solid"
            v-model="login_form.username">
        </el-input>
       </el-form-item>
       <el-form-item prop="password">
        <el-input
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            v-model="login_form.password" type="password">
        </el-input>
       </el-form-item>
        
            <el-form-item>
                <div class="butns">
            <el-button type="primary" @click="onSubmit()">登录</el-button>
            <el-button type="info" @click="onReset()">重置</el-button>
                </div>
            </el-form-item>
    
      </el-form>

    </div>
    </div>
     
</div>
</template>

<script>
import { getLoginStatus } from '@/network/resources.js'


  export default {
    data() {
        return {
            login_form: {
                username: 'admin',
                password: '123456',
            },
            rules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 1, max: 12, message: '长度在 1 到 12 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
      onSubmit(login_form) {
        this.$refs.login_form.validate( async (valid) => {
          if (valid) {
            const login_res = await getLoginStatus(this.login_form);
            if( login_res.meta.status == 200){
                window.sessionStorage.setItem('token',login_res.data.token);
                this.$message.success({
                    message: login_res.meta.msg,
                    type: 'success'
                });
                this.$router.push('/home');
            }else{
                this.$message.error(login_res.meta.msg);
            }
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      onReset(login_form) {
        //   console.log(this.$refs);
        this.$refs.login_form.resetFields();
      }
    }
  }
</script>

<style lang="less" scoped>
    .login_container{
        background-color: #2b4b6b;
        height: 100%;
        .login_box{
            width: 450px;
            height: 300px;
            background-color: #fff;
            border-radius: 3px;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%,-50%);
            .avatar_box {
                height: 120px;
                width: 120px;
                border-radius: 50%;
                background-color: #fff;
                border: 1px solid #eee;
                padding: 10px;
                box-shadow: 0 0 10px #ddd;
                position: absolute;
                left: 50%;
                top: 0;
                transform: translate(-50%,-45%);
                img{
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background-color: #eee;
                }
            }
            .login_form{
                position: absolute;
                bottom: 0;
                width: 100%;
                padding: 0px 20px;
                box-sizing: border-box;
            }
            .butns{
                display: flex;
                justify-content: flex-end;
            }

        }
    }

    
</style>


