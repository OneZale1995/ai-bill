<template>
  <view class="container">
    <!-- 使用导航栏组件 -->
    <page-nav title="记账" showBack="true"></page-nav>

    <!-- 类型切换 -->
    <view class="type-tabs">
      <view class="tabs-wrapper">
        <view v-for="(item, index) in ['支出', '收入']" :key="index" class="tab-item"
          :class="{ active: currentTab === index }" @click="switchTab(index)">
          {{ item }}
        </view>
        <view class="tab-line" :style="{
          transform: `translateX(${currentTab * 100}%)`,
          width: `${100 / 2}%`
        }"></view>
      </view>
    </view>

    <!-- 选择分类提示 -->
    <view class="category-select" @click="showAllCategories">
      <view class="category-info" v-if="selectedCategory">
        <uni-icons :type="selectedCategoryIcon" size="32" color="#333"></uni-icons>
        <text>{{ selectedCategory }}</text>
      </view>
      <text v-else>选择分类</text>
    </view>

    <!-- 金额输入 -->
    <view class="amount-input">
      <text class="currency">¥</text>
      <text class="amount">{{ form.amount || '0.00' }}</text>
    </view>

    <!-- 常用分类 -->
    <view class="category-section">
      <view class="section-header">
        <text>常用类别</text>
        <text class="more" @click="showAllCategories">全部 ></text>
      </view>
      <view class="category-grid">
        <view v-for="category in commonCategories" :key="category.id" class="category-item"
          :class="{ active: form.categoryId === category.id }" @click="selectCategory(category)">
          <category-icon :type="currentTab === 0 ? 'expense' : 'income'" :text="category.name"
            :is-active="form.categoryId === category.id" />
          <text>{{ category.name }}</text>
        </view>
      </view>
    </view>

    <!-- 日期选择 -->
    <view class="form-item">
      <text class="label">日期</text>
      <picker mode="date" :value="form.date" @change="onDateChange">
        <view class="value">
          {{ form.date }}
          <uni-icons type="right" size="24" color="#999"></uni-icons>
        </view>
      </picker>
    </view>

    <!-- 消费人选择 -->
    <view class="form-item">
      <text class="label">消费人</text>
      <picker :range="members" range-key="name" @change="handleMemberChange">
        <view class="picker-value">
          {{ selectedMember ? selectedMember.name : '请选择' }}
        </view>
      </picker>
    </view>

    <!-- 消费类型选择 -->
    <view class="form-item">
      <text class="label">消费类型</text>
      <picker :range="consumeTypes" range-key="name" @change="handleTypeChange">
        <view class="picker-value">
          {{ selectedConsumeType ? selectedConsumeType.name : '请选择' }}
        </view>
      </picker>
    </view>

    <!-- 备注输入 -->
    <view class="form-item">
      <input v-model="form.note" placeholder="添加备注..." class="remark-input" />
    </view>



    <!-- 数字键盘 -->
    <view class="number-keyboard">
      <view class="keyboard-row">
        <view class="key" @click="inputNumber('1')">1</view>
        <view class="key" @click="inputNumber('2')">2</view>
        <view class="key" @click="inputNumber('3')">3</view>
        <view class="key" @click="deleteNumber">
          <text>←</text>
        </view>
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

    <!-- 分类选择弹出层 -->
    <uni-popup ref="categoryPopup" type="bottom">
      <view class="category-popup">
        <!-- 顶部导航 -->
        <view class="popup-header">
          <view class="left" @click="closeCategoryPopup">
            <uni-icons type="left" size="24"></uni-icons>
          </view>
          <view class="center">
            <text>{{ currentTab === 0 ? '支出' : '收入' }}</text>
          </view>
          <view class="right">
            <uni-icons type="plusempty" size="24"></uni-icons>
          </view>
        </view>

        <!-- 分类内容区 -->
        <view class="category-content">
          <!-- 左侧主分类 -->
          <scroll-view scroll-y class="main-category">
            <view v-for="category in mainCategories" :key="category.id" class="main-category-item"
              :class="{ active: currentMainCategory === category.id }" @click="selectMainCategory(category.id)">
              <text>{{ category.name }}</text>
              <view class="active-bar"></view>
            </view>
          </scroll-view>

          <!-- 右侧子分类 -->
          <scroll-view scroll-y class="sub-category">
            <view class="sub-category-list">
              <view v-for="category in currentSubCategories" :key="category.id" class="sub-category-item"
                :class="{ active: form.categoryId === category.id }" @click="selectSubCategory(category)">
                <view class="category-info">
                  <uni-icons :type="selectedCategoryIcon" size="32" color="#333"></uni-icons>
                  <text>>{{ category.name }}</text>
                </view>

              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import pageNav from '@/components/page-nav.vue'  // 导入组件
