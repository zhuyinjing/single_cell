<template>
<div>
  <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
    <el-menu-item index="home">{{$t('navbar.home')}}</el-menu-item>
    <el-menu-item index="project" v-if="$store.state.role !== 'admin'">{{$t('navbar.project_list')}}</el-menu-item>
    <el-menu-item index="admin_project_list" v-if="$store.state.role === 'admin'">{{$t('navbar.project_list')}}</el-menu-item>
    <!-- <el-menu-item index="app_heatmap_input">{{$t('navbar.app_tool')}}</el-menu-item> -->
  </el-menu>
  <div class="userDiv" v-show="$store.state.username">
    <!-- <el-dropdown trigger="click" @command="changeLocale">
      <span class="el-dropdown-link">
        {{language}}<i class="el-icon-arrow-down el-icon--right"></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="中文">中文</el-dropdown-item>
        <el-dropdown-item command="English">English</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>&nbsp;&nbsp; -->
    <span class="nameStyle">{{$store.state.username}}</span>
    <el-button type="text" @click="logout">{{$t('navbar.logout')}}</el-button>
  </div>

</div>
</template>

<script>
import bus from '../bus.js'
export default {
  data() {
    return {
      activeIndex: '',
      language: '中文',
    }
  },
  components: {},
  mounted() {
    if (localStorage.language) {
      this.language = localStorage.language === 'zh'? '中文' : 'English'
    }
    if (!localStorage.navbarItem) {
      this.activeIndex = 'home'
    } else {
      this.activeIndex = localStorage.navbarItem
    }
    bus.$on("handleSelect", (key) => {
      this.handleSelect(key)
    })
  },
  methods: {
    changeLocale(command) {
      this.language = command
      if (command === '中文') {
        localStorage.setItem('language', 'zh')
        this.$i18n.locale = 'zh'
      } else {
        localStorage.setItem('language', 'en')
        this.$i18n.locale = 'en'
      }
    },
    handleSelect(key, keyPath) {
      let self = this
      switch (key) {
        case 'home':
          this.activeIndex = 'home'
          localStorage.setItem('navbarItem', 'home')
          this.$router.push({
            'path': '/'
          })
          break
        case 'project':
          localStorage.clear()
          this.activeIndex = 'project'
          localStorage.setItem('navbarItem', 'project')
          this.$router.push({
            'name': 'project_list'
          })
          break
        case 'app_heatmap_input':
          this.activeIndex = 'app_heatmap_input'
          localStorage.setItem('navbarItem', 'app_heatmap_input')
          this.$router.push({
            'name': 'app_heatmap_input'
          })
          break
        case 'admin_project_list':
          this.activeIndex = 'admin_project_list'
          localStorage.setItem('navbarItem', 'admin_project_list')
          this.$router.push({
            'path': '/admin'
          })
          break
      }
    },
    logout() {
      this.$confirm('确认退出该账号吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        localStorage.removeItem('navbarItem')
        window.location.href = 'https://colorseq.com/logout'
      }).catch(() => {});
    },
  }
}
</script>

<style scoped="true">
.userDiv {
  position: absolute;
  top: 18px;
  right: 50px;
}

.nameStyle {
  margin-right: 30px;
  color: #b5a199;
}

.text-center {
  text-align: center;
}
.el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
.el-icon-arrow-down {
  font-size: 12px;
}
</style>
