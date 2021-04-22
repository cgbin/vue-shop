<template>
    <el-dialog v-if="showDialogForm" :title="dialogTitle" :visible.sync="showDialogForm" @close="closeDialogForm(0)">
      <el-form :model="FormData" :rules="FormRules" ref="dialogForm" status-icon>
        <el-form-item label="角色名称" :label-width="formLabelWidth" prop="roleName" >
          <el-input v-model="FormData.roleName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" :label-width="formLabelWidth" prop="roleDesc">
          <el-input v-model="FormData.roleDesc" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialogForm(0)">取 消</el-button>
        <el-button type="primary" @click="submietForm">确 定</el-button>
      </div>
    </el-dialog>
</template>

<script>
import { addRole, editRole } from "@/network/resources.js";
  
  export default {
    'name':'RoleDialogForm',
    props: {
      dialogTitle: {
        type: String,
        default: "添加角色",
      },
      FormData: {
        type: Object,
        default(){
          return {};
        },
      },
    },
    data(){
       return{
          formLabelWidth: '80px',
          showDialogForm:false,
          //表单验证规则
          FormRules:{
            roleName:[
                { required: true, message: '请输入角色名称', trigger: 'blur' },
                { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
              ],
            roleDesc:[
              { required: true, message: '请输入角色描述', trigger: 'blur' },
              { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
            ],
          }
       }
    },
    methods:{
        isAddForm(){
            return this.dialogTitle === '添加角色' ? true : false ;
        },
        submietForm(){
              this.$refs['dialogForm'].validate( async(valid) => {
              //新增角色表单提交
              if (valid && this.isAddForm()) {
                const res = await addRole('roles',this.FormData);
                if( res.meta.status == 201){
                    this.$message.success({
                        message: res.meta.msg,
                        type: 'success'
                    });
                  this.closeDialogForm(1); //关闭并重置表单
                }else{
                  this.$message.error(res.meta.msg);
                }
                //编辑角色表单提交
              } else if(valid && !this.isAddForm()) {
                const res = await editRole(`roles/${this.FormData.roleId}`, this.FormData);
                if( res.meta.status == 200){
                    this.$message.success({
                        message: res.meta.msg,
                        type: 'success'
                    });
                  this.closeDialogForm(1); //关闭并重置表单
                }else{
                  this.$message.error(res.meta.msg);
                }
              }else{
                return false;
              }
            });
        },
        // 关闭弹框
        closeDialogForm(flag) {
          //关闭并重置表单
          this.$refs["dialogForm"].resetFields();
          this.showDialogForm = false;
          this.$emit("closeDialogForm", flag);
        },
    }
  }
</script>

<style lang="less" scoped>

</style>


