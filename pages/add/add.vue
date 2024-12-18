<template>
  <view class="container">
    <uni-nav-bar
      title="记账"
      :fixed="true"
      :status-bar="true"
      background-color="#2878ff"
      :border="false"
      left-icon="left"
      @clickLeft="goBack"
    >
      <template v-slot:default>
        <text class="nav-title">记账</text>
      </template>
    </uni-nav-bar>
    
    <!-- 类型切换 -->
    <uni-segmented-control
      :current="currentTab"
      :values="['支出', '收入']"
      style-type="text"
      active-color="#2878ff"
      @clickItem="onSegmentClick"
    ></uni-segmented-control>

    <!-- 金额输入 -->
    <view class="amount-input">
      <text class="currency">¥</text>
      <text class="amount">{{ form.amount || '0.00' }}</text>
    </view>

    <!-- 分类选择 -->
    <view class="category-list">
      <view class="category-grid">
        <view 
          v-for="category in categories" 
          :key="category.id"
          class="category-item"
          :class="{ active: form.category === category.id }"
          @click="selectCategory(category)"
        >
          <uni-icons :type="category.icon" size="32" :color="form.category === category.id ? '#2878ff' : '#333'"></uni-icons>
          <text class="category-name">{{ category.name }}</text>
        </view>
      </view>
    </view>

    <!-- 日期和备注 -->
    <uni-list :border="false">
      <uni-list-item
        title="日期"
        :rightText="form.date"
        link
        @click="showDatePicker"
      />
      <uni-list-item
        title="备注"
        :rightText="form.note || '添加备注'"
        link
        @click="showNotePopup"
      />
    </uni-list>

    <!-- 数字键盘 -->
    <view class="number-keyboard">
      <view class="keyboard-grid">
        <view class="key-row" v-for="row in keyboardRows" :key="row[0]">
          <view 
            class="key" 
            v-for="key in row" 
            :key="key"
            @click="inputNumber(key)"
          >
            {{ key }}
          </view>
        </view>
        <view class="key-row">
          <view class="key" @click="inputNumber('.')">.</view>
          <view class="key" @click="inputNumber('0')">0</view>
          <view class="key delete" @click="deleteNumber">
            <uni-icons type="trash" size="24" color="#666"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <!-- 日期选择器 -->
    <uni-datetime-picker
      ref="datePicker"
      type="date"
      :value="form.date"
      @change="onDateSelect"
    />

    <!-- 备注输入弹窗 -->
    <uni-popup ref="notePopup" type="bottom">
      <view class="popup-content">
        <view class="popup-header">
          <text>添加备注</text>
          <text class="close" @click="closeNotePopup">完成</text>
        </view>
        <view class="input-area">
          <input
            type="text"
            v-model="form.note"
            placeholder="请输入备注"
            class="note-input"
          />
        </view>
      </view>
    </uni-popup>

    <!-- 底部按钮 -->
    <view class="bottom-buttons">
      <button class="submit-btn" @click="handleSubmit" type="primary">保存</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const currentTab = ref(0)
const notePopup = ref(null)
const datePicker = ref(null)

const form = ref({
  type: 'expense',
  amount: '',
  category: '',
  date: new Date().toISOString().split('T')[0],
  note: ''
})

// 键盘配置
const keyboardRows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9']
]

// 分类数据
const categories = [
  { id: 1, name: '餐饮', icon: 'shop' },
  { id: 2, name: '购物', icon: 'cart' },
  { id: 3, name: '交通', icon: 'car' },
  { id: 4, name: '娱乐', icon: 'star' },
  { id: 5, name: '服饰', icon: 'gift' },
  { id: 6, name: '医疗', icon: 'heart' },
  { id: 7, name: '学习', icon: 'book' },
  { id: 8, name: '其他', icon: 'more-filled' }
]

// 切换收支类型
const onSegmentClick = (e) => {
  currentTab.value = e.currentIndex
  form.value.type = e.currentIndex === 0 ? 'expense' : 'income'
}

// 选择分类
const selectCategory = (category) => {
  form.value.category = category.id
}

