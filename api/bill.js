import request from './request'

const module = '/bill'

export const billService = {
  // 获取账单列表
  async getBills(params) {
    return request({
      url: module + '/list',
      method: 'POST',
      data: params
    })
  },

  // 创建账单
  async createBill(data) {
    return request({
      url: module + '/addBill',
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
      url: module + `/deleteUserBill/${id}`,
      method: 'POST'
    })
  },

  // 更改默认状态
  async updateDefault(id) {
    return request({
      url: module+`/updateDefault/${id}`,
      method: 'POST'
    })
  },
} 