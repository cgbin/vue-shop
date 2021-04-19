<template>
  <div class="users_container">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--  卡片内容区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入用户名" 
          v-model="queryData.query" 
          clearable
          @clear="clearInput"
          >
            <template #append>
              <el-button icon="el-icon-search" @click="startSearch"></el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogaddUsersFormVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <template>
        <el-table :data="tableData" border stripe style="width: 100%">
          <el-table-column prop="id" label="ID"> </el-table-column>
          <el-table-column prop="username" label="用户名"> </el-table-column>
          <el-table-column prop="role_name" label="角色"> </el-table-column>
          <el-table-column prop="mobile" label="手机号"> </el-table-column>
          <el-table-column prop="email" label="邮箱"> </el-table-column>
          <el-table-column prop="mg_state" label="状态">
            <template v-slot="scope">
                <el-switch v-model="scope.row.mg_state" @change="changeStatus(scope.row)"></el-switch>
              </template> 
          </el-table-column>
          <el-table-column prop="create_time" label="创建时间"></el-table-column>
          <el-table-column width="180" label="操作">
            <template v-slot="scope">
    <el-tooltip class="item" effect="dark" content="编辑" placement="top">
        <el-button type="primary" icon="el-icon-edit" size="small"></el-button>
    </el-tooltip>
    <el-tooltip class="item" effect="dark" content="删除" placement="top">
        <el-button type="danger" icon="el-icon-delete" size="small"></el-button>
    </el-tooltip>
    <el-tooltip class="item" effect="dark" content="分配角色" placement="top">
        <el-button type="warning" icon="el-icon-setting" size="small"></el-button>
    </el-tooltip>
            </template> 
          </el-table-column>
        </el-table>
      </template>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryData.pagenum"
          :page-sizes="pageSizes"
          :page-size="queryData.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalpage">
        </el-pagination>
    </el-card>

    <!-- 添加用户表单 -->
    <el-dialog title="新增用户" :visible.sync="dialogaddUsersFormVisible">
      <el-form :model="addUsersForm" :rules="addUsersFormRules" ref="addUsersForm" status-icon>
        <el-form-item label="用户名" :label-width="addUsersFormLabelWidth" prop="username">
          <el-input v-model="addUsersForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" :label-width="addUsersFormLabelWidth" prop="password">
          <el-input v-model="addUsersForm.password" type="password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" :label-width="addUsersFormLabelWidth" prop="email">
          <el-input v-model="addUsersForm.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" :label-width="addUsersFormLabelWidth" prop="mobile">
          <el-input v-model="addUsersForm.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addUsersFormClose">取 消</el-button>
        <el-button type="primary" @click="addUsersFormConfirm">确 定</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
import { getUserList, changeUserStatus, addUser } from "@/network/resources.js";

export default {
  data() {
    return {
      search: "",
      tableData: [],
      totalpage:0,
      pageSizes:[10, 50, 100],
      queryData: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      dialogaddUsersFormVisible:false, //新增用户表单显示
      addUsersForm:{
        username:'',
        password:'',
        email:'', //可空
        mobile:'', //可空
      },
      addUsersFormLabelWidth: '80px',
      //新增用户表单验证规则
      addUsersFormRules:{
        username:[
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 5, max: 10, message: '长度在 6 到 12 个字符', trigger: 'blur' }
          ],
        password:[
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 5, max: 10, message: '长度在 6 到 12 个字符', trigger: 'blur' }
        ],
        email:[
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        mobile: [{
          pattern: /^1[34578]\d{9}$/, //可以写正则表达式呦呦呦
          message: '请输入正确的中国大陆手机号码',
          trigger: 'blur'
        }],
      }
    };
  },
  created() {
    this.getUserListData();
  },
  mounted() {
    
  },

  methods: {
    //获取用户列表
    async getUserListData() {
      const userListData = await getUserList(this.queryData);
      if (userListData.meta.status == 200) {
        this.tableData = userListData.data.users;
        this.totalpage = userListData.data.total;
        this.queryData.pagenum = userListData.data.pagenum;
      } else {
        this.$message.error(userListData.meta.msg);
      }
    },
    //改变分页页面和数量
    handleSizeChange(val) {
        this.queryData.pagesize = val;
        this.getUserListData();
      },
    handleCurrentChange(val) {
        this.queryData.pagenum = val;
        this.getUserListData();
    },
    //修改用户状态
    async changeStatus(scopeData){
      const api_url = '/users/'+scopeData.id+'/state/' + scopeData.mg_state;
      const res = await changeUserStatus(api_url)
      if( res.meta.status == 200){
          this.$message.success({
              message: res.meta.msg,
              type: 'success'
          });
      }else{
          this.$message.error(login_res.meta.msg);
      }
    },
    //搜索用户
    startSearch(){
      this.getUserListData();
    },
    //清空搜索框时触发
    clearInput(){
      this.getUserListData();
    },
    //关闭添加用户窗口
    addUsersFormClose(){
      this.dialogaddUsersFormVisible = false;
      //重置表单
      this.$refs.addUsersForm.resetFields();
    },
    //提交添加用户窗口
    addUsersFormConfirm(){
      this.$refs.addUsersForm.validate( async(valid) => {
          if (valid) {
            const add_res = await addUser(this.addUsersForm);
            if( add_res.meta.status == 201){
                this.$message.success({
                    message: add_res.meta.msg,
                    type: 'success'
                });
              this.getUserListData();
              this.dialogaddUsersFormVisible = false;
            }else{
              this.$message.error(add_res.meta.msg);
            }
          } else {
            return false;
          }
        });
    }

  },
};
</script>

<style lang="less" scoped>
.el-breadcrumb {
  margin-bottom: 15px;
}
.el-table{
  margin:15px 0px;
}
</style>


