let router = [
  {
    path: '/admin',
    name: 'admin',
    component: resolve => require(['@/views/admin/project_list'], resolve),
    meta: {
      role: 'admin'
    }
  },
  {
    path: '/admin_create_experiment',
    name: 'admin_create_experiment',
    component: resolve => require(['@/views/admin/admin_create_experiment'], resolve),
    meta: {
      role: 'admin'
    },
  }
]
export default router
