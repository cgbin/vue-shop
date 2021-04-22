<template>
    <el-dialog v-if="showDialogForm" :title="dialogTitle" :visible.sync="showDialogForm" @close="closeDialogForm(0)">
      <el-form :model="FormData" :rules="FormRules" ref="dialogForm" status-icon>
        <el-form-item label="用户名" :label-width="formLabelWidth" prop="username" >
          <el-input v-model="FormData.username" autocomplete="off" :disabled="!isAddForm()"></el-input>
        </el-form-item>
        <el-form-item v-if="isAddForm()" label="密码" :label-width="formLabelWidth" prop="password">
          <el-input v-model="FormData.password" type="password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" :label-width="formLabelWidth" prop="email">
          <el-input v-model="FormData.email" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="手机号" :label-width="formLabelWidth" prop="mobile">
          <el-input v-model="FormData.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialogForm(0)">取 消</el-button>
        <el-button type="primary" @click="submietForm">确 定</el-button>
      </div>
    </el-dialog>
</template>

<script>
import { addUser, editUser } from "@/network/resources.js";
  
  export default {
    'name':'UserDialogForm',
    props: {
      dialogTitle: {
        type: String,
        default: "添加用户",
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
       }
    },
    methods:{
        isAddForm(){
            return this.dialogTitle === '添加用户' ? true : false ;
        },
        submietForm(){
              this.$refs['dialogForm'].validate( async(valid) => {
              //新增用户表单提交
              if (valid && this.isAddForm()) {
                const res = await addUser(this.FormData);
                if( res.meta.status == 201){
                    this.$message.success({
                        message: res.meta.msg,
                        type: 'success'
                    });
                  this.closeDialogForm(1); //关闭并重置表单
                }else{
                  this.$message.error(res.meta.msg);
                }
                //编辑用户表单提交
              } else if(valid && !this.isAddForm()) {
                const res = await editUser(`users/${this.FormData.id}`, this.FormData);
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
          this.showDialogForm = false;
          this.$refs["dialogForm"].resetFields();
          this.$emit("closeDialogForm", flag);
        },
    }
  }
</script>

<style lang="less" scoped>

</style>


