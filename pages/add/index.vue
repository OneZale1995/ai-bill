<template>
	<view class="container">
		<page-nav title="记一笔" showBack="true"></page-nav>

		<!-- 收入/支出切换 -->
		<view class="tab-bar fixed-bar">
			<view class="tab-bar-item" :class="{ active: currentTab === 'expense' }" @click="switchTab('expense')">
				支出
			</view>
			<view class="tab-bar-item" :class="{ active: currentTab === 'income' }" @click="switchTab('income')">
				收入
			</view>
		</view>
		<view class="content">
			<!-- 表单区域 -->
			<uni-forms ref="formRef" :model="form" class="form-section uni-bg-white" label-position="right">

				<!-- 金额显示区域 -->
				<view class="amount-input">
					<view class="selected-category" v-if="form.categoryName">
						{{ form.categoryName }}
					</view>
					<view class="amount-section">
						<text class="currency">¥</text>
						<text class="amount">{{ form.amount || '0.00' }}</text>
					</view>
				</view>

				<!-- 分类选择区域 -->
				<view class="category-section">
					<!-- 常用分类列表 -->
					<view class="quick-categories">
						<view v-for="item in displayCategories" :key="item.id" class="category-item"
							:class="{ active: form.categoryId === item.id }" @click="selectCategory(item)">
							{{ item.name }}
						</view>
					</view>

					<!-- 					查看更多按钮 -->
					<view class="more-btn" @click="showAllCategories">
						查看更多
					</view>
				</view>

				<!-- 日期选择 -->
				<uni-forms-item label="日期" name="transactionDate" required>
					<uni-datetime-picker v-model="form.transactionDate" type="date" />
				</uni-forms-item>

				<!-- 角色选择 -->
				<uni-forms-item label="角色" name="role">
					<DropDown :options="roleOptions" :placeholder="'请选择或新增角色'" :enable-add-option="true"
						v-model="form.role" :selected="form.role" @update:options="updateRoleOptions" />
				</uni-forms-item>

				<!-- 平台选择 -->
				<uni-forms-item label="平台" name="platform">
					<DropDown :options="platformOptions" :selected="form.platform" :placeholder="'请选择或新增平台'"
						:enable-add-option="true" v-model="form.platform" @update:options="updatePlatformOptions" />
				</uni-forms-item>

				<!-- 备注输入 -->
				<uni-forms-item label="备注" name="remark">
					<uni-easyinput v-model="form.remark" placeholder="请输入备注信息" :maxlength="50" />
				</uni-forms-item>
			</uni-forms>
		</view>

		<!-- 数字键盘 -->
		<view class="number-keyboard">
			<view class="keyboard-row">
				<view class="key" @click="inputNumber('1')">1</view>
				<view class="key" @click="inputNumber('2')">2</view>
				<view class="key" @click="inputNumber('3')">3</view>
				<view class="key" @click="deleteNumber">←</view>
			</view>
			<view class="keyboard-row">
				<view class="key" @click="inputNumber('4')">4</view>
				<view class="key" @click="inputNumber('5')">5</view>
				<view class="key" @click="inputNumber('6')">6</view>
				<view class="key save" @click="saveAndContinue">保存再记</view>
			</view>
			<view class="keyboard-row">
				<view class="key" @click="inputNumber('7')">7</view>
				<view class="key" @click="inputNumber('8')">8</view>
				<view class="key" @click="inputNumber('9')">9</view>
				<view class="key save main" @click="handleSubmit">保存</view>
			</view>
			<view class="keyboard-row">
				<view class="key" @click="inputNumber('.')">.</view>
				<view class="key" @click="inputNumber('0')">0</view>
				<view class="key" @click="inputNumber('00')">00</view>
			</view>
		</view>

		<uni-popup ref="popup" type="bottom">
			<view class="popup-content">
				<view class="popup-header">
					<text class="title">选择分类</text>
					<view class="config-btn" @click="addCategory">配置</view> <!-- 新增配置按钮 -->
					<text class="close" @click="popup.close()">关闭</text>
				</view>
				<scroll-view scroll-y class="category-list">
					<view v-for="item in currCategoryList" :key="item.id" class="popup-item"
						:class="{ active: form.categoryId === item.id }" @click="selectCategory(item)">
						{{ item.name }}
					</view>
				</scroll-view>
			</view>
		</uni-popup>
	</view>
</template>

