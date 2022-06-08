import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/HomeView.vue'
import Welcom from '../components/welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Right.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/home',
    name: 'home',
    component: Home,
    redirect: '/welcom',
    children: [
      {
        path: '/welcom',
        name: 'welcom',
        component: Welcom
      },
      {
        path: '/users',
        name: 'users',
        component: Users
      },
      {
        path: '/rights',
        name: 'rights',
        component: Rights
      },
      {
        path: '/roles',
        name: 'roles',
        component: Roles
      },
      {
        path: '/categories',
        name: 'categories',
        component: Cate
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 路由守卫
// to要去访问的页面，from现在所在页面， next下一个要访问哪个页面
router.beforeEach((to, from, next) => {
  // 如果用户访问登录页，直接放行
  if (to.path === '/login') return next()
  // 从sessionStorage中获取到保存的token值
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token，强制跳转到登录页
  if (!tokenStr) return next('/login')
  next()
})

export default router
