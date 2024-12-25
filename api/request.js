// utils/request.js
import { ref } from 'vue';
import baseConfig from '@/config/index';

const BASE_URL = baseConfig.baseUrl; // 替换为你的接口基础路径

const request = (options) => {
  const loading = ref(false); // 可选：用于控制加载状态

  return new Promise((resolve, reject) => {
    loading.value = true;

    // 请求拦截
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = uni.getStorageSync('token');
    if (token) {
      headers['Authorization'] = `${token}`;
    }

    uni.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: headers,
      timeout: options.timeout || 60000, // 超时时间
      success: (res) => {
        loading.value = false;

        // 响应拦截
        if (res.statusCode === 200) {
          if (res.data.code === 200) {
            resolve(res.data);
          } else {
            if (res.data.code === 401) {
              console.log('token过期')
              uni.removeStorageSync('token');
              uni.switchTab({
                url: '/pages/index/index'
              })
            }
            uni.showToast({ title: res.data.msg || '请求失败', icon: 'none' });
            reject(res.data);
          }
        } else {
          uni.showToast({ title: `HTTP错误: ${res.statusCode}`, icon: 'none' });
          reject(res);
        }
      },
      fail: (err) => {
        loading.value = false;
        uni.showToast({ title: '网络错误，请稍后重试', icon: 'none' });
        reject(err);
      },
    });
  });
};

export default request
