import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/game'
  },
  {
    path: '/game',
    name: 'game',
    component: () => import(/* webpackChunkName: "game" */ '../views/game')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