<script setup>
import {
	ref,
	reactive,
	computed,
	onMounted,
	watch
} from 'vue';
import {
	categoryService
} from '../../api/category';
import {
	billRoleService
} from '../../api/billRole';
import {
	billPlatformService
} from '../../api/billPlatform';
import {
	billRecordsService
} from '../../api/billRecords';
import DropDown from '@/components/drop-down.vue';
import { onShow } from '@dcloudio/uni-app';


const formRef = ref(null);
const defaultBillId = ref(uni.getStorageSync('defaultBillId'));
const currentTab = ref('expense');
const listQuery = ref({
	pageNum: 1,
	pageSize: 200,
	billId: defaultBillId.value,
	isAsc: 'desc,asc',
	orderByColumn: 'isCommon,sort'
});
const roleOptions = ref([]);
const defaultRoleName = ref('');
const platformOptions = ref([]);
const currCategoryList = ref([]);
const rolePageQuery = ref({
	pageNum: 1,
	pageSize: 100,
	billId: defaultBillId.value
});
const errorMessage = ref('');

const defaultFormValues = {
	amount: '0.00',
	type: currentTab.value,
	categoryId: '',
	categoryName: '',
	transactionDate: new Date().toISOString().split('T')[0],
	role: defaultRoleName.value,
	platform: '',
	remark: '',
	billId: defaultBillId.value
};
const form = reactive({
	...defaultFormValues
});


const categories = ref({
	expense: [],
	income: []
});


const getRoleList = async () => {
	try {
		const {
			data
		} = await billRoleService.getPage(rolePageQuery.value);
		// 映射 text value 形式
		roleOptions.value = data.records.map(item => {
			if (item.isDefault) {
				form.role = item.roleName;
				defaultRoleName.value = item.roleName;
			}
			return item.roleName;
		});
	} catch (error) {
		console.error('获取角色列表失败:', error);
		errorMessage.value = '获取角色列表失败，请重试';
	}
};


const getPlatformList = async () => {
	try {
		const {
			data
		} = await billPlatformService.getPage(rolePageQuery.value);
		platformOptions.value = data.records.map(item => {
			return item.name;
		});
	} catch (error) {
		console.error('获取平台列表失败:', error);
		errorMessage.value = '获取平台列表失败，请重试';
	}
};


const getCategoryList = async () => {
	try {
		const {
			data
		} = await categoryService.getPage(listQuery.value);
		const dataList = data.records;
		// 修改计算属性所依赖的数据，而不是计算属性本身
		categories.value.expense = dataList.filter(item => item.type === 'expense');
		categories.value.income = dataList.filter(item => item.type === 'income');
		// 切换 tab 时，默认展示前 8 个分类
		currCategoryList.value = categories.value[currentTab.value].slice(0, 1000);
	} catch (error) {
		console.error('获取分类列表失败:', error);
		errorMessage.value = '获取分类列表失败，请重试';
	}
};


const getCurrentCategories = () => categories.value[currentTab.value];


// 显示的分类（前 8 个）
const displayCategories = computed(() => getCurrentCategories().slice(0, 8));


const switchTab = async (tab) => {
	currentTab.value = tab;
	form.type = tab;
	// 修改计算属性所依赖的数据，而不是计算属性本身
	currCategoryList.value = categories.value[currentTab.value].slice(0, 1000);
};


const popup = ref(null);


const showAllCategories = () => {
	popup.value.open();
};


function addCategory() {
	uni.navigateTo({
		url: '/pages/mine/category'
	})
}


const selectCategory = (item) => {
	form.categoryId = item.id;
	form.categoryName = item.name;
	if (popup.value) {
		popup.value.close();
	}
};


const inputNumber = (number) => {
	if (form.amount === '0.00') {
		form.amount = number;
	} else {
		if (form.amount.length < 10) { // 限制输入长度
			if (number === '00') {
				if (form.amount === '0') {
					return;
				} else {
					form.amount += '00';
				}
			} else if (number === '0' && form.amount === '0') {
				return;
			} else {
				form.amount += number;
			}
		}
	}
};


const deleteNumber = () => {
	if (form.amount.length === 1 || form.amount === '0.00') {
		form.amount = '0.00';
	} else {
		if (form.amount.endsWith('.')) { // 处理删除小数点的情况
			form.amount = form.amount.slice(0, -1);
		} else {
			form.amount = form.amount.slice(0, -1);
		}
	}
};


