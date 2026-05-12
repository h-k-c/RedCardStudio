import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'converter', component: () => import('@/views/ConverterView.vue') },
    { path: '/render', name: 'render', component: () => import('@/views/RenderView.vue') }
  ]
})

export default router
