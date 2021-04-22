import {getRequest,postRequest,putRequest, deleteRequest} from '@/network/request.js'

//登录验证
export function getLoginStatus(LoginForm){
    return postRequest('login',LoginForm)
}

//请求左侧菜单
export function  getLeftMenu(){
    return getRequest('menus')
}

//请求用户列表
export function  getUserList(params = {}){
    return getRequest('users',params)
}

//修改用户状态
export function  changeUserStatus(url,data = {}){
    return putRequest(url,data)
}

//新增用户
export function addUser(data = {}){
    return postRequest('users',data)
}

//查询用户
export function getUser(url,params = {}){
    return getRequest(url,params)
}

//编辑用户
export function  editUser(url,data = {}){
    return putRequest(url,data)
}

//删除用户
export function  deleteUser(url,params = {}){
    return deleteRequest(url,params)
}

//获取权限列表
export function  getRightsList(url,params = {}){
    return getRequest(url,params)
}

//获取角色列表
export function  getRolesList(){
    return getRequest('roles')
}

//获取单个角色
export function  getRole(url,params = {}){
    return getRequest(url,params)
}

//删除角色权限
export function  deleteRoleAuth(url,params = {}){
    return deleteRequest(url,params)
}

//为角色分配权限
export function  setRoleAuth(url,params = {}){
    return postRequest(url,params)
}


//获取商品分类列表
export function  getCateList(url,params = {}){
    return getRequest(url,params)
}

//新增商品分类
export function  addCate(url,params = {}){
    return postRequest(url,params)
}

//获取单个分类
export function  getCate(url,params = {}){
    return getRequest(url,params)
}


//编辑分类
export function  editCate(url,data = {}){
    return putRequest(url,data)
}

//删除分类
export function  deleteCate(url,data = {}){
    return deleteRequest(url,data)
}