// `saveAndContinue` 方法中的处理
const saveAndContinue = async () => {
	try {
		if (validForm()) {
			const res = await saveBill(form);
			if (res) {
				resetForm(); // 重置表单
				errorMessage.value = ''; // 清空错误信息
			}
		}
	} catch (error) {
		console.error('保存失败:', error);
		errorMessage.value = error.message || '保存失败，请重试';
	}
};

function validForm() {
	if (form.amount === '0.00') {

		uni.showToast({
			title: '金额不能为0',
			icon: 'none'
		});
		return false;
	}
	if (form.categoryId === '') {
		uni.showToast({
			title: '请选择分类',
			icon: 'none'
		});
		return false;
	}
	if (!form.transactionDate) {
		uni.showToast({
			title: '请选择日期',
			icon: 'none'
		});
		return false;
	}
	return true;
}

const handleSubmit = async () => {
	if (validForm()) {
		try {
			const res = await saveBill(form); // 调用保存方法
			uni.switchTab({
				url: '/pages/index/index'
			})
		} catch (error) {
			console.error('提交失败:', error);
			uni.showToast({
				title: error.message || '提交失败，请重试',
				icon: 'none'
			});
		}
	}
};


const resetForm = () => {
	form.amount = '0.00';
	form.categoryId = '';
	form.categoryName = '';
	form.transactionDate = new Date().toISOString().split('T')[0];
	form.role = defaultRoleName.value;
	form.platform = '';
	form.remark = '';
	form.type = currentTab.value
	form.billId = defaultBillId.value;
};


const updateRoleOptions = (newOptions) => {
	roleOptions.value = newOptions;
};


const updatePlatformOptions = (newOptions) => {
	platformOptions.value = newOptions;
};


const saveBill = async (billData, errorMessage) => {
  try {
    let response;
    if (billData.id) {
      response = await billRecordsService.updateBillRecord(billData);
    } else {
      response = await billRecordsService.addBillRecord(billData);
    }
    // 假设服务端抛出的错误已经通过 throw 错误的方式处理，这里应该捕获异常。
    // 如果成功，显示提示
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    });
    return response; // 确保返回成功的响应
  } catch (error) {
    // 处理所有捕获的错误
    let errorMsg = '保存失败，请重试';
    if (error.response && error.response.data && error.response.data.msg) {
      errorMsg = error.response.data.msg;
    } else if (error.message) {
      errorMsg = error.message;
    }
    if (errorMessage) {
      errorMessage.value = errorMsg;
    }
    // 显示错误提示
    uni.showToast({
      title: errorMsg,
      icon: 'none'
    });
    // 返回错误信息，确保后续可以处理
    return null;
  }
};


onMounted(async (options) => {
	await getRoleList();
	await getPlatformList();
});

onShow(async () => {
	await getCategoryList();
	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];
	const options = currentPage.options;
	if (options.record) {
		const item = JSON.parse(decodeURIComponent(options.record));
		Object.assign(form, item);
	}
})


watch(currentTab, () => {
	// 修改计算属性所依赖的数据，而不是计算属性本身
	currCategoryList.value = categories.value[currentTab.value].slice(0, 8);
});
</script>

<style lang="scss">
/* 页面内容 */
.content {
	margin-top: 50px;
	margin-bottom: 100px;
	padding: 10px;
	background-color: #fff;
	border-radius: 8px;
}


/* 悬浮导航栏 */
.fixed-bar {
	position: fixed;
	top: 20;
	left: 0;
	width: 100%;
	z-index: 999;
	display: flex;
	background-color: #ffffff;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	border-bottom: 1px solid #e0e0e0;
}

/* 导航项 */
.tab-bar-item {
	flex: 1;
	text-align: center;
	padding: 12px 0;
	font-size: 16px;
	color: #333;
	cursor: pointer;
	transition: color 0.3s, background-color 0.3s;
}

/* 激活状态的导航项 */
.tab-bar-item.active {
	color: #027fff;
	font-weight: bold;
	border-bottom: 2px solid #027fff;
}

/* 鼠标悬浮效果 */
.tab-bar-item:hover {
	background-color: #f1f9ff;
}

.amount-input {
	padding: 24rpx;
	border-bottom: 1rpx solid #f5f5f5;
	display: flex;
	justify-content: space-between;
	align-items: center;

	.selected-category {
		font-size: 28rpx;
		color: #2878ff;
		background: rgba(40, 120, 255, 0.1);
		padding: 8rpx 20rpx;
		border-radius: 24rpx;
	}

	.amount-section {
		display: flex;
		align-items: baseline;

		.currency {
			font-size: 28rpx;
			color: #333;
			margin-right: 4rpx;
		}

		.amount {
			font-size: 40rpx;
			color: #333;
			font-weight: 500;
			font-family: 'DIN Alternate', sans-serif;
		}
	}
}

