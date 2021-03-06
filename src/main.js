// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import vueAxios from 'vue-axios'
import store from './store/store'
import 'datatables/media/css/jquery.dataTables.min.css'
import 'datatables/media/js/jquery.dataTables.min.js'
import Highcharts from 'highcharts/highstock';
import HighchartsMore from 'highcharts/highcharts-more';
import Highmaps from 'highcharts/modules/map';
import 'datatables.net-bs';
import jsZip from 'jszip';
import 'datatables.net-buttons-bs';
import 'datatables.net-buttons/js/buttons.colVis.min';
import 'datatables.net-buttons/js/dataTables.buttons.min';
import 'datatables.net-buttons/js/buttons.flash.min';
import 'datatables.net-buttons/js/buttons.html5.min';
window.JSZip = jsZip;

// 国际化
import VueI18n from 'vue-i18n'
Vue.use(VueI18n)
const i18n = new VueI18n({
  // locale: LangStorage.getLang('zh'),  // 语言标识，后面会用做切换和将用户习惯存储到本地浏览器
  locale: localStorage.language?localStorage.language:'zh', // 语言标识
  messages: {
    'zh': require('./common/lang/zh'),
    'en': require('./common/lang/en')
  }
})

import {
  Dialog,
  Menu,
  Submenu,
  MenuItem,
  MenuItemGroup,
  Input,
  InputNumber,
  Radio,
  Switch,
  Select,
  Option,
  OptionGroup,
  Button,
  Tooltip,
  Breadcrumb,
  BreadcrumbItem,
  Form,
  FormItem,
  Tabs,
  TabPane,
  Tag,
  Alert,
  Icon,
  Progress,
  Card,
  Loading,
  MessageBox,
  Message,
  Slider,
  Row,
  Col,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  Upload,
  Container,
  Header,
  Aside,
  Main,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DatePicker,
  Carousel,
  CarouselItem,
  RadioGroup,
  RadioButton,
} from 'element-ui';

HighchartsMore(Highcharts)
Highmaps(Highcharts);
Vue.use(Dialog);
Vue.use(Menu);
Vue.use(Submenu);
Vue.use(MenuItem);
Vue.use(MenuItemGroup);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(Radio);
Vue.use(Switch);
Vue.use(Select);
Vue.use(Option);
Vue.use(OptionGroup);
Vue.use(Button);
Vue.use(Tooltip);
Vue.use(Breadcrumb);
Vue.use(BreadcrumbItem);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Tabs);
Vue.use(Tag);
Vue.use(Alert);
Vue.use(Icon);
Vue.use(Progress);
Vue.use(Card);
Vue.use(TabPane);
Vue.use(Slider);
Vue.use(Row);
Vue.use(Col);
Vue.use(Checkbox);
Vue.use(CheckboxButton);
Vue.use(CheckboxGroup);
Vue.use(Upload);
Vue.use(Container);
Vue.use(Header);
Vue.use(Aside);
Vue.use(Main);
Vue.use(Dropdown);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);
Vue.use(Loading.directive);
Vue.use(DatePicker);
Vue.use(Carousel);
Vue.use(CarouselItem);
Vue.use(RadioGroup);
Vue.use(RadioButton);

Vue.prototype.$loading = Loading.service;
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$message = Message;

//  每一次登录进来 都清一下 indexedDB 的 degTable 表
// let db
// var request = indexedDB.open("deg")
// request.onerror =  (e) => {}
// request.onupgradeneeded = (e) => {
//   db = e.target.result
//   var objectStore = db.createObjectStore("degTable", {keyPath:'name', autoIncrement:true})
// }
// request.onsuccess = (e) => {
//   console.log("success!");
//   db = e.target.result
//   var tx = db.transaction(["degTable"],"readwrite")
//   var store = tx.objectStore("degTable")
//   store.clear()
// }
// request.onerror = (e) => {
//   console.log("error!");
// }

if (localStorage.username) {
  store.state.username = localStorage.username
}
if (localStorage.projectId) {
  store.state.projectId = localStorage.projectId
}
if (localStorage.projectName) {
  store.state.projectName = localStorage.projectName
}
// 侧边栏li的点击颜色
if (localStorage.leftMenuIndex) {
  store.state.leftMenuIndex = localStorage.leftMenuIndex
}
// 侧边栏动态内容
if (localStorage.info) {
  store.state.info = JSON.parse(localStorage.info)
}
// heatmap,ppi, geneList 输入
if (localStorage.geneList) {
  store.state.geneList = JSON.parse(localStorage.geneList)
}
// heatmap json
if (localStorage.heatmapJson) {
  store.state.heatmapJson = JSON.parse(localStorage.heatmapJson)
}
// ppi json
if (localStorage.ppiJson) {
  store.state.ppiJson = JSON.parse(localStorage.ppiJson)
}
if (localStorage._case) {
  store.state._case = localStorage._case
}
if (localStorage._control) {
  store.state._control = localStorage._control
}
if (localStorage.species) {
  store.state.species = localStorage.species
}
if (localStorage.degGeneSum) {
  store.state.degGeneSum = localStorage.degGeneSum
}
if (localStorage.degFilterArgs) {
  store.state.degFilterArgs = JSON.parse(localStorage.degFilterArgs)
}
if (localStorage.menuShow) {
  store.state.menuShow = JSON.parse(localStorage.menuShow)
}
if (localStorage.appmenuShow) {
  store.state.appmenuShow = JSON.parse(localStorage.appmenuShow)
}
if (localStorage.projectType) {
  store.state.projectType = localStorage.projectType
}

axios.get('/getUser').then((res) => {
  store.commit('setusername', res.data)
})

Vue.use(vueAxios, axios)

Vue.config.productionTip = false

// 路由权限判断
router.beforeEach((to, from, next) => {
  if (to.path === '/') {
    next()
  }
  if (to.meta.role) { // 需要权限的页面
    if (to.meta.role === store.state.role) {
      next()
    } else {  // 权限不够的页面
      Message.error('抱歉，您将要访问的页面权限不够！')
      next({name: from.name})
    }
  } else {  // 不需要权限的页面
    next()
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  components: { App },
  template: '<App/>'
})
