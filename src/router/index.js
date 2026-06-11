/**
 * 路由：/ 仪表盘，/builder/:id 编辑器
 * hash 模式：纯静态部署（任意静态托管 / file://）零配置
 */

import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardPage from '../pages/DashboardPage.vue'
import BuilderPage from '../pages/BuilderPage.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardPage },
    { path: '/builder/:id', name: 'builder', component: BuilderPage, props: true },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
