<template>
  <view class="container">
    <view class="user-info">
      <view class="avatar"></view>
      <text class="nickname">用户名</text>
    </view>
    
    <view class="section">
      <view class="section-title">我的账本</view>
      <view class="book-list">
        <view 
          v-for="book in accountBooks" 
          :key="book.id"
          class="book-item"
          :class="{ active: book.id === currentBookId }"
          @click="switchBook(book)"
        >
          <text class="book-name">{{ book.name }}</text>
          <text class="book-role">{{ book.role }}</text>
        </view>
        <view class="book-item add" @click="showCreateBook = true">
          <text>+ 创建账本</text>
        </view>
      </view>
    </view>
    
    <!-- 创建账本弹窗 -->
    <view class="popup" v-if="showCreateBook">
      <view class="popup-content">
        <text class="popup-title">创建家庭账本</text>
        <input 
          v-model="newBookName"
          class="input"
          placeholder="请输入账本名称"
        />
        <view class="popup-btns">
          <button @click="showCreateBook = false">取消</button>
          <button @click="createBook" type="primary">创建</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const currentBookId = ref(1)
const showCreateBook = ref(false)
const newBookName = ref('')

// Mock数据
const accountBooks = ref([
  { id: 1, name: '我的账本', role: '个人账本' },
  { id: 2, name: '家庭账本', role: '管理员' }
])

const createBook = () => {
  if (!newBookName.value) {
    uni.showToast({
      title: '请输入账本名称',
      icon: 'none'
    })
    return
  }
  
  // TODO: 创建账本的API调用
  accountBooks.value.push({
    id: Date.now(),
    name: newBookName.value,
    role: '管理员'
  })
  
  showCreateBook.value = false
  newBookName.value = ''
}

const switchBook = (book) => {
  currentBookId.value = book.id
  // TODO: 切换账本的逻辑
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background: #f8fafc;
  padding: 30rpx;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  
  .avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    background: #e5e7eb;
    margin-right: 20rpx;
  }
  
  .nickname {
    font-size: 32rpx;
    color: #333;
    font-weight: 500;
  }
}

.section {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  
  .section-title {
    font-size: 30rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 20rpx;
  }
}

.book-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  
  .book-item {
    background: #f8f9fa;
    border-radius: 12rpx;
    padding: 20rpx;
    text-align: center;
    
    &.active {
      background: #e6f0ff;
      border: 2rpx solid #2878ff;
    }
    
    &.add {
      border: 2rpx dashed #ddd;
      color: #666;
    }
    
    .book-name {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 8rpx;
      display: block;
    }
    
    .book-role {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  
  .popup-content {
    width: 600rpx;
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    
    .popup-title {
      font-size: 32rpx;
      color: #333;
      font-weight: 500;
      margin-bottom: 30rpx;
      text-align: center;
    }
    
    .input {
      border: 2rpx solid #eee;
      border-radius: 8rpx;
      padding: 20rpx;
      margin-bottom: 30rpx;
    }
    
    .popup-btns {
      display: flex;
      gap: 20rpx;
      
      button {
        flex: 1;
      }
    }
  }
}
</style> 