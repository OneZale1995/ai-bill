import request from './request'

export const billService = {
  // 获取账单列表
  async getBills(params) {
    return request({
      url: '/bill/list',
      method: 'POST',
      data: params
    })
  },
  
  // 创建账单
  async createBill(data) {
    return request({
      url:'/bill/create',
      method: 'POST',
      data
    })
  },
  
  // 更新账单
  async updateBill(id, data) {
    return request({
      url: `/bill/${id}`,
      method: 'POST',
      data
    })
  },
  
  // 删除账单
  async deleteBill(id) {
    return request({
      url: `/bill/${id}`,
      method: 'POST'
    })
  }
} 