<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<page-nav title="我的"></page-nav>
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
	ref
} from 'vue';

const currentBookId = ref(1);
const newBookName = ref('');
const createBookPopup = ref(null);

// Mock数据
const accountBooks = ref([{
	id: 1,
	name: '我的账本',
	role: '个人账本'
},
{
	id: 2,
	name: '家庭账本',
	role: '管理员'
},
]);

const closePopup = () => {
	createBookPopup.value.close();
	newBookName.value = '';
};

const createBook = () => {
	if (!newBookName.value) {
		uni.showToast({
			title: '请输入账本名称',
			icon: 'none',
		});
		return;
	}

	accountBooks.value.push({
		id: Date.now(),
		name: newBookName.value,
		role: '管理员',
	});

	closePopup();
};

const switchBook = (book) => {
	currentBookId.value = book.id;
};
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
</style>