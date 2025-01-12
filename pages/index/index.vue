<template>
	<view class="container">
		<page-nav :title="currentAccount?.name || '账单'" />

		<!-- 月度统计 -->
		<view class="month-summary" v-if="!loading && !isEmpty" style="text-align: left;">
			<view class="balance">
				<text class="label">本月结余</text>
				<text class="amount" :class="{ 'negative': monthlyBalance < 0 }">¥{{ monthlyBalance }}</text>
			</view>
			<view class="details">
				<view class="income">
					<text class="label">本月收入</text>
					<text class="value">¥{{ monthlyIncome }}</text>
				</view>
				<view class="expense">
					<text class="label">本月支出</text>
					<text class="value">¥{{ monthlyExpense }}</text>
				</view>
			</view>
		</view>

		<!-- 账单列表 -->
		<view v-if="!loading && !isEmpty" class="bill-list">
			<view v-for="(group, date) in groupedBillsForPage" :key="date">
				<view class="date-header">
					<view class="date-info">
						<text class="date">{{ formatDate(date) }}</text>
						<text class="summary">收入 {{ getDayIncome(group) }} 支出 {{ getDayExpense(group) }}</text>
					</view>
				</view>

				<view class="bill-items">
					<view v-for="bill in group" :key="bill.id" class="bill-item" @click="openBillActions(bill)">
						<view class="bill-info">
							<category-icon :type="bill.type" :text="bill.categoryName" />
							<view class="bill-details">
								<view class="primary-info">
									<text class="category-name">{{ bill.categoryName || '未命名' }}</text>
									<text class="amount" :class="{ 'income': bill.type === 'income' }">
										{{ bill.type === 'income' ? '+' : '-' }}{{ bill.amount || 0 }}
									</text>
								</view>
								<view class="secondary-info">
									<view class="info-item">
										<text class="role-value">{{ bill.transactionDate }}</text>
									</view>
									<view v-if="bill.role" class="info-item">
										<text class="role-value">{{ bill.role }}</text>
									</view>
									<view v-if="bill.platform" class="info-item">
										<text class="platform-value">{{ bill.platform }}</text>
									</view>
									<view v-if="bill.remark" class="info-item">
										<text class="note-value">{{ bill.remark }}</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 加载中状态 -->
		<view v-else-if="loading" class="loading-state">
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 空状态（无数据） -->
		<view v-else-if="!loading && isEmpty && (billRecordList.value || []).length === 0" class="empty-state">
			<uni-notice-bar single text="暂无账单，赶快添加一笔吧！" color="#007AFF" background-color="#F0F8FF" />
		</view>

		<!-- 空状态（查询失败） -->
		<view v-else class="empty-state">
			<uni-notice-bar single text="查询账单失败，请稍后重试！" color="#FF0000" background-color="#FFF0F0" />
		</view>


		<!-- 添加按钮 -->
		<view class="add-btn" @click="goToAdd">
			<uni-icons type="plusempty" size="28" color="#FFFFFF" />
		</view>

		<!-- 账单操作弹窗 -->
		<uni-popup ref="billActionsPopup" type="bottom" background-color="#fff">
			<view class="bill-actions-popup">
				<view class="action-item" @click="editBill(recordToEdit)">
					<text>编辑</text>
				</view>
				<view class="action-item" @click="deleteBill(recordToEdit)">
					<text>删除</text>
				</view>
				<view class="action-item" @click="closeBillActions">
					<text>取消</text>
				</view>
			</view>
		</uni-popup>
	</view>
</template>


<script setup>
import {
	ref,
	computed,
	onMounted,
	reactive,
	toRefs
} from 'vue';
import CategoryIcon from '@/components/category-icon.vue';
import { onShow } from '@dcloudio/uni-app';
import {
	handleWxLogin
} from '@/api/auth';
import {
	billService
} from '@/api/bill';
import {
	billRecordsService
} from '@/api/billRecords';

const currentAccount = ref({});
const billRecordList = ref([]);
const total = ref(0);
const size = ref(9999);
const currentPage = ref(1);
const monthlyBalance = ref(0);
const monthlyIncome = ref(0);
const monthlyExpense = ref(0);
const loading = ref(false);
const billActionsPopup = ref(null);
const recordToEdit = ref(null);

const data = reactive({
	queryParams: {
		page: currentPage.value,
		pageSize: size.value,
		billId: undefined,
		isAsc: 'desc',
		orderByColumn: 'transaction_date, create_time'
	},
});
const {
	queryParams
} = toRefs(data);


// 确保 formatDate 函数被正确定义和导出
function formatDate(date) {
	// 这里添加具体的日期格式化逻辑，例如将 "2024-12-31" 转换为 "2024年12月31日"
	return date;
}

function getDayIncome(group) {
	let income = 0;
	group.forEach(bill => {
		if (bill.type === 'income') {
			income += Number(bill.amount);
		}
	});
	return income;
}

function getDayExpense(group) {
	let expense = 0;
	group.forEach(bill => {
		if (bill.type === 'expense') {
			expense += Number(bill.amount);
		}
	});
	return expense;
}


/** 计算页面状态 */
const isLoading = computed(() => loading.value);
const isEmpty = computed(() => !loading.value && ((billRecordList.value || []).length === 0));


