<template>
    <view class="container">
        <!-- 顶部导航栏 -->
        <page-nav title="账本管理" showBack="true"></page-nav>
        <uni-row class="demo-uni-row" @click="addBill">
            <uni-card :is-shadow="false" @click="addBill">
                <uni-title type="h2" title="增加账本" align="center">
                </uni-title>
            </uni-card>
        </uni-row>
        <uni-row class="demo-uni-row" v-for="(bill, index) in bills" :key="bill.id">
            <uni-card :is-shadow="false">
                <template v-slot:title>
                    <uni-list>
                        <uni-list-item :show-switch="true" :switchChecked="bill.isDefault"
                            @switchChange="updateBefault(bill)" :title="`${bill.name}-${getBillType(bill.type)}`" :disabled="bill.isDefault" />
                    </uni-list>
                </template>
                <view slot="actions" class="card-actions">
                    <view v-if="bill.type == 'more'" class="card-actions-item">
                        <uni-icons type="personadd-filled" size="18" color="#999"></uni-icons>
                        <text class="card-actions-item-text">{{ bill.inviteCode }}</text>
                    </view>
                    <view class="card-actions-item" @click="editBill(bill)">
                        <uni-icons type="gear-filled" size="18" color="#999"></uni-icons>
                        <text class="card-actions-item-text">编辑</text>
                    </view>
                    <view class="card-actions-item" :disabled="bill.isDefault" @click="deleteBill(bill.id)">
                        <uni-icons type="trash" size="18" color="#999"></uni-icons>
                        <text class="card-actions-item-text">删除</text>
                    </view>
                </view>
            </uni-card>
        </uni-row>
    </view>

    <uni-popup ref="popup" type="center" background-color="#fff">
        <view class="popup-content">
            <uni-title type="h1" :title="popupTitle" color="#027fff"></uni-title>

            <uni-forms ref="form" :modelValue="currentBill" label-position="top" label-width="300">
                <uni-forms-item name="name" label="账本名称" required>
                    <uni-easyinput v-model="currentBill.name" placeholder="账本名称" />
                </uni-forms-item>
                <uni-forms-item name="type" label="账本类型" required>
                    <uni-data-checkbox v-model="currentBill.type" :localdata="billTypes" />
                </uni-forms-item>
                <uni-forms-item name="isDefault" label="是否默认账本" required>
                    <uni-data-checkbox v-model="currentBill.isDefault" :localdata="defaultTypes" />
                </uni-forms-item>
                <view class="button-container">
                    <button type="primary" @click="saveBill">保存</button>
                    <button @click="closePopup">取消</button>
                </view>
            </uni-forms>
        </view>
    </uni-popup>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { billService } from '@/api/bill';
const popup = ref(null);
const form = ref(null);
const bills = ref([])
const popupTitle = ref('添加账本');
const currentBill = reactive({
    id: null,
    name: '',
    type: '',
    isDefault: false
});
const billTypes = [
    { text: '个人', value: 'one' },
    { text: '多人', value: 'more' }
];
const defaultTypes = [
    { text: '是', value: true },
    { text: '否', value: false }
];

function getBillType(type) {
    return billTypes.find(item => item.value === type)?.text || '';
}   

function addBill() {
    if (form.value) {
        form.value.clearValidate();
    }
    popupTitle.value = "添加账本";
    if (popup.value) {
        popup.value.open();
    }
}

function editBill(bill) {
    popupTitle.value = "编辑账本";
    console.log(bill);
    // 直接更新 currentBill 对象的每个字段
    Object.assign(currentBill, bill);
    if (popup.value) {
        popup.value.open();
    }
}

function closePopup() {
    if(popup.value){
        popup.value.close();
    }
}

async function saveBill() {
    try {
        if (form.value) {
            await form.value.validate();
        }
        if (currentBill.id) {
            await billService.updateBill(currentBill);
        } else {
            await billService.createBill(currentBill);
        }
        // 弹窗提示保存成功
        uni.showToast({
            title: '保存成功',
            icon: 'success'
        });
        // 刷新账单列表
        getAccountBills();
        // 保存账本逻辑
        if (popup.value) {
            popup.value.close();
        }
    } catch (error) {
        console.error('保存账本失败：', error);
    }
}
// 删除
function deleteBill(id) {
    uni.showModal({
        title: '提示',
        content: '确定要删除该账本吗？',
        success: async (res) => {
            if (res.confirm) {
                try {
                    await billService.deleteBill(id);
                    uni.showToast({
                        title: '删除成功',
                        icon: 'success'
                    });
                    // 刷新账单列表
                    getAccountBills();
                } catch (error) {
                    console.error('删除账本失败：', error);
                }
            }
        }
    })
}

// 更新默认状态
async function updateBefault(bill) {
    if (bill.isDefault) {
        uni.showToast({
            title: '必须要选择一个默认账本',
            icon: 'none'
        });
        // 刷新账单列表
        getAccountBills();
        return;
    }
    try {
        await billService.updateDefault(bill.id);
        // 刷新账单列表
        getAccountBills();
    } catch (error) {
        // 恢复开关状态
        bill.isDefault = !bill.isDefault;
        console.error('更新默认状态失败：', error);
    }
}

/** 获取账户账单信息 */
async function getAccountBills() {
    try {
        const response = await billService.getBills();
        const billList = response?.data?.records || [];
        bills.value = billList;
        // 设置默认账本
        if (billList.length > 0) {
            const defaultBill = billList.find(item => item.isDefault);
            if (defaultBill) {
                uni.setStorageSync('defaultBillId', defaultBill.id);
            }
        }
    } catch (error) {
        console.error('获取账户账单信息失败：', error);
    }
}

onMounted(() => {
    getAccountBills();
})

</script>


<style scoped>
/* Add your styles here */

.card-actions {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    height: 30px;
}

.card-actions-item {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.card-actions-item-text {
    font-size: 12px;
    color: #666;
    margin-left: 5px;
}







</style>