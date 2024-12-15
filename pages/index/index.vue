<template>
  <view class="container">
<!-- 顶部导航栏 -->
<!-- <uni-nav-bar
  :fixed="true"
  :status-bar="true"
  background-color="#2878ff"
  :border="false"
  :title="currentAccount"
  color="#FFFFFF"
  :title-center="true"
/> -->
<page-nav :title="currentAccount"></page-nav>

    <!-- 月度统计 -->
    <view class="month-summary">
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
    <view class="bill-list" v-if="bills.length > 0">
      <view v-for="(group, date) in groupedBills" :key="date">
        <view class="date-header">
          <view class="date-info">
            <text class="date">{{ formatDate(date) }}</text>
            <text class="summary">收入 {{ getDayIncome(group) }} 支出 {{ getDayExpense(group) }}</text>
          </view>
        </view>
        
        <view class="bill-items">
          <view 
            v-for="bill in group" 
            :key="bill.id"
            class="bill-item"
          >
            <view class="bill-info">
              <category-icon 
                :type="bill.type"
                :text="bill.note"
              />
              <view class="bill-details">
                <view class="primary-info">
                  <text class="category-name">{{ bill.note }}</text>
                  <text class="amount" :class="{ 'income': bill.type === 'income' }">
                    {{ bill.type === 'income' ? '+' : '-' }}{{ bill.amount }}
                  </text>
                </view>
                <view class="secondary-info">
                  <text class="time">{{ bill.time }}</text>
                  <text class="payment-method">{{ bill.paymentMethod }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <view v-else class="empty-state">
      <image src="/static/images/empty.svg" mode="aspectFit" class="empty-image"></image>
      <text class="empty-text">暂无账单</text>
    </view>
    
    <!-- 添加按钮 -->
    <view class="add-btn" @click="goToAdd">
      <uni-icons type="plusempty" size="28" color="#FFFFFF"></uni-icons>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import CategoryIcon from '@/components/category-icon.vue'

// Mock 数据
const mockBills = [
  { id: 1, type: 'expense', amount: 25.5, note: '午餐', time: '12:30', date: '2024-03-15', category: 'food', paymentMethod: '微信' },
  { id: 2, type: 'expense', amount: 35.0, note: '晚餐', time: '18:45', date: '2024-03-15', category: 'food', paymentMethod: '支付宝' },
  { id: 3, type: 'income', amount: 5000, note: '工资', time: '09:00', date: '2024-03-15', category: 'salary', paymentMethod: '银行转账' },
  { id: 4, type: 'expense', amount: 15.5, note: '早餐', time: '08:30', date: '2024-03-14', category: 'food', paymentMethod: '微信' },
  { id: 5, type: 'expense', amount: 199, note: '衣服', time: '15:20', date: '2024-03-14', category: 'clothing', paymentMethod: '支付宝' },
]

// 账本数据
const accounts = [
  { id: 1, name: '日常账本' },
  { id: 2, name: '旅行账本' },
  { id: 3, name: '生意账本' },
]
const currentAccount = ref('日常账本')
const bills = ref(mockBills)

// 按日期分组的账单
const groupedBills = computed(() => {
  const groups = {}
  bills.value.forEach(bill => {
    if (!groups[bill.date]) {
      groups[bill.date] = []
    }
    groups[bill.date].push(bill)
  })
  return groups
})

// 计算月度收支
const monthlyExpense = computed(() => {
  return bills.value
    .filter(bill => bill.type === 'expense')
    .reduce((sum, bill) => sum + bill.amount, 0)
    .toFixed(2)
})

const monthlyIncome = computed(() => {
  return bills.value
    .filter(bill => bill.type === 'income')
    .reduce((sum, bill) => sum + bill.amount, 0)
    .toFixed(2)
})

const monthlyBalance = computed(() => {
  return (Number(monthlyIncome.value) - Number(monthlyExpense.value)).toFixed(2)
})

// 计算每日支出
const getDayExpense = (dayBills) => {
  return dayBills
    .filter(bill => bill.type === 'expense')
    .reduce((sum, bill) => sum + bill.amount, 0)
    .toFixed(2)
}

const getDayIncome = (dayBills) => {
  return dayBills
    .filter(bill => bill.type === 'income')
    .reduce((sum, bill) => sum + bill.amount, 0)
    .toFixed(2)
}

// 格式化日期
const formatDate = (date) => {
  return date.replace(/-/g, '.')
}

// 跳转到添加页面
const goToAdd = () => {
  uni.navigateTo({
    url: '/pages/add/index'
  })
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: env(safe-area-inset-bottom);
}

:deep(.uni-nav-bar__header) {
  .uni-nav-bar__header-container {
    justify-content: center;
    
    .uni-nav-bar__header-btns {
      display: none;
    }
    
    .uni-nav-bar__header-container-inner {
      flex: none;
      justify-content: center;
      
      .uni-nav-bar__content-title {
        color: #FFFFFF;
      }
    }
  }
}

.nav-title {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 36rpx;
  font-weight: 500;
  width: 100%;
  text-align: center;
}

.nav-right {
  display: flex;
  align-items: center;
}

.month-summary {
  background: linear-gradient(180deg, #2878ff 0%, #2878ff 100%);
  padding: 20rpx 32rpx;  // 减小padding
  color: #fff;
  
  .balance {
    text-align: center;
    margin-bottom: 16rpx;  // 减小margin
    
    .label {
      font-size: 24rpx;  // 减小字体
      opacity: 0.9;
    }
    
    .amount {
      display: block;
      font-size: 48rpx;  // 减小字体
      font-weight: 500;
      margin-top: 4rpx;
      font-family: 'DIN Alternate', sans-serif;
      
      &.negative {
        color: #ff4d4f;
      }
    }
  }
  
  .details {
    display: flex;
    justify-content: space-around;
    
    .income, .expense {
      text-align: center;
      
      .label {
        font-size: 24rpx;
        opacity: 0.9;
      }
      
      .value {
        display: block;
        font-size: 28rpx;
        margin-top: 4rpx;
        font-family: 'DIN Alternate', sans-serif;
      }
    }
  }
}
.bill-list {
  background: #fff;
  
  .date-header {
    padding: 20rpx 32rpx;
    background: #f8f8f8;
    
    .date-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 28rpx;
      color: #666;
      
      .date {
        font-weight: 500;
      }
      
      .summary {
        font-size: 24rpx;
        color: #999;
      }
    }
  }
  
  .bill-items {
    padding: 0 32rpx;
  }
  
  .bill-item {
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
    
    &:last-child {
      border-bottom: none;
    }
    
    .bill-info {
      display: flex;
      align-items: center;
    }
    
    .category-icon {
      width: 64rpx;
      height: 64rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;
      
      &.income {
        background-color: #2878ff;
      }
      
      &.expense {
        background-color: #ff9c6e;
      }
      
      .category-text {
        color: #fff;
        font-size: 26rpx;
      }
    }
    
    .bill-details {
      flex: 1;
      
      .primary-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4rpx;
        
        .category-name {
          font-size: 28rpx;
          color: #333;
        }
        
        .amount {
          font-size: 28rpx;
          color: #ff4d4f;
          font-family: 'DIN Alternate', sans-serif;
          
          &.income {
            color: #2878ff;
          }
        }
      }
      
      .secondary-info {
        display: flex;
        justify-content: space-between;
        font-size: 22rpx;
        color: #999;
        
        .payment-method {
          color: #666;
        }
      }
    }
  }
}

.add-btn {
  position: fixed;
  right: 32rpx;
  bottom: calc(32rpx + env(safe-area-inset-bottom));
  width: 100rpx;
  height: 100rpx;
  background-color: #2878ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 8rpx rgba(40, 120, 255, 0.2);
  z-index: 100;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 32rpx;
  
  .empty-image {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: 32rpx;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>