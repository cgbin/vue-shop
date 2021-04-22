<template>
  <div class="Cate_container">
    <!-- 面包屑导航区域 -->
    <breadcrumbs :textList="breadCrumbsText"></breadcrumbs>
    <!--  卡片内容区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="4">
          <el-button type="primary" @click="addCate">添加分类</el-button>
        </el-col>
      </el-row>

      <template>
        <el-table :data="tableData" border stripe style="width: 100%"
         row-key="cat_id"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
          <el-table-column prop="cat_name" label="分类名"> </el-table-column>
          <el-table-column prop="cat_id" label="分类ID"  width="100"> </el-table-column>
          <el-table-column prop="cat_deleted" label="是否有效">
            <template v-slot="scope">
                <i class="el-icon-success" v-if="!scope.row.cat_deleted"></i>
                <i class="el-icon-error" v-else></i>
            </template> 
          </el-table-column>
          <el-table-column prop="cat_level" label="层级">
            <template v-slot="scope">
                <el-tag :type="levelText[scope.row.cat_level][1]">{{levelText[scope.row.cat_level][0]}}</el-tag>
            </template> 
          </el-table-column>
          <el-table-column width="180" label="操作">
            <template v-slot="scope">
                <el-tooltip class="item" effect="dark" content="编辑" placement="top">
                    <el-button type="primary" icon="el-icon-edit" size="small" @click="editCate(scope.row)"></el-button>
                </el-tooltip>
                <el-tooltip class="item" effect="dark" content="删除" placement="top">
                    <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteCate(scope.row)"></el-button>
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

    <!-- 添加/编辑分类表单 -->
    <el-dialog :title="formTitle[thisForm]" :visible.sync="dialogaddCateFormVisible" @close="FormClose">
      <el-form :model="CateForm" :rules="addCateFormRules" ref="CateForm" status-icon>
        <el-form-item label="分类名" :label-width="addCateFormLabelWidth" prop="cat_name" >
          <el-input v-model="CateForm.cat_name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="分类名" :label-width="addCateFormLabelWidth" prop="cat_pid" >
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
        <el-button @click="FormClose">取 消</el-button>
        <el-button type="primary" @click="CateFormConfirm">确 定</el-button>
      </div>
    </el-dialog>

   


  </div>
</template>

<script>
import { 
  getCateList, 
  addCate,
  getCate,
  editCate,
  deleteCate
  } from "@/network/resources.js";

import Breadcrumbs from "@/components/Breadcrumbs.vue";

