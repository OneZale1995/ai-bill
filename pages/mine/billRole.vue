<template>
    <view class="container">
        <!-- 顶部导航栏 -->
        <page-nav title="消费角色管理" showBack="true"></page-nav>

        <view class="content">
            <view class="custom-list">
                <view class="list-item" v-for="(item, index) in dataList" :key="index">
                    <!-- 左侧：星星和名称 -->
                    <view class="item-left">
                        <view v-if="item.isDefault" class="star-wrapper common"
                            @click.stop="toggleCommon(item)">
                            <text class="star-text">默认</text>
                        </view>
                        <text class="item-text">{{ item.roleName }}</text>
                    </view>
                    <!-- 右侧：编辑和删除 -->
                    <view class="item-right">
                        <view class="action-wrapper" @click.stop="editModel(item)">
                            <uni-icons type="gear" size="18" class="icon"></uni-icons>
                            <text class="action-text">编辑</text>
                        </view>
                        <view class="action-wrapper" @click.stop="deleteModel(item.id)">
                            <uni-icons type="trash" size="18" class="icon"></uni-icons>
                            <text class="action-text">删除</text>
                        </view>
                    </view>
                </view>
            </view>
            <uni-row style="margin-top: 30px;" class="demo-uni-row uni-mt-7" :gutter="gutter" :width="nvueWidth"
                @click="addCategory">
                <uni-col :span="12" :offset="6">
                    <button type="primary" @click="addModel">新增角色</button>
                </uni-col>
            </uni-row>

        </view>




        <uni-popup ref="popup" type="center" background-color="#fff">
            <view class="popup-content">
                <uni-title type="h1" :title="popupTitle" color="#027fff"></uni-title>

                <uni-forms ref="form" :modelValue="modelValue" label-position="top" label-width="300">
                    <uni-forms-item name="name" label="名称" required>
                        <uni-easyinput v-model="modelValue.roleName" placeholder="名称" />
                    </uni-forms-item>
                    <uni-forms-item name="isDefault" label="是否默认" required>
                        <uni-data-checkbox v-model="modelValue.isDefault" :localdata="commonTypes" />
                    </uni-forms-item>
                    <view class="button-container">
                        <button @click="closePopup">取消</button>
                        <button type="primary" @click="saveModelValue">保存</button>
                    </view>
                </uni-forms>
            </view>
        </uni-popup>

    </view>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { billRoleService } from '@/api/billRole';

const gutter = ref(0);
const nvueWidth = ref(730);
const dataList = ref([]);
const defaultBillId = ref(uni.getStorageSync('defaultBillId'));
const popup = ref(null);
const form = ref(null);
const popupTitle = ref('添加角色');
const listQuery = ref({
    pageNum: 1,
    pageSize: 100,
    billId: defaultBillId.value,
});
const commonTypes = [
    { text: '是', value: true },
    { text: '否', value: false }
];
const modelValue = reactive({
    id: null,
    roleName: '',
    sort: 0,
    isDefault: 0,
    billId: defaultBillId.value
})

onMounted(async () => {
    await getDataList();
});

async function getDataList() {
    const { data } = await billRoleService.getPage(listQuery.value);
    dataList.value = data.records;
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

function editModel(item) {
    popupTitle.value = "编辑角色";
    Object.assign(modelValue, item);
    openPopup();
}

function addModel() {
    if (form.value) {
        form.value.clearValidate();
    }
    modelValue.id = null;
    modelValue.roleName = '';
    modelValue.isDefault = 0;
    modelValue.billId = defaultBillId.value;
    popupTitle.value = "添加角色";
    openPopup();
}

async function saveModelValue() {
    try {
        if (form.value) {
            await form.value.validate();
        }
        if (!modelValue.roleName) {
            uni.showToast({
                title: '角色名称不能为空',
                icon: 'none'
            });
            return;
        }
        if (modelValue.id) {
            await billRoleService.update(modelValue);
        } else {
            await billRoleService.save(modelValue);
        }
        // 弹窗提示保存成功
        uni.showToast({
            title: '保存成功',
            icon: 'success'
        });
        // 刷新账单列表
        getDataList();
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
                    await billRoleService.delete(id);
                    uni.showToast({
                        title: '删除成功',
                        icon: 'success'
                    });
                    // 刷新账单列表
                    getDataList();
                } catch (error) {
                    console.error('删除失败：', error);
                }
            }
        }
    })
}

</script>

<style scoped>
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

/* 页面内容 */
.content {
    margin-top: 50px;
    padding: 10px;
    background-color: #f9f9f9;
    border-radius: 8px;
}

/* 整个列表容器 */
.custom-list {
    padding: 15px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 单个列表项 */
.list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    margin-bottom: 12px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 左侧区域：星星和文字 */
.item-left {
    display: flex;
    align-items: center;
    gap: 10px;
}

/* 自定义星星样式 */
.star-wrapper {
    padding: 6px 10px;
    border-radius: 4px;
    background-color: #e0e0e0;
    color: #666;
    font-size: 10px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s;
}

.star-wrapper.common {
    background-color: #027fff;
    color: #ffffff;
}

.star-wrapper:hover {
    background-color: #00bcd4;
    color: #fff;
}

/* 分类名称 */
.item-text {
    font-size: 15px;
    color: #333;
    font-weight: 600;
}

/* 右侧操作区域 */
.item-right {
    display: flex;
    gap: 20px;
}

/* 操作按钮容器 */
.action-wrapper {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.action-wrapper:hover .icon,
.action-wrapper:hover .action-text {
    color: #027fff;
}

/* 图标样式 */
.icon {
    color: #666;
    font-size: 10px;
}

/* 按钮文字样式 */
.action-text {
    font-size: 12px;
    color: #666;
    transition: color 0.3s;
}

/* 弹窗内容样式 */
.popup-content {
    padding: 20px;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.popup-content .uni-title {
    color: #027fff;
    font-size: 20px;
    font-weight: bold;
}

/* 表单项 */
.uni-forms-item {
    margin-bottom: 15px;
}

/* 按钮样式 */
button {
    padding: 5px 10px;
    border-radius: 4px;
    background-color: #027fff;
    color: white;
    font-size: 12px;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s;
}

button:hover {
    background-color: #00bcd4;
}
</style>