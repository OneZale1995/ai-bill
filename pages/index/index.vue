<template>
  <view class="container">
    <u-navbar title="账单" :border="false" bgColor="transparent" :titleStyle="{ color: '#fff' }"></u-navbar>
    
    <!-- 月度统计 -->
    <view class="month-summary">
      <view class="amount-box">
        <text class="label">本月支出</text>
        <text class="amount">¥{{ monthlyExpense }}</text>
      </view>
      <view class="amount-box">
        <text class="label">本月收入</text>
        <text class="amount">¥{{ monthlyIncome }}</text>
      </view>
    </view>

    <!-- 账单列表 -->
    <view class="bill-list" v-if="bills.length > 0">
      <view v-for="(group, date) in groupedBills" :key="date">
        <view class="date-header">
          <text class="date">{{ date }}</text>
          <text class="day-amount">支出 ¥{{ getDayExpense(group) }}</text>
        </view>
        
        <view class="bill-item" v-for="bill in group" :key="bill.id">
          <view class="bill-info">
            <view class="icon-wrapper">
              <u-icon 
                :name="bill.type === 'income' ? 'arrow-down' : 'arrow-up'" 
                :color="bill.type === 'income' ? '#00b578' : '#ff4d4f'"
                size="40"
              ></u-icon>
            </view>
            <view class="bill-details">
              <text class="bill-note">{{ bill.note }}</text>
              <text class="bill-time">{{ bill.time }}</text>
            </view>
          </view>
          <text class="bill-amount" :class="{ 'income': bill.type === 'income' }">
            {{ bill.type === 'income' ? '+' : '-' }}¥{{ bill.amount }}
          </text>
        </view>
      </view>
    </view>
    
    <u-empty text="暂无账单" mode="list" v-else></u-empty>
    
    <!-- 添加按钮 -->
    <view class="add-btn" @click="goToAdd">
      <text class="add-icon">+</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

// Mock 数据
const mockBills = [
  { id: 1, type: 'expense', amount: 25.5, note: '午餐', time: '12:30', date: '2024-03-15' },
  { id: 2, type: 'expense', amount: 35.0, note: '晚餐', time: '18:45', date: '2024-03-15' },
  { id: 3, type: 'income', amount: 5000, note: '工资', time: '09:00', date: '2024-03-15' },
  { id: 4, type: 'expense', amount: 15.5, note: '早餐', time: '08:30', date: '2024-03-14' },
  { id: 5, type: 'expense', amount: 199, note: '衣服', time: '15:20', date: '2024-03-14' },
]

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

// 计算每日支出
const getDayExpense = (dayBills) => {
  return dayBills
    .filter(bill => bill.type === 'expense')
    .reduce((sum, bill) => sum + bill.amount, 0)
    .toFixed(2)
}

// 跳转到添加页面
const goToAdd = () => {
  uni.navigateTo({
    url: '/pages/add/index'
  })
}
</script>

<style lang="scss">
@import '@/styles/pages/index.scss';
</style> 