import Vue from 'vue'
import Router from 'vue-router'
import singleCellRouter from './single_cell_router'
import adminRouter from './admin_router'
// import bulkRNARouter from './bulkRNA_router'

Vue.use(Router)

export default new Router({
  routes: [
    // {
    //   path: '*',
    //   name: 'home',
    //   component: home
    // },
    {
      path: '/',
      name: 'home',
      component: resolve => require(['@/components/home'], resolve)
    },
    {
      path: '/project_list',
      name: 'project_list',
      component: resolve => require(['@/components/project_list'], resolve)
    },
    {
      path: '/run_task',
      name: 'run_task',
      component: resolve => require(['@/components/run_task'], resolve)
    },
    // ...bulkRNARouter,
    ...singleCellRouter,
    ...adminRouter
  ]
})