import CategoryIcon from '@/components/category-icon.vue'

const categoryPopup = ref(null)
const currentTab = ref(0)
const selectedCategory = ref('')
const currentMainCategory = ref(1)

const form = ref({
  amount: '',
  categoryId: '',
  note: '',
  date: new Date().toLocaleDateString()
})

// 支出分类数据
const expenseCategories = {
  main: [
    { id: 1, name: '餐饮' },
    { id: 2, name: '交通' },
    { id: 3, name: '购物' },
    { id: 4, name: '居家' },
    { id: 5, name: '娱乐' },
    { id: 6, name: '医疗' },
    { id: 7, name: '教育' }
  ],
  sub: {
    1: [ // 餐饮子分类
      { id: 101, name: '早餐', icon: 'clock' },
      { id: 102, name: '午餐', icon: 'clock' },
      { id: 103, name: '晚餐', icon: 'clock' },
      { id: 104, name: '夜宵', icon: 'clock' },
      { id: 105, name: '零食', icon: 'food' },
      { id: 106, name: '饮料', icon: 'cup' }
    ],
    2: [ // 交通子分类
      { id: 201, name: '公交', icon: 'car' },
      { id: 202, name: '地铁', icon: 'car' },
      { id: 203, name: '打车', icon: 'car' },
      { id: 204, name: '加油', icon: 'car' }
    ]
    // ... 其他支出子分类
  }
}

// 收入分类数据
const incomeCategories = {
  main: [
    { id: 1, name: '工资' },
    { id: 2, name: '奖金' },
    { id: 3, name: '理财' },
    { id: 4, name: '兼' },
    { id: 5, name: '其他' }
  ],
  sub: {
    1: [ // 工资子分类
      { id: 101, name: '月薪', icon: 'rmb-circle' },
      { id: 102, name: '年终奖', icon: 'rmb-circle' }
    ],
    2: [ // 奖金子分类
      { id: 201, name: '项目奖金', icon: 'rmb-circle' },
      { id: 202, name: '绩效奖金', icon: 'rmb-circle' }
    ]
    // ... 其他收入子分类
  }
}

// 常用支出分类
const commonExpenseCategories = [
  { id: 101, name: '早餐', icon: 'clock' },
  { id: 102, name: '午餐', icon: 'clock' },
  { id: 103, name: '晚餐', icon: 'clock' },
  { id: 104, name: '夜宵', icon: 'clock' },
  { id: 201, name: '公交', icon: 'car' },
  { id: 202, name: '地铁', icon: 'car' },
  { id: 203, name: '打车', icon: 'car' },
  { id: 204, name: '加油', icon: 'car' }
]

// 常用收入分类
const commonIncomeCategories = [
  { id: 101, name: '月薪', icon: 'rmb-circle' },
  { id: 102, name: '年终奖', icon: 'rmb-circle' },
  { id: 201, name: '项目奖金', icon: 'rmb-circle' },
  { id: 202, name: '绩效奖金', icon: 'rmb-circle' }
]

// 根据当前类型获取主分类
const mainCategories = computed(() => {
  return currentTab.value === 0 ? expenseCategories.main : incomeCategories.main
})

// 根据当前类型和主分类获取子分类
const currentSubCategories = computed(() => {
  const categories = currentTab.value === 0 ? expenseCategories.sub : incomeCategories.sub
  return categories[currentMainCategory.value] || []
})

// 根据当前类型获取常用分类
const commonCategories = computed(() => {
  return currentTab.value === 0 ? commonExpenseCategories : commonIncomeCategories
})

// 添加选中分类的图标计算属性
const selectedCategoryIcon = computed(() => {
  if (!form.value.categoryId) return ''
  // 先从常用分类中查找
  const commonCategory = commonCategories.value.find(c => c.id === form.value.categoryId)
  if (commonCategory) return commonCategory.icon || 'star'

  // 从子分类中查找
  for (const key in expenseCategories.sub) {
    const category = expenseCategories.sub[key].find(c => c.id === form.value.categoryId)
    if (category) return category.icon || 'star'
  }
  return 'star'
})

// 修改选择分类的方法
const selectCategory = (category) => {
  form.value.categoryId = category.id
  selectedCategory.value = category.name
}

// 选择主分类
const selectMainCategory = (id) => {
  currentMainCategory.value = id
}

// 修改子分类选择的方法
const selectSubCategory = (category) => {
  form.value.categoryId = category.id
  selectedCategory.value = category.name
  closeCategoryPopup()
}