// 输入数字
const inputNumber = (num) => {
  if (form.value.amount.length >= 10) return
  if (num === '.' && form.value.amount.includes('.')) return
  if (num === '.' && !form.value.amount) {
    form.value.amount = '0.'
    return
  }
  form.value.amount += num
}

// 删除数字
const deleteNumber = () => {
  form.value.amount = form.value.amount.slice(0, -1)
}

// 显示日期选择
const showDatePicker = () => {
  datePicker.value.show()
}

// 选择日期
const onDateSelect = (date) => {
  form.value.date = date
}

// 显示备注输入
const showNotePopup = () => {
  notePopup.value.open()
}

// 关闭备注输入
const closeNotePopup = () => {
  notePopup.value.close()
}

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 提交表单
const handleSubmit = () => {
  if (!validateForm()) return
  
  // 这里添加保存账单的逻辑
  console.log('保存账单:', form.value)
  
  uni.showToast({
    title: '保存成功',
    icon: 'success'
  })
  
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}

// 表单验证
const validateForm = () => {
  if (!form.value.amount) {
    uni.showToast({
      title: '请输入金额',
      icon: 'none'
    })
    return false
  }
  
  if (!form.value.category) {
    uni.showToast({
      title: '请选择分类',
      icon: 'none'
    })
    return false
  }
  
  return true
}
</script>

<style lang="scss">
// .container {
//   min-height: 100vh;
//   background-color: #f5f5f5;
//   padding-bottom: env(safe-area-inset-bottom);
// }

// .nav-title {
//   color: #fff;
// }

// .amount-input {
//   background: #fff;
//   padding: 40rpx 32rpx;
//   margin: 20rpx 0;
//   display: flex;
//   align-items: baseline;
  
//   .currency {
//     font-size: 40rpx;
//     color: #333;
//     margin-right: 8rpx;
//   }
  
//   .amount {
//     font-size: 60rpx;
//     color: #333;
//     font-weight: 500;
//     font-family: 'DIN Alternate', sans-serif;
//   }
// }

// .category-list {
//   background: #fff;
//   padding: 32rpx;
//   margin-bottom: 20rpx;
  
//   .category-grid {
//     display: grid;
//     grid-template-columns: repeat(4, 1fr);
//     gap: 32rpx;
//   }
  
//   .category-item {
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     padding: 20rpx 0;
//     border-radius: 12rpx;
    
//     &.active {
//       background: rgba(40, 120, 255, 0.1);
//     }
    
//     .category-name {
//       font-size: 24rpx;
//       color: #333;
//       margin-top: 8rpx;
//     }
//   }
// }

// .number-keyboard {
//   position: fixed;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   background: #f5f5f5;
//   padding: 20rpx;
  
//   .keyboard-grid {
//     background: #fff;
//     border-radius: 12rpx;
//     overflow: hidden;
//   }
  
//   .key-row {
//     display: flex;
    
//     .key {
//       flex: 1;
//       height: 100rpx;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       font-size: 36rpx;
//       border: 1rpx solid #eee;
//       background: #fff;
      
//       &.delete {
//         background: #f5f5f5;
//       }
      
//       &:active {
//         background: #f5f5f5;
//       }
//     }
//   }
// }

// .popup-content {
//   background: #fff;
//   border-radius: 24rpx 24rpx 0 0;
  
//   .popup-header {
//     display: flex;
//     justify-content: space-between;
//     align-items: center;
//     padding: 32rpx;
//     border-bottom: 1rpx solid #eee;
    
//     .close {
//       color: #2878ff;
//       font-size: 28rpx;
//     }
//   }
// }

// .input-area {
//   padding: 32rpx;
  
//   .note-input {
//     width: 100%;
//     height: 80rpx;
//     background: #f5f5f5;
//     border-radius: 8rpx;
//     padding: 0 24rpx;
//     font-size: 28rpx;
//   }
// }

// .bottom-buttons {
//   position: fixed;
//   left: 0;
//   right: 0;
//   bottom: 0;
//   padding: 20rpx 32rpx;
//   background: #fff;
//   box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
  
//   .submit-btn {
//     background: #2878ff;
//     border-radius: 8rpx;
//     color: #fff;
//     font-size: 32rpx;
    
//     &:active {
//       opacity: 0.9;
//     }
//   }
// }
</style>
