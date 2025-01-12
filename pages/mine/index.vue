<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<page-nav title="我的"></page-nav>
		
		<!-- 邀请码卡片 -->
		<view class="invite-card" v-if="billInfo.type == 'more'" @click="copyInviteCode">
			<text>邀请码: {{ billInfo.inviteCode }}</text>
		</view>

		<uni-section title="账本常用管理" type="line">
			<uni-list>
				<uni-list-item showArrow :to="`./bill`" @click="onClick" title="账本管理"></uni-list-item>
				<uni-list-item showArrow :to="`./category`" @click="onClick" title="账单分类管理"></uni-list-item>
				<uni-list-item showArrow :to="`./billRole`" @click="onClick" title="消费角色管理"></uni-list-item>
				<uni-list-item showArrow :to="`./billPlatform`" @click="onClick" title="消费平台管理"></uni-list-item>
			</uni-list>
		</uni-section>
	</view>
</template>

<script setup>
import {
	ref,
	onMounted
} from 'vue';
import { onShow } from '@dcloudio/uni-app';
import {
	billService
} from '@/api/bill';
const billId = ref(uni.getStorageSync('defaultBillId'))

const billInfo = ref({})

async function getBillInfo(){
	const params = {
		billId: billId.value // Accessing value as a property
	}
	const res = await billService.getBills(params)
	const data = res.data;
	if(data){
		billInfo.value = data.records[0]
	}
}
function copyInviteCode() {
    if (billInfo.value.inviteCode) {
        uni.setClipboardData({
            data: billInfo.value.inviteCode,
            success: function () {
                uni.showToast({
                    title: '邀请码已复制',
                    icon: 'success'
                });
            },
            fail: function () {
                uni.showToast({
                    title: '复制失败',
                    icon: 'none'
                });
            }
        });
    }
}

onMounted( async () => {
	getBillInfo()
})

onShow( async () => {
	getBillInfo()
})

</script>

<style lang="scss">
.card-actions {
	display: flex;
	flex-direction: row;
	justify-content: space-around;
	align-items: center;
	height: 45px;
	border-top: 1px #eee solid;
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

.invite-card {
	background-color: #f9f9f9;
	padding: 10px;
	margin: 10px 0;
	border-radius: 5px;
	text-align: center;
	font-size: 16px;
	color: #333;
}
</style>