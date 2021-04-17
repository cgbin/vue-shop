import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const Login = () => import('@/components/Login.vue')
const Home = () => import('@/components/Home.vue')
const Welcome = () => import('@/components/Welcome.vue')
const Users = () => import('@/views/users/Users.vue')

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
      {path:'/users', name:'Users', component:Users}
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
