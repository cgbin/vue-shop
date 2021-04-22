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

      <!-- 表格数据 -->
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

        <!-- 分页 -->
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
    <cate-dialog-form
        ref="CateDialogForm"
        :show-dialog-form="showCateDialogForm"
        :dialog-title="dialogTitle"
        :form-data="CateForm"
        @closeDialogForm="closeCateDialogForm"
    ></cate-dialog-form>

  
  </div>
</template>

<script>
import { 
  getCateList, 
  getCate,
  deleteCate
} from "@/network/resources.js";

import Breadcrumbs from "@/components/Breadcrumbs.vue";
import CateDialogForm from "@/components/dialogform/CateDialogForm.vue";

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
      dialogTitle:'添加分类',
      showCateDialogForm :false, //新增-编辑分类表单显示
      CateForm:{
        cat_pid : 0, //父级id ，0为默认 1级分类 
        cat_name:'',
        cat_level: 0 //分类层级	不能为空，0表示一级分类；1表示二级分类；2表示三级分类
      },  //form表单数据
    };
  },
  created() {
    this.getCateListData();
  },
  mounted() {
    
  },
  components:{
    Breadcrumbs,
    CateDialogForm
  },
  methods: {
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
    async addCate(){
      this.$refs["CateDialogForm"].selectCateIds = [];
      this.CateForm = {
        cat_pid : 0, //父级id ，0为默认 1级分类 
        cat_name:'',
        cat_level: 0 //分类层级	不能为空，0表示一级分类；1表示二级分类；2表示三级分类
      }
      await this.getPCateListData();
      this.dialogTitle = '添加分类';
      this.showCateDialogForm = true;
      this.$nextTick(() => {
        this.$refs["CateDialogForm"].showDialogForm = true;
      });
    },

    //打开编辑分类窗口
    async editCate(row){
      this.$refs["CateDialogForm"].selectCateIds = [];
      const res = await getCate(`/categories/${row.cat_id}`);
      if( res.meta.status == 200){
          this.CateForm = res.data;
          //获取1,2父级分类列表数据
          await this.getPCateListData();
           if(res.data.cat_level > 0){
             
            await this.getPcateIds(
                this.$refs["CateDialogForm"].PCateList, 
                res.data.cat_pid, 
                this.$refs["CateDialogForm"].selectCateIds
              );
          }
          this.dialogTitle = '编辑分类';
          this.showCateDialogForm = true;
          this.$nextTick(() => {
            this.$refs["CateDialogForm"].showDialogForm = true;
          });
      }else{
          this.$message.error(res.meta.msg);
      }
    },

    //获取1,2父级分类列表数据
    async getPCateListData(){
      const res = await getCateList('categories',{ type: 2 });
      if( res.meta.status == 200){
          this.$refs["CateDialogForm"].PCateList = res.data;
      }else{
          this.$message.error(login_res.meta.msg);
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
    //关闭 添加/编辑分类窗口
    closeCateDialogForm(flag){
      if(flag){
        this.getCateListData();
      }
      this.showCateDialogForm = false;
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

</style>


