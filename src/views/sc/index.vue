<template>
<el-container style="height:calc(100% - 62px);margin-top:2px">
  <el-aside v-show="$store.state.menuShow" width="350px;" style="width:300px;height:100%;border-right:1px solid #e6e6e6">
    <leftMenu style="margin-top:5px"></leftMenu>
  </el-aside>
  <el-main>
    <imgMenuShowComp></imgMenuShowComp>

    <router-view></router-view>
  </el-main>
</el-container>
</template>

<script>
import leftMenu from '@/components/sc/sidebar.vue'
import imgMenuShowComp from '@/components/imgMenuShowComp.vue'

export default {
  data() {
    return {
    }
  },
  components: {
    leftMenu,
    imgMenuShowComp
  },
  mounted() {
  },
  methods: {

  }
}
</script>

<style scoped="true">
.cursor-pointer {
  cursor: pointer;
}
</style>