// 分组函数 - 按日期分组账单
function groupBillsByDate(bills) {
	return bills.reduce((groups, bill) => {
		const dateKey = bill.transactionDate.split(' ')[0]; // 使用 "yyyy-MM-dd" 格式分组
		if (!groups[dateKey]) {
			groups[dateKey] = [];
		}
		groups[dateKey].push(bill);
		return groups;
	}, {});
}


// 计算月度统计信息
function calculateMonthlyStats() {
	let income = 0;
	let expense = 0;
	billRecordList.value.forEach(bill => {
		// 将金额转换为 Number 类型
		const amount = Number(bill.amount);
		if (bill.type === 'income') {
			income += amount;
		} else {
			expense += amount;
		}
	});
	monthlyIncome.value = income;
	monthlyExpense.value = expense;
	monthlyBalance.value = income - expense;
}


/** 获取分页后的账单记录 */
const groupedBillsForPage = computed(() => {
	// 获取当前页的账单记录
	const groupedBills = groupBillsByDate(billRecordList.value);
	const groupedBillsArray = Object.entries(groupedBills);
	const start = (currentPage.value - 1) * size.value;
	const end = start + size.value;
	const pagedGroupedBills = groupedBillsArray.slice(start, end);


	return pagedGroupedBills.reduce((acc, [date, group]) => {
		acc[date] = group;
		return acc;
	}, {});
});


/** 查询账单记录列表 */
async function getList() {
	try {
		// 设置 loading 为 true
		loading.value = true;
		const response = await billRecordsService.getBillRecordsPage(queryParams.value);
		billRecordList.value = response?.data.records || [];
		total.value = response?.data.total || 0;
		// 计算月度统计信息
		calculateMonthlyStats();
	} catch (error) {
		console.error('获取账单记录列表失败：', error);
		// 显示错误信息给用户
		uni.showToast({
			title: '获取账单记录列表失败',
			icon: 'none'
		});
	} finally {
		// 无论成功与否，设置 loading 为 false
		loading.value = false;
	}
}


/** 跳转到添加页面 */
function goToAdd() {
	uni.redirectTo({
		url: '/pages/add/index',
	});
}

/** 跳转到欢迎页面 */
function goToWelcome() {
	uni.redirectTo({
		url: '/pages/index/welcome',
	});
}

function goToDetail(record) {
	const data = encodeURIComponent(JSON.stringify(record));
	console.log(data);
	uni.navigateTo({
		url: `/pages/add/index?record=${data}`,
	});
}


/** 获取账户账单信息 */
async function getAccountBills() {
	try {
		const response = await billService.getBills();
		const accounts = response?.data?.records || [];
		currentAccount.value = accounts.find((account) => account.isDefault) || {};
		if (!currentAccount.value.id) {
			uni.showToast({
				title: '请先添加账本',
				icon: 'none',
			});
			uni.navigateTo({
				url: '/pages/mine/bill',
			});
			return;
		}
		queryParams.value.billId = currentAccount.value.id;
		uni.setStorageSync("defaultBillId", currentAccount.value.id)
	} catch (error) {
		console.error('获取账户账单信息失败：', error);
		// 显示错误信息给用户
		uni.showToast({
			title: '获取账户账单信息失败',
			icon: 'none'
		});
	}
}


/** 处理分页变化 */
function onPageChange(newPage) {
	currentPage.value = newPage;
	queryParams.value.page = newPage;
	getList();
}


// 打开账单操作弹窗
function openBillActions(bill) {
	recordToEdit.value = bill;
	billActionsPopup.value.open();
}


// 关闭账单操作弹窗
function closeBillActions() {
	recordToEdit.value = null;
	billActionsPopup.value.close();
}


// 编辑账单
function editBill(bill) {
	// 这里添加编辑账单的逻辑
	goToDetail(bill);
	closeBillActions();
}


// 删除账单
function deleteBill(bill) {
	// 这里添加删除账单的逻辑
	console.log('删除账单:', bill);
	closeBillActions();
}


onMounted(async () => {
	try {
		const token = uni.getStorageSync('token');
		if (!token) {
			await handleWxLogin();
		}
		goToWelcome();
		await getAccountBills();
		// 在获取账户账单信息后调用 getList 函数，确保只调用一次
		await getList();
	} catch (error) {
		console.error('初始化失败：', error);
		// 显示错误信息给用户
		uni.showToast({
			title: '初始化失败',
			icon: 'none'
		});
	}
});

let isFirstLoad = true;

onShow(async () => {
	if (!isFirstLoad) {
		await getList();
	}
	isFirstLoad = false;

});
</script>


<style lang="scss">
@import '@/styles/pages/index.scss';


.loading-state {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	font-size: 16px;
	color: #999;
}


.empty-state {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
}


.add-btn {
	position: fixed;
	right: 20px;
	bottom: 20px;
	background-color: #007AFF;
	width: 56px;
	height: 56px;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
}


.bill-details {
	display: flex;
	flex-direction: column;


	.primary-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 4px;
	}


	.secondary-info {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;


		.info-item {
			background-color: #f0f0f0;
			padding: 4px 8px;
			border-radius: 4px;
			font-size: 10px;
		}
	}
}


.bill-actions-popup {
	display: flex;
	flex-direction: column;
	padding: 20px;


	.action-item {
		padding: 10px;
		border-bottom: 1px solid #eee;
	}


	.action-item:last-child {
		border-bottom: none;
	}
}
</style>