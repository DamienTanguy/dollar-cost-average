import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import FormPage from '../views/FormPage.vue'
import TradePage from '../views/TradePage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/form',
    name: 'FormPage',
    component: FormPage
  },
  {
    path: '/trade',
    name: 'TradePage',
    component: TradePage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
