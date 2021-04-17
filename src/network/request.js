import axios from 'axios'
import {Message,Loading} from 'element-ui';
import {throwError} from '@/network/throwError';

let loading

function startLoading() {
    loading = Loading.service({
        lock: true,
        text: '加载中....',
        background: 'rgba(0, 0, 0, 0.7)'
    })
}

function endLoading() {
    loading.close()
}

export function request(config){
    const instance = axios.create({
        baseURL: 'http://127.0.0.1:8888/api/private/v1/',
        timeout: 5000
    })

  // 2.axios的拦截器
  // 2.1.请求拦截的作用
  instance.interceptors.request.use(config => {
    // 2.1.1 任何请求都会经过这一步 在发送请求之前做些什么
    startLoading()
    const token = window.sessionStorage.getItem('token');
    if(token){
      config.headers.Authorization = window.sessionStorage.getItem('token');
    }
    // 2.1.2 这里一定要return 否则配置不成功
    return config
  }, err => {
    // 2.1.3 对请求错误做点什么
    endLoading()
    Message.error('请求超时');  
    return Promise.resolve(err);
  })

  // 2.2.响应拦截
  instance.interceptors.response.use(res => {
    endLoading()
    // 2.2.1 在接收响应做些什么
    return res.data

    // 根据返回的code值来做不同的处理(和后端约定)
    // switch (res.data.code) {
    //   case 401:
    //       ElMessage.error(res.data.message);
    //       break;
    //   // 错误
    //   case 500:            
    //       ElMessage.error("联系管理员");
    //       break;
    //   default:
    //       return res.data;
    // }


  }, err => {
    // 2.2.2 对响应错误做点什么
    // 返回状态码不为200时候的错误处理
    endLoading()    
    Message.error('连接错误，请重试')
    return Promise.resolve(err);
  })

  // 3.发送真正的网络请求
  return instance(config)
}



// get 请求
export const get = (url, params = {}) => {
  // let accessToken = getStore('accessToken');
  return request({
      method: 'get',
      url: url,
      params: params
  });
};

// post请求
export const post = (url, params) => {
  // let accessToken = getStore("accessToken");
  return request({
      method: 'post',
      url: url,
      data: params
  });
};

export const put = (url, params) => {
    // let accessToken = getStore("accessToken");
    return request({
        method: 'put',
        url: url,
        data: params,
        // transformRequest: [function (data) {
        //     let ret = '';
        //     for (let it in data) {
        //         ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&';
        //     }
        //     ret = ret.substring(0, ret.length - 1);
        //     return ret;
        // }],
        // headers: {
        //     'Content-Type': 'application/x-www-form-urlencoded',
        //     'accessToken': accessToken
        // }
    });
};

// export const deleteRequest = (url, params) => {
//     let accessToken = getStore('accessToken');
//     return request({
//         method: 'delete',
//         url: `${API_ROOT}${base}${url}`,
//         params: params,
//         headers: {
//            'accessToken': accessToken
//         }
//     });
// };

// /**
//  * 无需token验证的请求 避免旧token过期导致请求失败
//  * @param {*} url 
//  * @param {*} params 
//  */
// export const getRequestWithNoToken = (url, params) => {
//     return request({
//         method: 'get',
//         url: `${API_ROOT}${base}${url}`,
//         params: params
//     });
// };
