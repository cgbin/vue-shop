<template>
    <el-dialog v-if="showDialogForm" :title="dialogTitle" :visible.sync="showDialogForm" @close="closeDialogForm(0)">
      <el-form :model="FormData" :rules="FormRules" ref="dialogForm" status-icon>
        <el-form-item label="分类名" :label-width="formLabelWidth" prop="cat_name" >
          <el-input v-model="FormData.cat_name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="分类名" :label-width="formLabelWidth" prop="cat_pid" >
          <!-- Cascader 级联选择器 -->
          <el-cascader
              v-model="selectCateIds"
              :options="PCateList"
              :props="casCaderProps"
              @change="handleCateChange"
              clearable
              :disabled="!isAddForm()"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialogForm(0)">取 消</el-button>
        <el-button type="primary" @click="submietForm">确 定</el-button>
      </div>
    </el-dialog>
</template>

<script>
import { addCate, editCate } from "@/network/resources.js";
  
  export default {
    'name':'CateDialogForm',
    props: {
      dialogTitle: {
        type: String,
        default: "添加分类",
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
              cat_name:[
                { required: true, message: '请输入分类名', trigger: 'blur' },
                { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
              ],
          },
          // Cascader 级联选择器 props配置项
          casCaderProps:{ 
            label:'cat_name',
            expandTrigger: 'hover', 
            value:'cat_id',
            children:'children',
            checkStrictly:true, //取消父子关联，可选子节点
          },
          PCateList:[], //1,2级分类列表
          selectCateIds:[], //选中的分类数组
       }
    },
    methods:{
        isAddForm(){
            return this.dialogTitle === '添加分类' ? true : false ;
        },
            //切换分类完成回调, value为选中的值
        handleCateChange(value){
          //长度大于0说明选中了值
          if(this.selectCateIds.length > 0){
              //父级id ，0为默认1级分类 
              this.FormData.cat_pid = this.selectCateIds[this.selectCateIds.length -1 ];
              //0表示一级分类；1表示二级分类；2表示三级分类
              this.FormData.cat_level = this.selectCateIds.length;
          }else{
              this.FormData.cat_pid = 0;
              this.FormData.cat_level = 0;
          }
        },
        submietForm(){
              this.$refs['dialogForm'].validate( async(valid) => {
              //新增角色表单提交
              if (valid && this.isAddForm()) {
                const res = await addCate('categories',this.FormData);
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
                const res = await editCate(`categories/${this.FormData.cat_id}`, { cat_name: this.FormData.cat_name});
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
.el-cascader{
  width: 100%;
}
</style>