.category-section {
	padding: 20rpx 24rpx;
	border-bottom: 1rpx solid #f5f5f5;

	.quick-categories {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 20rpx;
	}

	.category-item {
		height: 72rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f5f7fa;
		border-radius: 8rpx;
		font-size: 28rpx;
		color: #333;

		&.active {
			background: rgba(40, 120, 255, 0.1);
			color: #2878ff;
			font-weight: 500;
		}
	}

	.more-btn {
		text-align: center;
		color: #666;
		font-size: 26rpx;
		padding: 24rpx 0 8rpx;
	}
}

.form-section {
	:deep(.uni-forms-item) {
		padding: 0 24rpx;

		.uni-forms-item__inner {
			padding: 24rpx 0;
			border-bottom: 1rpx solid #f5f5f5;
			display: flex;
			align-items: center;
		}

		.uni-forms-item__label {
			color: #666;
			font-size: 28rpx;
			padding-right: 12rpx;
			width: auto;
			min-width: 112rpx;
		}

		.uni-forms-item__content {
			flex: 1;
		}

		// 统一输入框样式
		.uni-easyinput__content,
		.uni-data-select {
			border: none;

			.uni-easyinput__input,
			.uni-data-select__input-text {
				color: #333;
				font-size: 28rpx;
			}
		}

		// 统一placeholder样式
		.uni-easyinput__placeholder-class,
		.input-placeholder {
			color: #999;
			font-size: 28rpx;
		}

		// 统一下拉箭头颜色
		.uni-select__input-box {
			height: 44rpx;
			line-height: 44rpx;

			.uni-select__input-text {
				color: #333;
				font-size: 28rpx;
			}

			.uni-icons {
				color: #999;
			}
		}

		// 统一日期选择器样式
		.uni-date {
			.uni-date-editor {
				height: 44rpx;
				line-height: 44rpx;

				.uni-date-editor--x {
					color: #333;
					font-size: 28rpx;
				}

				.uni-icons {
					color: #999;
				}
			}
		}
	}

	// 去除最后一项的边框
	.uni-forms-item:last-child {
		.uni-forms-item__inner {
			border-bottom: none;
		}
	}
}

.number-keyboard {
	z-index: 50;
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background: #f5f7fa;
	padding: 8rpx;

	.keyboard-row {
		display: flex;
		gap: 8rpx;
		margin-bottom: 8rpx;

		.key {
			flex: 1;
			height: 88rpx;
			background: #fff;
			border-radius: 8rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 32rpx;
			color: #333;
			font-family: 'DIN Alternate', sans-serif;

			&:active {
				background: #f5f7fa;
			}

			&.save {
				font-size: 28rpx;
				color: #2878ff;
				background: #fff;
				font-family: system-ui;

				&.main {
					background: #2878ff;
					color: #fff;
				}

				&:active {
					opacity: 0.9;
				}
			}
		}
	}
}

.popup-content {
	background-color: #fff;
	border-radius: 24rpx 24rpx 0 0;
	padding-bottom: env(safe-area-inset-bottom);
	position: relative; // 确保子元素的定位参考该元素
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1); // 底部阴影效果
	animation: slideUp 0.3s ease; // 添加一个弹出动画
	width: unset;

	@keyframes slideUp {
		from {
			transform: translateY(100%);
		}

		to {
			transform: translateY(0);
		}
	}

	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx;
		border-bottom: 1rpx solid #f5f5f5;

		.title {
			font-size: 32rpx;
			color: #333;
			font-weight: 500;
		}

		.config-btn {
			font-size: 28rpx;
			color: #666;
			padding: 10rpx;
		}

		.close {
			font-size: 28rpx;
			color: #666;
			padding: 10rpx;
		}
	}

	.category-list {
		max-height: 60vh;
		padding: 0 24rpx;
	}

	.popup-item {
		height: 100rpx;
		display: flex;
		align-items: center;
		font-size: 30rpx;
		color: #333;
		border-bottom: 1rpx solid #f5f5f5;

		&.active {
			color: #2878ff;
			font-weight: 500;
		}

		&:last-child {
			border-bottom: none;
		}
	}
}
</style>