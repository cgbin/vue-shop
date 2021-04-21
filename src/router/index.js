import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const Login = () => import('@/components/Login.vue')
//首页
const Home = () => import('@/components/Home.vue')
//欢迎页面
const Welcome = () => import('@/components/Welcome.vue')
// 用户列表
const Users = () => import('@/views/users/Users.vue')
//权限列表
const Rights = () => import('@/views/users/Rights.vue')
//角色列表
const Roles = () => import('@/views/users/Roles.vue')
//商品分类列表
const Category = () => import('@/views/goods/Category.vue')

const routes = [
  {
    path:'/',
    redirect:'/login'
  },
  {
    path:'/login',
    name:'Login',
    component:Login
  },
  {
    path:'/home',
    name:'Home',
    component:Home,
    redirect:'/welcome',
    children:[
      {path:'/welcome', name:'Welcome', component:Welcome},
      {path:'/users', name:'Users', component:Users},
      {path:'/rights', name:'Rights', component:Rights},
      {path:'/roles', name:'Roles', component:Roles},
      {path:'/categories', name:'Category', component:Category},
    ]
  }
]


const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = window.sessionStorage.getItem('token');
  if (to.name !== 'Login' && !isAuthenticated) {
    next({ name: 'Login' })
  }else{
    next()
  } 
})

export default router