// 显示全部分类
const showAllCategories = () => {
  if (categoryPopup.value) {
    categoryPopup.value.open()
  }
}

// 关闭分类弹出层
const closeCategoryPopup = () => {
  if (categoryPopup.value) {
    categoryPopup.value.close()
  }
}

const inputNumber = (num) => {
  if (form.value.amount === '0' && num !== '.') {
    form.value.amount = num
  } else {
    form.value.amount += num
  }
}

const deleteNumber = () => {
  form.value.amount = form.value.amount.slice(0, -1)
}

// 表单验证
const validateForm = () => {
  if (!form.value.categoryId) {
    uni.showToast({
      title: '请选择分类',
      icon: 'none'
    })
    return false
  }
  if (!form.value.amount || form.value.amount === '0') {
    uni.showToast({
      title: '请输入金额',
      icon: 'none'
    })
    return false
  }
  if (!selectedMember.value) {
    uni.showToast({ title: '请选择消费人', icon: 'none' })
    return false
  }
  if (!selectedConsumeType.value) {
    uni.showToast({ title: '请选择消费类型', icon: 'none' })
    return false
  }
  return true
}

// 重置表单
const resetForm = () => {
  form.value = {
    amount: '',
    categoryId: '',
    note: '',
    date: new Date().toLocaleDateString()
  }
  selectedCategory.value = ''
}

// 保存并返回首页
const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    // TODO: 发送请求到后端
    // const res = await api.saveBill(form.value)

    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })

    // 回首页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    uni.showToast({
      title: '保存失败',
      icon: 'error'
    })
  }
}

// 保存并继续记账
const saveAndContinue = async () => {
  if (!validateForm()) return

  try {
    // TODO: 发送请求到后端
    // const res = await api.saveBill(form.value)

    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })

    // 重置表单
    resetForm()
  } catch (error) {
    uni.showToast({
      title: '保存失败',
      icon: 'error'
    })
  }
}

const showCalculator = () => {
  // 显示计算器
}

// 打开日期选择器
const openCalendar = () => {
  showCalendar.value = true
  console.log('openCalendar', showCalendar.value)
}

// 添加切换标签的方法
const switchTab = (index) => {
  // 如果已经选中了分类，切换类型时需要清空选择
  if (currentTab.value !== index && form.value.categoryId) {
    form.value.categoryId = ''
    selectedCategory.value = ''
  }
  currentTab.value = index
}

// 添加成员和消费类型数据
const members = [
  { id: 1, name: '爸爸' },
  { id: 2, name: '妈妈' },
  { id: 3, name: '我' }
]

const consumeTypes = [
  { id: 1, name: '个人消费' },
  { id: 2, name: '家庭开支' },
  { id: 3, name: '其他支出' }
]

const selectedMember = ref(null)
const selectedConsumeType = ref(null)

const handleMemberChange = (e) => {
  selectedMember.value = members[e.detail.value]
}

const handleTypeChange = (e) => {
  selectedConsumeType.value = consumeTypes[e.detail.value]
}

// 弹出层关闭事件处理
const onPopupChange = (e) => {
  if (!e.show) {
    closeCategoryPopup()
  }
}

const datePopup = ref(null)

// 打开日期选择弹窗
const openDatePopup = () => {
  datePopup.value.open()
}

// 关闭日期选择弹窗
const closeDatePopup = () => {
  datePopup.value.close()
}

// 修改日期选择处理函数
const handleDateSelect = (e) => {
  if (e.range && e.range[0]) {
    form.value.date = formatDate(e.range[0])
    closeDatePopup()
  }
}

// 日期选择改变处理
const onDateChange = (e) => {
  form.value.date = new Date(e.detail.value).toLocaleDateString()
}

// 在其他方法的同级添加 goBack 方法
const goBack = () => {
  uni.navigateBack({
    delta: 1
  })
}
</script>

<style lang="scss">
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: env(safe-area-inset-bottom);
}

.type-tabs {
  padding: 20rpx 0;
  position: relative;

  .tabs-wrapper {
    display: flex;
    position: relative;
    width: 200rpx; // 调整宽度以适应两个标签
  }

  .tab-item {
    flex: 1;
    text-align: center;
    font-size: 32rpx;
    color: #666;
    padding: 16rpx 0;
    position: relative;
    z-index: 1;
    transition: all 0.3s ease;

    &.active {
      color: #2878ff;
      font-weight: 500;
    }
  }

  .tab-line {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 4rpx;
    background: #2878ff;
    transition: transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
    border-radius: 4rpx;
  }
}

