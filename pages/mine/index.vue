<template>
	<view class="container">
		<!-- 顶部导航栏 -->
		<page-nav title="我的"></page-nav>

		<uni-section title="账本管理" type="line">
			<uni-card title="默认账本" extra="个人">
				<text>点击进入分类管理</text>
				<view slot="actions" class="card-actions">
					<view class="card-actions-item" @click="actionsClick('分享')">
						<uni-icons type="pengyouquan" size="18" color="#999"></uni-icons>
						<text class="card-actions-item-text">邀请好友</text>
					</view>
					<view class="card-actions-item" @click="actionsClick('点赞')">
						<uni-icons type="heart" size="18" color="#999"></uni-icons>
						<text class="card-actions-item-text">设为默认</text>
					</view>
					<view class="card-actions-item" @click="actionsClick('评论')">
						<uni-icons type="gear" size="18" color="#999"></uni-icons>
						<text class="card-actions-item-text">编辑</text>
					</view>
				</view>
			</uni-card>
		</uni-section>


		<!-- 创建账本弹窗 -->
		<uni-popup ref="createBookPopup" type="center" :mask-click="false">
			<view class="popup-content">
				<text class="popup-title">创建家庭账本</text>
				<uni-easyinput v-model="newBookName" placeholder="请输入账本名称" clearable maxlength="20" class="input" />
				<view class="popup-btns">
					<view class="btn btn-default" @click="closePopup">取消</view>
					<view class="btn btn-primary" @click="createBook">创建</view>
				</view>
			</view>
		</uni-popup>
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