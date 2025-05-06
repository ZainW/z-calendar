import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../pages/HomePage.vue'), name: 'Home' },
  { path: '/data-grid', component: () => import('../examples/DataGridExample.vue'), name: 'DataGrid' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkActiveClass: 'active-link',
  linkExactActiveClass: 'exact-active-link',
})

export default router
