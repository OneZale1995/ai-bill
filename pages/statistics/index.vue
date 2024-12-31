<template>
  <view class="container">
    <page-nav title="统计" ></page-nav>

    <!-- 时间选择器 -->
    <view class="time-selector">
      <picker @change="onTimeRangeChange" mode="selector">
        <view class="month-picker">
          <text>{{ selectedTimeRangeText }}</text>
          <text class="arrow-down">▼</text>
        </view>
      </picker>
      <!-- 如果需要支持用户自定义时间输入，添加如下输入框，此处示例仅供参考，需完善交互逻辑 -->
      <!-- <input type="text" placeholder="请输入自定义时间范围" v-model="customTimeRange" /> -->
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
        <view 
          v-for="(item, index) in expenseRank" 
          :key="index"
          class="rank-item"
        >
          <view class="rank-info">
            <text class="rank-name">{{ item.name }}</text>
            <text class="rank-percent">{{ item.percent }}%</text>
          </view>
          <view class="rank-bar">
            <view 
              class="bar-inner" 
              :style="{ width: item.percent + '%', backgroundColor: colors[index] }"
            ></view>
          </view>
          <text class="rank-amount">¥{{ item.amount }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// 存储当前选择的时间范围，初始值可以根据需求设定，比如默认本月
const selectedTimeRange = ref('month');
// 根据时间范围展示的文本，用于界面显示
const selectedTimeRangeText = ref('本月');
// 存储后端获取的总支出数据
const totalExpense = ref(0);
// 存储后端获取的总收入数据
const totalIncome = ref(0);
// 根据收入和支出计算结余
const balance = computed(() => (totalIncome.value - totalExpense.value).toFixed(2));

// 颜色配置
const colors = ['#2878ff', '#36cfc9', '#ff7a45', '#597ef7', '#73d13d'];

// 存储后端获取的支出排行数据
const expenseRank = ref([]);

// 时间范围改变时触发的函数，用于更新界面显示文本以及请求对应数据
const onTimeRangeChange = (e) => {
  const { value } = e.detail;
  selectedTimeRange.value = value;
  switch (value) {
    case 'week':
      selectedTimeRangeText.value = '本周';
      break;
    case 'month':
      selectedTimeRangeText.value = '本月';
      break;
    case 'year':
      selectedTimeRangeText.value = '本年';
      break;
    case 'all':
      selectedTimeRangeText.value = '全部';
      break;
    default:
      break;
  }
  // 调用获取数据函数，根据新的时间范围获取数据
  fetchDataByTimeRange(selectedTimeRange.value);
};

// 初始化时获取默认时间范围（比如本月）的数据
onMounted(() => {
  fetchDataByTimeRange(selectedTimeRange.value);
});

// 根据时间范围向后端请求数据的函数
const fetchDataByTimeRange = (timeRange) => {
  axios.get(`/your-backend-api-url?timeRange=${timeRange}`)
   .then((response) => {
      const { totalExpense: expense, totalIncome: income, expenseRank: rank } = response.data;
      totalExpense.value = expense;
      totalIncome.value = income;
      expenseRank.value = rank;
    })
   .catch((error) => {
      console.error('获取数据出错：', error);
    });
};
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #f8fafc;
}

.nav-bar {
  padding: 20rpx 30rpx;
  background: #fff;
  
  .title {
    font-size: 36rpx;
    font-weight: 500;
    color: #333;
  }
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
}

.overview {
  display: flex;
  padding: 30rpx;
  background: #fff;
  margin: 0 30rpx 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
  
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
    .rank-item {
      margin-bottom: 30rpx;
      
      .rank-info {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10rpx;
        
        .rank-name {
          font-size: 28rpx;
          color: #333;
        }
        
        .rank-percent {
          font-size: 28rpx;
          color: #666;
        }
      }
      
      .rank-bar {
        height: 12rpx;
        background: #f5f5f5;
        border-radius: 6rpx;
        overflow: hidden;
        margin-bottom: 6rpx;
        
        .bar-inner {
          height: 100%;
          background: #2878ff;
          border-radius: 6rpx;
          transition: width 0.3s ease;
        }
      }
      
      .rank-amount {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
}

.pie-chart {
  height: 600rpx;
  padding: 20rpx 0;
}

.chart-canvas {
  width: 100%;
  height: 100%;
}

.arrow-down {
  font-size: 24rpx;
  color: #666;
  margin-left: 6rpx;
}

// 修改进度条颜色
.rank-list {
  .rank-item {
    .bar-inner {
      background: #2878ff;  // 默认颜色，会被动态颜色覆盖
    }
  }
}
</style> 