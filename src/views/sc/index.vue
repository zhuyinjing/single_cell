<template>
<el-container v-loading="loading" element-loading-text="请稍等，数据正在加载中..." element-loading-spinner="el-icon-loading" style="height:calc(100% - 62px);margin-top:2px">
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
      loading: false,
    }
  },
  components: {
    leftMenu,
    imgMenuShowComp
  },
  mounted() {
    let dbName = "deg"
    var request = indexedDB.open(dbName)
    request.onupgradeneeded = (e) => {
      this.db = e.target.result
      var objectStore = this.db.createObjectStore("degTable", {
        keyPath: 'name',
        autoIncrement: true
      })
    }
    request.onsuccess = (e) => {
      console.log("success!");
      this.db = e.target.result
      var tx = this.db.transaction(['degTable'], 'readwrite');
      var store = tx.objectStore('degTable');
      var req = store.get('commonInfo' + this.$store.state.projectId);
      req.onsuccess = (e) => {
        var degData = e.target.result;
        if (!degData) {  // 如果数据库里没有该数据
          this.loading = true
          this.axios.get('/singel_cell/server/get_common_info?username='+ this.$store.state.username +'&p=' + this.$store.state.projectId).then((res) => {
            if (res.data.message_type === 'success') {
              // common 信息存到 indexedDB 里
              let temp = {
                name: 'commonInfo' + this.$store.state.projectId,
                value: res.data,
              }
              // 开启一个事务
              var tx = this.db.transaction(['degTable'], 'readwrite');
              var store = tx.objectStore('degTable');
              var req = store.get('commonInfo' + this.$store.state.projectId);
              req.onsuccess = (e) => {
                store.add(temp);
                this.$store.commit('setcommonInfo', res.data)
              }
            }
          })
        } else {
          this.$store.commit('setcommonInfo', degData.value)
        }
        this.loading = false
      }
    }
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
