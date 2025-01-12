<template>
    <view class="container">
        <page-nav title="简记同享"></page-nav>
        <view class="form-container">
            <uni-forms ref="form" :model="form" :rules="rules">
                <uni-forms-item label="昵称" name="nickname">
                    <uni-easyinput v-model="form.nickname" placeholder="请输入昵称" class="input"></uni-easyinput>
                </uni-forms-item>
                <uni-forms-item label="邀请码" name="inviteCode">
                    <uni-easyinput v-model="form.inviteCode" placeholder="请输入邀请码" class="input"></uni-easyinput>
                </uni-forms-item>
                <view class="button-group">
                    <button class="button" type="primary" @click="joinBill">加入账本</button>
                    <button class="button" type="default" @click="createBill">创建新账本</button>
                </view>
            </uni-forms>
        </view>
    </view>
</template>

<script setup>
import { ref } from 'vue';
import { billService } from '@/api/bill';

const form = ref({
    nickname: '',
    inviteCode: ''
});

const rules = {
    nickname: {
        required: true,
        message: '请输入昵称',
        trigger: 'blur'
    },
    inviteCode: {
        required: true,
        message: '请输入邀请码',
        trigger: 'blur'
    }
};

const formRef = ref(null);

async function joinBill() {
    formRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const res = await billService.joinBill({
                    nickname: form.value.nickname,
                    inviteCode: form.value.inviteCode
                });
                if (res.success) {
                    uni.showToast({
                        title: '加入成功',
                        icon: 'success'
                    });
                    // 跳转到主页面
                    uni.navigateTo({
                        url: '/pages/mine/index'
                    });
                } else {
                    uni.showToast({
                        title: res.message,
                        icon: 'none'
                    });
                }
            } catch (error) {
                uni.showToast({
                    title: '加入失败',
                    icon: 'none'
                });
            }
        }
    });
}

async function createBill() {
    if (!form.value.nickname) {
        uni.showToast({
            title: '请输入昵称',
            icon: 'none'
        });
        return;
    }
    try {
        const res = await billService.createBill({
            nickname: form.value.nickname
        });
        if (res.success) {
            uni.showToast({
                title: '创建成功',
                icon: 'success'
            });
            // 跳转到主页面
            uni.navigateTo({
                url: '/pages/mine/index'
            });
        } else {
            uni.showToast({
                title: res.message,
                icon: 'none'
            });
        }
    } catch (error) {
        uni.showToast({
            title: '创建失败',
            icon: 'none'
        });
    }
}
</script>

<style lang="scss">
@import '@/styles/pages/index.scss';

// .container {
//     background-color: #f0f5ff; /* 浅蓝色背景 */
//     padding: 20px;
//     min-height: 100vh;
// }

.form-container {
    background-color: white;
    padding: 30px;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    margin-top: 20px;
}

.uni-forms-item {
    margin-bottom: 20px;
}

.input {
    background-color: transparent; 
    border: none; 
    // border-bottom: 2px solid #409eff; /* 仅底部边线 */
    padding: 10px;
    font-size: 14px;
    color: #333;
    outline: none;
}

.input:focus {
    border-bottom: 2px solid #66b1ff; /* 聚焦时底部边线颜色 */
}

.button-group {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
}

.button {
    width: 48%;
    padding: 14px;
    border-radius: 8px;
    font-size: 16px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
}



</style>
