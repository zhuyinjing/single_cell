<template>
  <el-container style="height:calc(100% - 62px);margin-top:2px">
    <el-aside v-show="$store.state.menuShow" width="350px;" style="width:300px;height:100%;border-right:1px solid #e6e6e6">
      <leftMenu style="margin-top:5px"></leftMenu>
    </el-aside>
    <el-main>
      <imgMenuShowComp></imgMenuShowComp>

      <degComp></degComp>

      <ppiComp></ppiComp>

    </el-main>
  </el-container>

</template>

<script>
import leftMenu from './leftMenu.vue'
import degComp from './degComp.vue'
import imgMenuShowComp from './imgMenuShowComp.vue'
import ppiComp from './ppiComp.vue'

export default {
  data () {
    return {
    }
  },
  components: {
    leftMenu,
    degComp,
    imgMenuShowComp,
    ppiComp
  },
  mounted () {
  },
  methods: {
  }
}
</script>
<style scoped="true">
</style>
