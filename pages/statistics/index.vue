<template>
  <view class="container">
    <view class="nav-bar">
      <text class="title">统计</text>
    </view>
    
    <!-- 时间选择器 -->
    <view class="time-selector">
      <view class="month-picker">
        <text>2024年3月</text>
        <text class="arrow-down">▼</text>
      </view>
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
import { ref, computed } from 'vue'

// Mock 数据
const totalExpense = ref(2750.00)
const totalIncome = ref(5000.00)
const balance = computed(() => (totalIncome.value - totalExpense.value).toFixed(2))

// 颜色配置
const colors = ['#2878ff', '#36cfc9', '#ff7a45', '#597ef7', '#73d13d']

// 支出排行数据
const expenseRank = [
  { name: '餐饮', amount: 1200, percent: 43.6 },
  { name: '交通', amount: 500, percent: 18.2 },
  { name: '购物', amount: 450, percent: 16.4 },
  { name: '娱乐', amount: 300, percent: 10.9 },
  { name: '其他', amount: 300, percent: 10.9 }
]
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