<template>
<el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-for="(item, key) in textList" :key="key">{{item}}</el-breadcrumb-item>
    </el-breadcrumb>
</template>

<script>
  export default {
  name: "Breadcrumbs",
    props: {
      textList: {
        type: Array,
        default() {
          return [];
        },
      },
    },
      
  }
</script>

<style lang="less" scoped>

</style>