.category-select {
  margin: 30rpx 0;
  font-size: 32rpx;
  color: #333;

  .category-info {
    display: flex;
    align-items: center;
    gap: 12rpx;

    text {
      font-size: 32rpx;
      color: #333;
      font-weight: 500;
    }
  }
}

.amount-input {
  margin: 20rpx 0 40rpx;

  .currency {
    font-size: 40rpx;
    color: #333;
    margin-right: 10rpx;
  }

  .amount {
    font-size: 48rpx;
    color: #333;
    font-weight: 500;
  }
}

.category-section {
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .more {
      color: #999;
      // font-size: 26rpx;
    }
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30rpx;
    padding: 20rpx;

    .category-item {
      display: flex;
      // flex-direction: row; // 改为水平布局
      // align-items: center; // 垂直居中
      // justify-content: center;
      // padding: 12rpx;
      // border-radius: 8rpx;

      &.active {
        background-color: rgba(40, 120, 255, 0.1); // 选中时的浅蓝色背景

        // text {
        //   color: #2878ff;
        // }
      }
    }
  }
}

.form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 0;
  border-bottom: 1rpx solid #eee;

  .label {
    font-size: 28rpx;
    color: #333;
  }

  .value {
    display: flex;
    align-items: center;
    gap: 10rpx;
    font-size: 28rpx;
    color: #666;
  }

  .remark-input {
    flex: 1;
    font-size: 28rpx;
    color: #333;
    text-align: right;
  }
}

.bottom-text {
  text-align: center;
  padding: 30rpx 0;
  font-size: 28rpx;
  color: #666;
}

.number-keyboard {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #f5f5f5;
  padding: 10rpx;

  .keyboard-row {
    display: flex;
    gap: 6rpx;
    margin-bottom: 6rpx;

    .key {
      flex: 1;
      height: 80rpx;
      background: #fff;
      border-radius: 6rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      color: #333;

      &:active {
        opacity: 0.7;
      }

      &.save {
        background: #f0f7ff;
        color: #2878ff;
        font-size: 26rpx;

        &.main {
          background: #2878ff;
          color: #fff;
        }

        &:active {
          opacity: 0.8;
        }
      }
    }
  }
}

.category-popup {
  height: 85vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 100;

  .popup-header {
    background: #fff;
    display: flex;
    align-items: center;
    padding: 24rpx 30rpx;
    border-bottom: 1rpx solid #f5f5f5;

    .left,
    .right {
      width: 80rpx;
      display: flex;
      align-items: center;
    }

    .center {
      flex: 1;
      text-align: center;
      font-size: 32rpx;
      font-weight: 500;
    }
  }

  .category-content {
    background: #fff;
    flex: 1;
    display: flex;
    overflow: hidden;

    .main-category {
      width: 160rpx;
      height: 100%;
      background: #f8f9fa;

      &-item {
        position: relative;
        padding: 32rpx 20rpx;
        text-align: center;
        font-size: 28rpx;
        color: #666;
        transition: all 0.3s;

        .active-bar {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%) scaleY(0);
          width: 6rpx;
          height: 36rpx;
          background: #2878ff;
          border-radius: 6rpx;
          transition: transform 0.3s;
        }

        &.active {
          color: #2878ff;
          font-weight: 500;
          background: #fff;

          .active-bar {
            transform: translateY(-50%) scaleY(1);
          }
        }
      }
    }

    .sub-category {
      flex: 1;
      height: 100%;
      background: #fff;

      &-list {
        padding: 20rpx;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20rpx;
      }

      &-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        padding: 16rpx;
        transition: all 0.3s;

        text {
          margin-left: 12rpx;
          font-size: 26rpx;
          color: #333;
          transition: all 0.3s;
        }

        &.active {
          background: rgba(40, 120, 255, 0.1);
          border-radius: 8rpx;

          text {
            color: #2878ff;
            font-weight: 500;
          }
        }

        &:active {
          transform: scale(0.95);
        }
      }
    }
  }
}

// 添加过渡动画样式
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateY(0);
}

.u-popup {
  background: #fff !important;
}

.u-popup__content {
  background: #fff !important;
}

// 添加内容切换动画
.category-section {
  transition: opacity 0.3s ease;

  &.fade-enter-active,
  &.fade-leave-active {
    transition: opacity 0.3s ease;
  }

  &.fade-enter-from,
  &.fade-leave-to {
    opacity: 0;
  }
}

.popup-content {
  background-color: #fff;

  .popup-header {
    padding: 20rpx 30rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;

    text {
      font-size: 32rpx;
      font-weight: 500;
    }

    .close-btn {
      padding: 10rpx;
    }
  }
}
</style>