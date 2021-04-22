<template>
  <div class="Roles_container">
    <!-- 面包屑导航区域 -->
    <breadcrumbs :textList="breadCrumbsText"></breadcrumbs>
    <!--  卡片内容区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="4">
          <el-button type="primary" @click="addRoles">添加角色</el-button>
        </el-col>
      </el-row>

      <template>
        <el-table :data="tableData" border stripe style="width: 100%">
          <el-table-column type="expand">
            <template slot-scope="scope">
                  <el-row  v-for="(itemx,keyx) in scope.row.children" :key="keyx" :class="['bdbuttom', keyx ?'':'bdtop']">
                    <!-- 一级权限占6 -->
                    <el-col :span="6" >
                      <el-tag @close="handleTagClose(scope.row, itemx)" closable>{{itemx.authName}}</el-tag>
                      <i class="el-icon-caret-right"></i>
                    </el-col>
                    <!-- 二级，三级共占18 -->
                    <el-col :span="18">
                        <el-row  v-for="(itemy,keyy) in itemx.children" :key="keyy" :class="[keyy ?'bdtop':'']">
                            <el-col :span="6" >
                              <el-tag closable @close="handleTagClose(scope.row, itemy)" type="success">{{itemy.authName}}</el-tag>
                              <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="18">
                              <!-- 循环三级权限 -->
                              <el-tag @close="handleTagClose(scope.row, itemz)" closable type="warning" v-for="(itemz, keyz) in itemy.children" 
                              :key="keyz">{{itemz.authName}}</el-tag>
                            </el-col>
                        </el-row>
                    </el-col>
                  </el-row>
            </template>
          </el-table-column>
          <el-table-column prop="id" label="ID"  width="100"> </el-table-column>
          <el-table-column prop="roleName" label="角色名"> </el-table-column>
          <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
          <el-table-column width="180" label="操作">
            <template v-slot="scope">
                <el-tooltip class="item" effect="dark" content="编辑" placement="top">
                    <el-button type="primary" icon="el-icon-edit" size="small" @click="editRoles(scope.row)"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="删除" placement="top">
                    <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteRoles(scope.row)"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="分配权限" placement="top">
                    <el-button type="warning" icon="el-icon-setting" size="small" @click="showAuthDialog(scope.row)"></el-button>
                </el-tooltip>
            </template> 
          </el-table-column>
        </el-table>
      </template>
    </el-card>

    <!-- 添加/编辑角色表单 -->
    <el-dialog :title="formTitle[thisForm]" :visible.sync="dialogaddRolesFormVisible" @close="FormClose">
      <el-form :model="RolesForm" :rules="addRolesFormRules" ref="RolesForm" status-icon>
        <el-form-item label="角色名" :label-width="addRolesFormLabelWidth" prop="username" >
          <el-input v-model="RolesForm.username" autocomplete="off" :disabled="!isAddForm()"></el-input>
        </el-form-item>
        <el-form-item v-if="isAddForm()" label="密码" :label-width="addRolesFormLabelWidth" prop="password">
          <el-input v-model="RolesForm.password" type="password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" :label-width="addRolesFormLabelWidth" prop="email">
          <el-input v-model="RolesForm.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" :label-width="addRolesFormLabelWidth" prop="mobile">
          <el-input v-model="RolesForm.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="FormClose">取 消</el-button>
        <el-button type="primary" @click="RolesFormConfirm">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 分配权限dialog -->
    <el-dialog :title="authDialogTitle" :visible.sync="authDialogVisible" @close="authDialogClose">
     <!-- 可选树形节点 -->
    <el-tree
      :data="authTreeData"
      show-checkbox
      node-key="id" 
      default-expand-all
      :default-checked-keys="defaultCheckedKeys"
      :props="treeProps"
      ref="authTree"
      >
    </el-tree>
      <div slot="footer" class="dialog-footer">
        <el-button @click="authDialogClose">取 消</el-button>
        <el-button type="primary" @click="authDialogConfirm">确 定</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
import { 
  getRolesList, 
  deleteRoleAuth,
  getRightsList,
  setRoleAuth
  } from "@/network/resources.js";

import Breadcrumbs from "@/components/Breadcrumbs.vue";

