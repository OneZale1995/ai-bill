import request from './request'
import { API } from '@/config/index'

export const billService = {
  // 获取账单列表
  async getBills(params) {
    return request({
      url: API + ''
      method: 'POST',
      data: params
    })
  },
  
  // 创建账单
  async createBill(data) {
    return request({
      url: API.bills.create,
      method: 'POST',
      data
    })
  },
  
  // 更新账单
  async updateBill(id, data) {
    return request({
      url: `${API.bills.update}/${id}`,
      method: 'POST',
      data
    })
  },
  
  // 删除账单
  async deleteBill(id) {
    return request({
      url: `${API.bills.delete}/${id}`,
      method: 'POST'
    })
  }
} 