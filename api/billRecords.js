import request from './request'

const moduleName = '/billRecords';

export const billRecordsService = {
  async getBillRecordsPage(params) {
    return request({
      url: moduleName + '/getBillRecordsPage',
      method: 'POST',
      data: params
    })
  }
}

