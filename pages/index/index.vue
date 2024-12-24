<template>
  <view class="container">
    <page-nav :title="currentAccount?.name || '账单'" />

    <!-- 月度统计 -->
    <view class="month-summary" v-if="!isLoading && !isEmpty">
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
    <view v-if="!isLoading && !isEmpty" class="bill-list">
      <view v-for="(group, date) in groupedBills" :key="date">
        <view class="date-header">
          <view class="date-info">
            <text class="date">{{ formatDate(date) }}</text>
            <text class="summary">收入 {{ getDayIncome(group) }} 支出 {{ getDayExpense(group) }}</text>
          </view>
        </view>

        <view class="bill-items">
          <view v-for="bill in group" :key="bill.id" class="bill-item">
            <view class="bill-info">
              <category-icon :type="bill.type" :text="bill.note" />
              <view class="bill-details">
                <view class="primary-info">
                  <text class="category-name">{{ bill.note || '未命名' }}</text>
                  <text class="amount" :class="{ 'income': bill.type === 'income' }">
                    {{ bill.type === 'income' ? '+' : '-' }}{{ bill.amount || 0 }}
                  </text>
                </view>
                <view class="secondary-info">
                  <text class="time">{{ bill.time || '未知时间' }}</text>
                  <text class="payment-method">{{ bill.paymentMethod || '未指定' }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载中状态 -->
    <view v-else-if="isLoading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <uni-notice-bar single text="暂无账单，赶快添加一笔吧！" color="#007AFF" background-color="#F0F8FF" />
    </view>

    <!-- 添加按钮 -->
    <view class="add-btn" @click="goToAdd">
      <uni-icons type="plusempty" size="28" color="#FFFFFF" />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, reactive, toRefs } from 'vue';
import CategoryIcon from '@/components/category-icon.vue';
import { handleWxLogin } from '@/api/auth';
import { billService } from '@/api/bill';
import { billRecordsService } from '@/api/billRecords';

const currentAccount = ref({});
const billRecordList = ref([]);
const total = ref(0);
const loading = ref(false);
const monthlyBalance = ref(0);
const monthlyIncome = ref(0);
const monthlyExpense = ref(0);

const data = reactive({
  queryParams: {
    page: 1,
    pageNum: 10,
    isAsc: 'desc',
    orderByColumn: 'createTime',
    billId: undefined,
  },
});
const { queryParams } = toRefs(data);

/** 计算页面状态 */
const isLoading = computed(() => loading.value);
const isEmpty = computed(() => !isLoading.value && (billRecordList.value?.length || 0) === 0);

/** 查询账单记录列表 */
async function getList() {
  try {
    loading.value = true;
    const response = await billRecordsService.getBillRecordsPage(queryParams.value);
    billRecordList.value = response?.records || [];
    total.value = response?.total || 0;
  } catch (error) {
    console.error('获取账单记录列表失败：', error);
  } finally {
    loading.value = false;
  }
}

/** 跳转到添加页面 */
function goToAdd() {
  uni.navigateTo({
    url: '/pages/add/index',
  });
}

/** 获取账户账单信息 */
async function getAccountBills() {
  try {
    const response = await billService.getBills();
    const accounts = response?.data?.records || [];
    currentAccount.value = accounts.find((account) => account.isDefault) || {};
    queryParams.value.billId = currentAccount.value.id;
    await getList();
  } catch (error) {
    console.error('获取账户账单信息失败：', error);
  }
}

onMounted(async () => {
  try {
    const token = uni.getStorageSync('token');
    if (!token) {
      await handleWxLogin();
    }
    await getAccountBills();
  } catch (error) {
    console.error('初始化失败：', error);
  }
});
</script>

<style lang="scss">
@import '@/styles/pages/index.scss';

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 16px;
  color: #999;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.add-btn {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background-color: #007AFF;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