export default {
  data() {
    return {
      breadCrumbsText:['权限管理', '角色列表'],
      search: "",
      tableData: [],
      dialogaddRolesFormVisible:false, //新增角色表单显示
      authDialogVisible:false, //分配权限dialog显示
      authDialogTitle:'分配权限',
      authTreeData:[], //权限树形数据
      defaultCheckedKeys:[],//默认选中的数据
      //指定节点标签和子级属性
      treeProps:{
        label:'authName',
        children:'children'
      }, 
      //分配权限时用户角色id
      changeAuthRoleId:'',
      thisForm:'addRolesForm', //默认为添加角色窗口
      formTitle:{
        'addRolesForm':'新增角色',
        'editRolesForm':'编辑角色',
      },
      RolesForm:{ },  //form表单数据
      addRolesFormLabelWidth: '80px',
      //新增角色表单验证规则
      addRolesFormRules:{
        username:[
            { required: true, message: '请输入角色名', trigger: 'blur' },
            { min: 5, max: 10, message: '长度在 6 到 12 个字符', trigger: 'blur' }
          ],
        password:[
          { required: true, message: '请输入角色名', trigger: 'blur' },
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
    this.getRolesListData();
  },
  mounted() {
    
  },
  components:{
    Breadcrumbs
  },
  methods: {
    setForm(){
      this.RolesForm = {}
    },
    //获取角色列表
    async getRolesListData() {
      const rolesListData = await getRolesList();
      if (rolesListData.meta.status == 200) {
        this.tableData = rolesListData.data;
      } else {
        this.$message.error(rolesListData.meta.msg);
      }
    },
    //删除权限节点
    handleTagClose(scopRow, roleAuth){
        this.$confirm('确认删除权限【'+ roleAuth.authName +'】?', '删除权限', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        }).then( async () => {
            const res = await deleteRoleAuth(`roles/${scopRow.id}/rights/${roleAuth.id}`);
            if( res.meta.status == 200){
                this.$message.success({
                    message: res.meta.msg,
                    type: 'success'
                });
              //this.getRolesListData();
              //此次删除权限以后不能重新请求角色列表，不然展开会被收起
              //可以使用双向绑定的原理，将传进来修改的当前角色权限数据重新赋值
              scopRow.children = res.data;
            }else{
              this.$message.error(res.meta.msg);
            }
        }).catch(()=>{});
    },
    //打开分配权限dialog
    showAuthDialog(scopRow){
        this.authDialogTitle = `为【${scopRow.roleName}】分配权限`;
        //获取权限列表数据
        this.getRightsListData(scopRow);
    },
    //关闭分配权限dialog
    authDialogClose(){
        // 每次关闭dialog后，将递归获取的默认选中数组清空
        this.defaultCheckedKeys = [];
        this.authDialogVisible = false;
    },
    //获取树形所有权限列表
    async getRightsListData(scopRow) {
      const rightsListData = await getRightsList('rights/tree');
      if (rightsListData.meta.status == 200) {
        this.authTreeData = rightsListData.data;
        //获取当前角色已有权限列表，
        await this.getRoleAuthListData(scopRow, this.defaultCheckedKeys);
        this.changeAuthRoleId = scopRow.id;
        //显示分配权限dialog
        this.authDialogVisible = true;
      } else {
        this.$message.error(rightsListData.meta.msg);
      }
    },
    
    //递归获取三级权限数组
    getRoleAuthListData(node, arr) {
        //不存在子节点，则为三级节点
        if(!node.children){
          return arr.push(node.id);
        }
        node.children.forEach(item => {
           this.getRoleAuthListData(item, arr);
        });
    },
    //提交分配权限表单
    async authDialogConfirm(){
        const CheckedKeys= [ 
          //获取全选数据
          ...this.$refs.authTree.getCheckedKeys(),
          //获取半选数据
          ...this.$refs.authTree.getHalfCheckedKeys(),
          ];
        if(!CheckedKeys){
          this.$message.error('选中节点不能为空');
        }
        const authIdStr = CheckedKeys.join(',');
        const res = await setRoleAuth(`roles/${this.changeAuthRoleId}/rights`,{'rids':authIdStr});
        if( res.meta.status == 200){
              this.$message.success(res.meta.msg);
              this.getRolesListData();
              this.authDialogVisible = false;
          }else{
              this.$message.error(res.meta.msg);
        }
    },
    //打开添加角色窗口
    addRoles(){
      //解决重置之后以第一次更新的数据作为标准，即表单的数据为编辑时的数据
      this.setForm();
      this.dialogaddRolesFormVisible = true;
      this.thisForm = 'addRolesForm';
    },
    //打开编辑角色窗口
    async editRoles(row){
      const res = await getUser('/Roles/' + row.id);
      if( res.meta.status == 200){
          this.RolesForm = res.data;
          this.dialogaddRolesFormVisible = true;
          this.thisForm = 'editRolesForm';
      }else{
          this.$message.error(login_res.meta.msg);
      }
    },
    isAddForm(){
     return this.thisForm === 'addRolesForm' ? true : false ;
    },
    //关闭添加/编辑角色窗口
    FormClose(){
      this.dialogaddRolesFormVisible = false;
      //重置表单
      this.$refs.RolesForm.resetFields();
    },
  
    //提交角色窗口
    RolesFormConfirm(){
      this.$refs.RolesForm.validate( async(valid) => {
          //新增角色表单提交
          if (valid && this.isAddForm()) {
            const res = await addUser(this.RolesForm);
            if( res.meta.status == 201){
                this.$message.success({
                    message: res.meta.msg,
                    type: 'success'
                });
              this.getUserListData();
              this.FormClose(); //关闭并重置表单
            }else{
              this.$message.error(res.meta.msg);
            }
            //编辑角色表单提交
          } else if(valid && !this.isAddForm()) {
            const res = await editUser('Roles/'+ this.RolesForm.id, this.RolesForm);
            if( res.meta.status == 200){
                this.$message.success({
                    message: res.meta.msg,
                    type: 'success'
                });
              this.getUserListData();
              this.FormClose(); //关闭并重置表单
            }else{
              this.$message.error(res.meta.msg);
            }
          }else{
            return false;
          }
        });
    },
    //删除角色
     deleteRoles(row){
      this.$confirm('确认删除该角色吗?', '删除角色', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        }).then( async () => {
            const res = await deleteUser('Roles/'+ row.id);
            if( res.meta.status == 200){
                this.$message.success({
                    message: res.meta.msg,
                    type: 'success'
                });
              this.getUserListData();
            }else{
              this.$message.error(res.meta.msg);
            }
        }).catch(()=>{});
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

.el-row{
  display: flex;
  align-items: center;
}

.el-tag{
  margin: 6px;
}

.bdtop{
  border-top: 1px solid #eee;
}

.bdbuttom{
  border-bottom: 1px solid  #eee;
}


</style>


