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

    <!-- 表单区域 -->
    <uni-forms ref="formRef" :model="form" :rules="rules" class="form-section uni-bg-white" label-position="right">

      <!-- 金额显示区域 -->
      <view class="amount-input">
        <view class="selected-category" v-if="selectedCategory">
          {{ selectedCategory.name }}
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
            :class="{ active: form.categoryId === item.id }" @click="form.categoryId = item.id">
            {{ item.name }}
          </view>
        </view>

        <!-- 查看更多按钮 -->
        <view class="more-btn" @click="showAllCategories">
          查看更多
        </view>
      </view>

      <!-- 日期选择 -->
      <uni-forms-item label="日期" name="date" required>
        <uni-datetime-picker v-model="form.date" type="date" :end="today" />
      </uni-forms-item>

      <!-- 角色选择 -->
      <uni-forms-item label="角色" name="role" required>
        <uni-data-select v-model="form.role" :localdata="roleOptions" placeholder="请选择角色" />
      </uni-forms-item>

      <!-- 平台选择 -->
      <uni-forms-item label="平台" name="platform" required>
        <uni-data-select v-model="form.platform" :localdata="platformOptions" placeholder="请选择平台" />
      </uni-forms-item>

      <!-- 备注输入 -->
      <uni-forms-item label="备注" name="remark">
        <uni-easyinput v-model="form.remark" placeholder="请输入备注信息" :maxlength="50" />
      </uni-forms-item>
    </uni-forms>

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

    <!-- 分类选择弹窗 -->
    <uni-popup ref="popup" type="bottom">
      <view class="popup-content">
        <view class="popup-header">
          <text class="title">选择分类</text>
          <text class="close" @click="popup.close()">关闭</text>
        </view>
        <scroll-view scroll-y class="category-list">
          <view v-for="item in currentCategories" :key="item.id" class="popup-item"
            :class="{ active: form.categoryId === item.id }" @click="selectCategory(item)">
            {{ item.name }}
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import pageNav from '@/components/page-nav.vue'
import { billPlatformService } from '../../api/billPlatform'
import { categoryService } from '../../api/category'
import { billRoleService } from '../../api/billRole'

const formRef = ref(null)
const today = new Date().toISOString().split('T')[0]
const defaultBillId = ref(uni.getStorageSync('defaultBillId'));
const currentTab = ref('expense');
// 表单数据
const form = ref({
  amount: '',
  type: currentTab.value, // 默认支出
  categoryId: '',
  date: today,
  role: '',
  platform: '',
  remark: ''
})
const listQuery = ref({
  pageNum: 1,
  pageSize: 100,
  billId: defaultBillId.value,
});
// 分类数据
const expenseCategories = ref([])
const incomeCategories = ref([])
// 当前显示的分类（前8个）
// const displayCategories = computed(() => {
//   const categories = form.value.type === 'expense' ? incomeCategories : expenseCategories
//   return categories.slice(0, 8)
// })
const roleOptions = ref([])
const platformOptions = ref([])

onMounted(async () => {
    await getCategoryList();

});

async function getCategoryList() {
  const queryData = listQuery.value;
  queryData.pageNum.value = 1;
  queryData.pageSize = 200;
  queryData.isAsc.value = 'desc,asc';
  queryData.orderByColumn.value = 'isCommon,sort';
  const { data } = await categoryService.getPage(queryData.value);
  const dataList = data.records;
  expenseCategories.value = dataList.filter(item => item.type === 'expense')
  incomeCategories.value = dataList.filter(item => item.type === 'income')
}

async function getPlatformList() {
  const { data } = await billPlatformService.getPage(listQuery.value);
  platformOptions.value = data.records;
}

// 表单验证规则
const rules = {
  date: {
    rules: [{ required: true, errorMessage: '请选择日期' }]
  },
  // role: {
  //   rules: [{ required: true, errorMessage: '请选择角色' }]
  // },
  // platform: {
  //   rules: [{ required: true, errorMessage: '请选择平台' }]
  // }
}

// 金额输入处理
const inputNumber = (num) => {
  if (form.value.amount === '' && num === '.') {
    form.value.amount = '0.'
  } else if (form.value.amount === '0' && num !== '.') {
    form.value.amount = num
  } else if (num === '.' && form.value.amount.includes('.')) {
    return
  } else if (form.value.amount.includes('.') && form.value.amount.split('.')[1].length >= 2) {
    return
  } else {
    form.value.amount += num
  }
}

const deleteNumber = () => {
  form.value.amount = form.value.amount.slice(0, -1)
}

// 表单提交
const handleSubmit = async () => {
  if (!form.value.amount || parseFloat(form.value.amount) === 0) {
    uni.showToast({
      title: '请输入金额',
      icon: 'none'
    })
    return
  }

  try {
    await formRef.value.validate()

    // TODO: 发送请求到后端
    console.log('提交的表单数据：', form.value)

    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })

    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (err) {
    uni.showToast({
      title: '请完善表单信息',
      icon: 'none'
    })
  }
}

// 保存并继续
const saveAndContinue = async () => {
  if (!form.value.amount || parseFloat(form.value.amount) === 0) {
    uni.showToast({
      title: '请输入金额',
      icon: 'none'
    })
    return
  }

  try {
    await formRef.value.validate()

    // TODO: 发送请求到后端
    console.log('提交的表单数据：', form.value)

    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })

    // 重置表单
    form.value = {
      amount: '',
      type: form.value.type,
      categoryId: '',
      date: today,
      role: form.value.role,
      platform: form.value.platform,
      remark: ''
    }
  } catch (err) {
    uni.showToast({
      title: '请完善表单信息',
      icon: 'none'
    })
  }
}

const popup = ref(null)

// 当前类型的所有分类
const currentCategories = computed(() => {
  return form.value.type === 1 ? incomeCategories : expenseCategories
})

// 显示全部分类
const showAllCategories = () => {
  popup.value.open()
}

// 选择分类
const selectCategory = (item) => {
  form.value.categoryId = item.id
  popup.value.close()
}

// 当前选中的分类
const selectedCategory = computed(() => {
  const categories = form.value.type === 1 ? incomeCategories : expenseCategories
  return categories.find(item => item.id === form.value.categoryId)
})
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #fff;
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