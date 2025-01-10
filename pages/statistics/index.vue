<template>
	<view class="container">
		<page-nav title="统计"></page-nav>

		<!-- 使用 uni-datetime-picker 选择日期范围 -->
		<uni-datetime-picker type="daterange" mode="range" v-model="dateRange" @change="onDateRangeChange"
			placeholder="选择日期范围"></uni-datetime-picker>

		<!-- 加载状态 -->
		<view v-if="isLoading" class="loading">
			<text>加载中...</text>
		</view>

		<!-- 错误提示 -->
		<view v-if="errorMessage" class="error">
			<text>{{ errorMessage }}</text>
		</view>

		<!-- 收支总览 -->
		<view class="overview">
			<view class="overview-item">
				<text class="label">支出</text>
				<text class="amount">¥{{ totalExpense }}</text>
			</view>
			<view class="overview-item">
				<text class="label">收入</text>
				<text class="amount">¥{{ totalIncome }}</text>
			</view>
			<view class="overview-item">
				<text class="label">结余</text>
				<text class="amount">¥{{ balance }}</text>
			</view>
		</view>

		<!-- 分类统计 -->
		<view class="statistics-section">
			<view class="section-header">
				<text class="title">支出构成</text>
			</view>

			<!-- 排行榜展示 -->
			<view class="rank-list">
				<view v-for="(item, index) in expenseRank" :key="index" class="rank-item">
					<view class="rank-info">
						<text class="rank-name">{{ item.name }}</text>
						<text class="rank-percent">{{ item.ratio }}%</text>
					</view>
					<view class="rank-bar">
						<view class="bar-inner" :style="{ width: item.ratio + '%', backgroundColor: colors[index] }"></view>
					</view>
					<text class="rank-amount">¥{{ item.amount }}</text>
				</view>
			</view>
		</view>

		<!-- 收入构成 -->
		<view class="statistics-section">
			<view class="section-header">
				<text class="title">收入构成</text>
			</view>

			<view class="rank-list">
				<view v-for="(item, index) in incomeRank" :key="index" class="rank-item">
					<view class="rank-info">
						<text class="rank-name">{{ item.name }}</text>
						<text class="rank-percent">{{ item.ratio }}%</text>
					</view>
					<view class="rank-bar">
						<view class="bar-inner" :style="{ width: item.ratio + '%', backgroundColor: colors[index] }"></view>
					</view>
					<text class="rank-amount">¥{{ item.amount }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted
	} from 'vue';
	import {
		billRecordsService
	} from '../../api/billRecords';
	import dayjs from 'dayjs';
	const totalExpense = ref(0);
	const totalIncome = ref(0);
	const balance = ref(0);
	const expenseRank = ref([]);
	const incomeRank = ref([]);
	const isLoading = ref(false);
	const errorMessage = ref('');
	// 计算当前月的第一天
	const defaultStartDate = ref(dayjs().startOf('month').format('YYYY-MM-DD'));
	// 计算当前月的最后一天
	const defaultEndDate = ref(dayjs().endOf('month').format('YYYY-MM-DD'));
	const dateRange = ref([defaultStartDate.value, defaultEndDate.value])
	console.log(dateRange.value);
	const colors = ['#2878ff', '#36cfc9', '#ff7a45', '#597ef7', '#73d13d'];

	// 日期范围改变的事件处理函数
	const onDateRangeChange = () => {
		const [start, end] = dateRange.value

		defaultStartDate.value = start;
		defaultEndDate.value = end;
		fetchDataByTimeRange();
	};

	onMounted(() => {
		fetchDataByTimeRange();
	});

	const fetchDataByTimeRange = async () => {
		isLoading.value = true;
		errorMessage.value = '';

		const params = {
			billId: uni.getStorageSync('defaultBillId'),
			startDate: defaultStartDate.value,
			endDate: defaultEndDate.value
		};

		try {
			const res = await billRecordsService.getBillRecordStatistics(params);
			const data = res.data;
			if (data) {
				totalExpense.value = data.totalExpense;
				balance.value = data.balance;
				totalIncome.value = data.totalIncome;
				expenseRank.value = data.expenseRank;
				incomeRank.value = data.incomeRank;
			}
		} catch (error) {
			errorMessage.value = '数据加载失败，请稍后重试。';
		} finally {
			isLoading.value = false;
		}
	};
</script>

<style lang="scss">
	.container {
		min-height: 100vh;
		background: #f8fafc;
	}

	.time-selector {
		padding: 20rpx 30rpx;

		.month-picker {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 10rpx;
			font-size: 32rpx;
			color: #333;
			font-weight: 500;
		}

		.date-picker {
			margin-top: 10rpx;
			padding: 10rpx;
			border-radius: 5rpx;
			border: 1px solid #ddd;
		}
	}

	.loading,
	.error {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20rpx;
		font-size: 30rpx;
		color: #ff4d4f;
	}

	.overview {
		display: flex;
		padding: 30rpx;
		background: #fff;
		margin: 0 30rpx 30rpx;
		border-radius: 16rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

		.overview-item {
			flex: 1;
			text-align: center;

			.label {
				font-size: 26rpx;
				color: #666;
				margin-bottom: 10rpx;
				display: block;
			}

			.amount {
				font-size: 32rpx;
				color: #333;
				font-weight: 500;
				font-family: 'DIN Alternate', sans-serif;
			}
		}
	}

	.statistics-section {
		background: #fff;
		margin: 0 30rpx;
		border-radius: 16rpx;
		padding: 30rpx;

		.section-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 30rpx;

			.title {
				font-size: 30rpx;
				color: #333;
				font-weight: 500;
			}
		}

		.rank-list {
			margin-bottom: 20rpx;
		}

		.rank-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 15rpx;

			.rank-info {
				flex: 1;
				display: flex;
				justify-content: space-between;
				align-items: center;

				.rank-name {
					font-size: 28rpx;
					color: #333;
				}

				.rank-percent {
					font-size: 26rpx;
					color: #888;
				}
			}

			.rank-bar {
				flex: 1;
				height: 8rpx;
				background: #f0f0f0;
				border-radius: 8rpx;

				.bar-inner {
					height: 100%;
					border-radius: 8rpx;
				}
			}

			.rank-amount {
				font-size: 28rpx;
				color: #333;
			}
		}
	}
</style>