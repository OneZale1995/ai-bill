// 封装请求方法
const request = async (options) => {
  const token = uni.getStorageSync('token')
  
  const defaultOptions = {
    header: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  }

  try {
    const res = await uni.request({
      ...defaultOptions,
      ...options
    })
    
    if (res.statusCode === 401) {
      // token 失效，需要重新登录
      uni.removeStorageSync('token')
      throw new Error('需要重新登录')
    }
    
    return res.data
  } catch (error) {
    uni.showToast({
      title: error.message || '请求失败',
      icon: 'none'
    })
    throw error
  }
}

export default request 