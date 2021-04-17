<template>

<el-container class="home_container">
    <!-- 顶部header区域 -->
    <el-header>
        <div class="header_left">
            <img src="@/assets/logo.png" class="avatar_box">
            <span>电商后台管理系统</span>
        </div>
        <el-button type="info" @click="login_out">退出</el-button>
    </el-header>
    <el-container>
    <!-- 左侧菜单栏区域 -->
    <el-aside :style="{width:autoWidth}">
        <div class="toggle-button" @click="toggleButton">|||</div>
        <el-menu 
        :default-active="$route.path" 
        class="el-menu-vertical-demo" 
        background-color="#333744" 
        text-color="#fff"
        :unique-opened="true"
        @open="handleOpen" @close="handleClose" :collapse="isCollapse"
        :router="true"
        >
        <!-- 一级菜单 -->
        <el-submenu :index="index + ''" v-for="(item,index) in LeftMenuList" :key="item.id" >
            <!-- 一级菜单模板 -->
            <template #title>
            <!-- 图标 -->
            <i class="el-icon-location"></i>
            <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+ item_2.path" v-for="item_2 in item.children" :key="item_2.id">
                <template #title>
                <!-- 图标 -->
                <i class="el-icon-location"></i>
                <span>{{item_2.authName}}</span>
                </template>
            </el-menu-item>
            
        </el-submenu>
        </el-menu>
    </el-aside>
    <el-main>
        <router-view></router-view>
    </el-main>
    </el-container>
</el-container>

</template>

<script>
import { getLeftMenu } from '@/network/resources.js'

  export default {
    data() {
      return {
        isCollapse: false,
        LeftMenuList:[]
      };
    },
    created(){
        this.getLeftMenuData();
    },
    mounted(){
    
    },
    methods:{
        handleOpen(key, keyPath) {
            console.log(key, keyPath);
        },
        handleClose(key, keyPath) {
            console.log(key, keyPath);
        },
        login_out() {
            this.$confirm('确认退出吗?', '退出登录', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                    }).then(() => {
                        window.sessionStorage.clear();
                        this.$router.push('/login');
                    }).catch(()=>{});
        },
         async getLeftMenuData(){
            const menuData = await getLeftMenu();
            if(menuData.meta.status == 200){
                this.LeftMenuList = menuData.data;
            }else{
                this.$message.error(menuData.meta.msg);
            } 
        },
        toggleButton(){
            this.isCollapse = !this.isCollapse;
        },
        autoWidth(){
            return isCollapse? '64px':'200px';
        }
    }
  }
</script>

<style lang="less" scoped>
.home_container{
    height: 100%;

    .el-header{
        background-color: #373d41;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .el-aside{
        max-width: 200px;
        background-color: #333744;
        .el-menu{
           border-right: none;
        }
        .toggle-button {
            background-color: #4a5064;
            font-size: 10px;
            line-height: 24px;
            color: #fff;
            text-align: center;
            letter-spacing: 0.2em;
            cursor: pointer;
        }
    }
    .el-main{
       background-color: #eaedf1; 
    }

    .header_left{
        display: flex;
        justify-content: space-between;
        align-items: center;
        span{color: #fff;margin-left: 10px;font-size: 20px;}
        .avatar_box {
            height: 50px;
            width: 50px;
            border-radius: 50%;
            background-color: #fff;
            border: 1px solid #eee;
            img{
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: #eee;
            }
        }

    }

}


</style>


