<template>
    <uni-nav-bar
      :fixed="true"
      :status-bar="true"
      background-color="#2878ff"
      :border="false"
      :title="title"
      color="#FFFFFF"
      :title-center="true"
      :left-icon="showBack ? 'left' : ''"
      @clickLeft="goBack"
    />
  </template>
  
  <script setup>
  defineProps({
    title: {
      type: String,
      default: ''
    },
    showBack: {
      type: Boolean,
      default: false
    }
  })
  
  const goBack = () => {
    // 获取当前页面栈
    const pages = getCurrentPages()
    
    // 如果页面栈长度大于1，说明可以返回上一页
    if (pages.length > 1) {
      uni.navigateBack({
        delta: 1
      })
    } else {
      // 如果已经是第一个页面，跳转到首页
      uni.switchTab({
        url: '/pages/index/index'  // 替换成你的首页路径
      })
    }
  }
  </script>
  
  <style lang="scss">
  :deep(.uni-nav-bar__header) {
    .uni-nav-bar__header-container {
      justify-content: center;
      
      .uni-nav-bar__header-btns {
        display: block;
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
  </style>