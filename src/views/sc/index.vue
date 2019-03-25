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
      var req = store.get('tSNE' + this.$store.state.projectId);
      req.onsuccess = (e) => {
        var degData = e.target.result;
        if (!degData) {
          console.log('indexedDB 无该数据！');
          this.axios.get('/singel_cell/server/get_tsne_score?username='+ this.$store.state.username +'&p=' + this.$store.state.projectId).then((res) => {
            if (res.data.message_type === 'success') {
              // deg 列表存到 indexedDB 里
              let temp = {
                name: 'tSNE' + this.$store.state.projectId,
                value: res.data,
              }
              // 开启一个事务
              var tx = this.db.transaction(['degTable'], 'readwrite');
              var store = tx.objectStore('degTable');
              var req = store.get('tSNE' + this.$store.state.projectId);
              req.onsuccess = (e) => {
                store.add(temp);
              }
            } else {
              this.$message.error(res.data.message);
            }
          })
        } else {
          console.log('indexedDB 有该数据！');
        }
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
