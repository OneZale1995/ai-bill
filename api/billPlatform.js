import request from './request'

const module = '/billPlatform'

export const billPlatformService = {
  // 获取分页列表
  async getPage(params) {
    return request({
      url: module + '/list',
      method: 'POST',
      data: params
    })
  },

  // 创建
  async save(data) {
    return request({
      url: module + '/save',
      method: 'POST',
      data
    })
  },

  // 更新
  async update(data) {
    return request({
      url:  module + `/update`,
      method: 'POST',
      data
    })
  },

  // 删除
  async delete(id) {
    return request({
      url: module + `/delete/${id}`,
      method: 'POST'
    })
  }
} 