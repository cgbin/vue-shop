import {get,post,put} from '@/network/request.js'

//登录验证
export function getLoginStatus(LoginForm){
    return post('login',LoginForm)
}

//请求左侧菜单
export function  getLeftMenu(){
    return get('menus')
}

//请求用户列表
export function  getUserList(params = {}){
    return get('users',params)
}

//修改用户状态
export function  changeUserStatus(url,data = {}){
    return put(url,data)
}

//新增用户
export function addUser(data = {}){
    return post('users',data)
}


