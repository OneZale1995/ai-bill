import request from './request'

const moduleName = '/billRecords';

export const billRecordsService = {
	async getBillRecordsPage(params) {
		return request({
			url: moduleName + '/getBillRecordsPage',
			method: 'POST',
			data: params
		})
	},
	// 添加记录
	async addBillRecord(params) {
		return request({
			url: moduleName + '/addBillRecord',
			method: 'POST',
			data: params
		})
	},

	// 添加记录
	async updateBillRecord(params) {
		return request({
			url: moduleName + '/updateBillRecord',
			method: 'POST',
			data: params
		})
	},
	// 删除记录
	async deleteBillRecord(id){
		return request({
			url: moduleName + '/deleteBillRecord/'+id,
			method: 'POST',
		})
	}

	
}

