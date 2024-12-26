<template>
    <view class="container">
        <!-- 顶部导航栏 -->
        <page-nav title="账单分类管理" showBack="true"></page-nav>
        <view class="tab-bar">
            <view class="tab-bar-item" :class="{ active: currentTab === 'expense' }" @click="switchTab('expense')">
                支出
            </view>
            <view class="tab-bar-item" :class="{ active: currentTab === 'income' }" @click="switchTab('income')">
                收入
            </view>

        </view>

        <uni-list>
            <uni-list-item v-for="(item, index) in categoryList" :key="index" :title="item.name"
                @click="() => editCategory(item)">

            </uni-list-item>
        </uni-list>
        <uni-row class="demo-uni-row" :gutter="gutter" :width="nvueWidth" @click="addCategory">
            <uni-col :span="12" :offset="6">
                <button type="primary" @click="addCategory">新增分类</button>
            </uni-col>
        </uni-row>


        <uni-popup ref="popup" type="center" background-color="#fff">
            <view class="popup-content">
                <uni-title type="h1" :title="popupTitle" color="#027fff"></uni-title>

                <uni-forms ref="form" :modelValue="modelValue" label-position="top" label-width="300">
                    <uni-forms-item name="name" label="分类名称" required>
                        <uni-easyinput v-model="modelValue.name" placeholder="分类名称" />
                    </uni-forms-item>
                    <uni-forms-item name="sort" label="排序(越小越靠前)" required>
                        <uni-number-box v-model="modelValue.sort" @change="changeValue" />
                    </uni-forms-item>
                    <uni-forms-item name="isCommon" label="是否常用" required>
                        <uni-data-checkbox v-model="modelValue.isCommon" :localdata="commonTypes" />
                    </uni-forms-item>
                    <view class="button-container">
                        <button type="primary" @click="saveModelValue">保存</button>
                        <button @click="closePopup">取消</button>
                    </view>
                </uni-forms>
            </view>
        </uni-popup>

    </view>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { categoryService } from '@/api/category';

const currentTab = ref('expense');
const categoryList = ref([]);
const defaultBillId = ref(uni.getStorageSync('defaultBillId'));
const popup = ref(null);
const form = ref(null);
const popupTitle = ref('添加分类');
const listQuery = ref({
    pageNum: 1,
    pageSize: 100,
    billId: defaultBillId.value,
    type: currentTab.value
});
const commonTypes = [
    { text: '是', value: 1 },
    { text: '否', value: 0 }
];
const modelValue = reactive({
    id: null,
    name: '',
    type: currentTab.value,
    sort: 0,
    isCommon: 0,
    billId: defaultBillId.value
})

onMounted(async () => {
    await getCategoryList();
    console.log(defaultBillId.value)
});

async function getCategoryList() {
    const { data } = await categoryService.getPage(listQuery.value);
    categoryList.value = data.records;
}

async function switchTab(tab) {
    currentTab.value = tab;
    listQuery.value.type = tab;
    getCategoryList();
}

function closePopup() {
    if (popup.value) {
        popup.value.close();
    }
}

function openPopup() {
    if (popup.value) {
        popup.value.open();
    }
}

function editCategory(item) {
    // 编辑分类逻辑
    popupTitle.value = "编辑分类";
    console.log(bill);
    // 直接更新 currentBill 对象的每个字段
    Object.assign(modelValue, item);
    openPopup();
}

function addCategory() {
    if (form.value) {
        form.value.clearValidate();
    }
    popupTitle.value = "添加分类";
    openPopup();
}

async function saveModelValue() {
    try {
        if (form.value) {
            await form.value.validate();
        }
        if (!modelValue.name) {
            uni.showToast({
                title: '分类名称不能为空',
                icon: 'none'
            });
            return;
        }
        if (modelValue.id) {
            await categoryService.update(modelValue);
        } else {
            await categoryService.save(modelValue);
        }
        // 弹窗提示保存成功
        uni.showToast({
            title: '保存成功',
            icon: 'success'
        });
        // 刷新账单列表
        getCategoryList();
        closePopup();
    } catch (error) {
        console.error('保存失败：', error);
    }
}
// 删除
function deleteModel(id) {
    uni.showModal({
        title: '提示',
        content: '确定要删除该数据吗？',
        success: async (res) => {
            if (res.confirm) {
                try {
                    await categoryService.delete(id);
                    uni.showToast({
                        title: '删除成功',
                        icon: 'success'
                    });
                    // 刷新账单列表
                    getCategoryList();
                } catch (error) {
                    console.error('删除失败：', error);
                }
            }
        }
    })
}

</script>

<style scoped>
.tab-bar {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
    border-bottom: 1px solid #ccc;
}

.tab-bar-item {
    padding: 10px 20px;
    cursor: pointer;
}

.tab-bar-item.active {
    border-bottom: 2px solid #007aff;
    font-weight: bold;
    color: #007aff;
}
</style>