export default {
  data() {
    return {
      breadCrumbsText:['商品管理', '商品分类'],
      search: "",
      tableData: [],
      totalpage:0,
      pageSizes:[10, 50, 100],
      queryData: {
        pagenum: 1,
        pagesize: 10
      },
      //分类层级文字
      levelText:[ ['一级', ''] , ['二级', 'success'], ['三级', 'warning']],
      dialogaddCateFormVisible:false, //新增分类表单显示
      PCateList:[], //1,2级分类列表
      selectCateIds:[], //选中的分类数组
      // Cascader 级联选择器 props配置项
      casCaderProps:{ 
        label:'cat_name',
        expandTrigger: 'hover', 
        value:'cat_id',
        children:'children',
        checkStrictly:true, //取消父子关联，可选子节点
      },

      thisForm:'addCateForm', //默认为添加分类窗口
      formTitle:{
        'addCateForm':'新增分类',
        'editCateForm':'编辑分类',
      },
      CateForm:{
        cat_pid : 0, //父级id ，0为默认 1级分类 
        cat_name:'',
        cat_level: 0 //分类层级	不能为空，0表示一级分类；1表示二级分类；2表示三级分类
      },  //form表单数据
      
      addCateFormLabelWidth: '80px',
      //新增分类表单验证规则
      addCateFormRules:{
        cat_name:[
            { required: true, message: '请输入分类名', trigger: 'blur' },
            { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
          ],
    
      }
    };
  },
  created() {
    this.getCateListData();
  },
  mounted() {
    
  },
  components:{
    Breadcrumbs
  },
  methods: {
    //设置表单初始值
    //在用ElementUI做动态表单时，数据的修改都是打开dialog（子组件）中进行操作的，
    //但是在修改数据时，正常来说可以直接调用 this.$refs[str].resetFields() 直接清空，
    //但是这里会出现一个问题: form表单的重置是以第一次打开的数据作为重置标准,如果先打开的是编辑,
    //那么重置之后以第一次更新的数据作为标准，即表单的数据为编辑时的数据; 
    setForm(){
      this.CateForm = {
          cat_pid : 0, //父级id ，0为默认 1级分类 
          cat_name:'',
          cat_level: 0 //分类层级	不能为空，0表示一级分类；1表示二级分类；2表示三级分类
      }
    },
    //获取分类列表
    async getCateListData() {
      const CateListData = await getCateList('categories',this.queryData);
      if (CateListData.meta.status == 200) {
        this.tableData = CateListData.data.result;
        this.totalpage = CateListData.data.total;
        this.queryData.pagenum = CateListData.data.pagenum;
      } else {
        this.$message.error(CateListData.meta.msg);
      }
    },
    //改变分页页面和数量
    handleSizeChange(val) {
        this.queryData.pagesize = val;
        this.getCateListData();
      },
    handleCurrentChange(val) {
        this.queryData.pagenum = val;
        this.getCateListData();
    },
    //打开添加分类窗口
    addCate(){
      this.setForm(); //解决重置之后以第一次更新的数据作为标准，即表单的数据为编辑时的数据
      this.selectCateIds = [];
      this.thisForm = 'addCateForm';
      this.getPCateListData();
    },
    //获取1,2父级分类列表数据
    async getPCateListData(){
      const res = await getCateList('categories',{ type: 2 });
      if( res.meta.status == 200){
          this.PCateList = res.data;
          this.dialogaddCateFormVisible = true;
      }else{
          this.$message.error(login_res.meta.msg);
      }
    },  
    //切换分类完成回调, value为选中的值
    handleCateChange(value){
      //长度大于0说明选中了值
      if(this.selectCateIds.length > 0){
           //父级id ，0为默认1级分类 
          this.CateForm.cat_pid = this.selectCateIds[this.selectCateIds.length -1 ];
          //0表示一级分类；1表示二级分类；2表示三级分类
          this.CateForm.cat_level = this.selectCateIds.length;
      }else{
          this.CateForm.cat_pid = 0;
          this.CateForm.cat_level = 0;
      }
    },

    //打开编辑分类窗口
    async editCate(row){
      this.selectCateIds = [];
      const res = await getCate(`/categories/${row.cat_id}`);
      if( res.meta.status == 200){
          this.CateForm = res.data;
          //获取1,2父级分类列表数据
          await this.getPCateListData();
           if(res.data.cat_level > 0){
             this.getPcateIds(this.PCateList, res.data.cat_pid, this.selectCateIds);
          }
          this.thisForm = 'editCateForm';
          this.dialogaddCateFormVisible = true;
      }else{
          this.$message.error(res.meta.msg);
      }
    },
    //传入子级cat_id获取父级cat_ids
    getPcateIds(data, cat_pid ,arr) {
      if(cat_pid > 0){
          data.forEach(itemx => {
            if(cat_pid == itemx.cat_id){
              return arr.push(itemx.cat_id)
            }
            if(itemx.children){
              itemx.children.forEach(itemy => {
                  if(cat_pid == itemy.cat_id){
                    return arr.push(itemx.cat_id, itemy.cat_id)
                  }  
              });
            }
          });
      }
    },

    isAddForm(){
     return this.thisForm === 'addCateForm' ? true : false ;
    },
    //关闭添加/编辑分类窗口
    FormClose(){
      this.dialogaddCateFormVisible = false;
      //重置表单
      this.$refs.CateForm.resetFields();
    },
  
    //提交分类窗口
    CateFormConfirm(){
      this.$refs.CateForm.validate( async(valid) => {
          //新增分类表单提交
          if (valid && this.isAddForm()) {
            const res = await addCate('categories',this.CateForm);
            if( res.meta.status == 201){
                this.$message.success({
                    message: res.meta.msg,
                    type: 'success'
                });
              this.getCateListData();
              this.FormClose(); //关闭并重置表单
            }else{
              this.$message.error(res.meta.msg);
            }
            //编辑分类表单提交
          } else if(valid && !this.isAddForm()) {
            const res = await editCate(`categories/${this.CateForm.cat_id}`, { cat_name: this.CateForm.cat_name});
            if( res.meta.status == 200){
                this.$message.success({
                    message: res.meta.msg,
                    type: 'success'
                });
              this.getCateListData();
              this.FormClose(); //关闭并重置表单
            }else{
              this.$message.error(res.meta.msg);
            }
          }else{
            return false;
          }
        });
    },
    //删除分类
     deleteCate(row){
      this.$confirm('确认删除该分类吗?', '删除分类', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        }).then( async () => {
            const res = await deleteCate(`categories/${row.cat_id}`,);
            if( res.meta.status == 200){
                this.$message.success({
                    message: res.meta.msg,
                    type: 'success'
                });
              this.getCateListData();
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

.el-icon-success{
  color: #5cb6ff;
}

.el-cascader{
  width: 100%;
}

</style>


