<template>
    <view class="category-icon" :class="[type, { active: isActive }]">
      <text class="category-text">{{ text.charAt(0) }}</text>
    </view>
  </template>
  
  <script setup>
  defineProps({
    // 类型: income 或 expense
    type: {
      type: String,
      default: 'expense'
    },
    // 显示的文本
    text: {
      type: String,
      required: true
    },
    // 是否激活状态
    isActive: {
      type: Boolean,
      default: false
    }
  })
  </script>
  
  <style lang="scss" scoped>
    .category-icon {
      width: 48rpx; // 调小一点
      height: 48rpx; // 调小一点
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
  </style>