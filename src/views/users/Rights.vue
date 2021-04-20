<template>
  <div class="rights_container">
    <!-- 面包屑导航区域 -->
    <breadcrumbs :textList="breadCrumbsText"></breadcrumbs>
    <!--  卡片内容区域 -->
    <el-card class="box-card">
      <template>
        <el-table :data="tableData" border stripe style="width: 100%">
          <el-table-column prop="id" label="ID" width="100"> </el-table-column>
          <el-table-column prop="authName" label="权限说明"> </el-table-column>
          <el-table-column prop="path" label="对应访问路径"> </el-table-column>
          <el-table-column prop="level" label="权限层级">
             <template v-slot="scope">
                <el-tag :type="levelText[scope.row.level][1]">{{levelText[scope.row.level][0]}}</el-tag>
            </template> 
          </el-table-column>
        </el-table>
      </template>
    </el-card>

  </div>
</template>

<script>
import { 
  getRightsList, 
  } from "@/network/resources.js";

import Breadcrumbs from "@/components/Breadcrumbs.vue";

export default {
  data() {
    return {
      breadCrumbsText:['权限管理', '权限列表'],
      levelText:[ ['一级权限', ''] , ['二级权限', 'success'], ['三级权限', 'warning']],
      search: "",
      tableData: [],
    };
  },
  created() {
    this.getRightsListData();
  },
  mounted() {
    
  },
  components:{
    Breadcrumbs
  },
  methods: {
    //获取用户列表
    async getRightsListData() {
      const rightsListData = await getRightsList('rights/list');
      if (rightsListData.meta.status == 200) {
        this.tableData = rightsListData.data;
      } else {
        this.$message.error(rightsListData.meta.msg);
      }
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


