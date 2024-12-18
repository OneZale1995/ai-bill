import request from './request'
import { API } from '@/config/index'

// 登录服务
export const authService = {
  // 微信登录
  async wxLogin(code) {
    return request({
      url: API.baseUrl + '/accountUser/wechatMini/login?code=' + code,
      method: 'POST',
      data: { code }
    })
  },
  
  // 检查登录状态
  checkLoginStatus() {
    return !!uni.getStorageSync('token')
  },
  
  // 保存token
  saveToken(token) {
    uni.setStorageSync('token', token)
  },
  
  // 清除token
  clearToken() {
    uni.removeStorageSync('token')
  }
}

// 登录逻辑处理
export const handleWxLogin = async () => {
  uni.showLoading({ title: '登录中...' })
  
  try {
    const loginRes = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      })
    })

    if (loginRes.code) {
      const res = await authService.wxLogin(loginRes.code)
      if (res.data.tokenValue) {
        authService.saveToken(res.data.tokenValue)
        uni.showToast({ title: '登录成功' })
        return true
      }
    }
    throw new Error('登录失败')
  } catch (error) {
    console.log(error)
    uni.showToast({
      title: error.message || '登录失败',
      icon: 'none'
    })
    return false
  } finally {
    uni.hideLoading()
  }
} 