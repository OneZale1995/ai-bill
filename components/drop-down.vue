<template>
  <view class="dropdown-container">
    <view ref="wrapperEl" class="dropdown-wrapper" @tap="toggleDropdown">
      <text class="dropdown-text">{{ selectedText || placeholder }}</text>
      <uni-icons type="down" size="18"></uni-icons>
    </view>
    <view v-show="showDropdown" class="dropdown-list" :style="dropdownPosition">
      <scroll-view scroll-y="true" class="dropdown-scroll">
        <view 
          v-for="(item, index) in options" 
          :key="index" 
          class="dropdown-item"
          @tap="selectItem(item)"
        >
          {{ item }}
        </view>
        <view v-if="enableAddOption" class="dropdown-item add-option">
          <input 
            v-model="newOption" 
            placeholder="输入新增选项" 
            class="add-option-input"
            @blur="addNewOption"
          />
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, computed, onMounted, nextTick, onUnmounted } from 'vue';

// Props
const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "请选择",
  },
  enableAddOption: {
    type: Boolean,
    default: true,
  },
  selected: {
    type: String,
    default: "",
  }
});

// Emits
const emit = defineEmits(['update:selected', 'update:options']);

// Reactive data
const showDropdown = ref(false);
const selectedText = ref(props.selected);
const newOption = ref("");
const dropdownPosition = ref({});
let wrapperEl = ref(null);
// 用于判断是否正在进行动画过渡，避免频繁操作
let isTransitioning = ref(false);

// Computed properties
const systemInfo = computed(() => uni.getSystemInfoSync());
const viewportHeight = computed(() => systemInfo.value.screenHeight);

// Methods
const toggleDropdown = async () => {
  if (isTransitioning.value && showDropdown.value) return;
  isTransitioning.value = true;
  showDropdown.value =!showDropdown.value;
  if (showDropdown.value) {
    await nextTick();
    calculateDropdownPosition();
    // 使用条件编译处理不同平台的滚动行为
    // #ifdef MP-WEIXIN
    wx.pageScrollTo({ scrollTop: 0, duration: 0 });
    // #endif
    // #ifdef H5
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // #endif
    // 使用 Vue 的 onMounted 或自定义指令添加事件监听
    onMounted(() => {
      document.addEventListener('click', handlePageClick);
    });
    isTransitioning.value = false;
  } else {
    // 使用条件编译处理不同平台的滚动行为
    // #ifdef MP-WEIXIN
    wx.pageScrollTo({ scrollTop: 0, duration: 0 });
    // #endif
    // #ifdef H5
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // #endif
    setTimeout(() => {
      dropdownPosition.value = {};
      // 确保在延迟结束后才将 isTransitioning 置为 false
      isTransitioning.value = false;
    }, 300);
    // 使用 Vue 的 onUnmounted 或自定义指令移除事件监听
    onUnmounted(() => {
      document.removeEventListener('click', handlePageClick);
    });
  }
};

const selectItem = (item) => {
  selectedText.value = item;
  showDropdown.value = false;
  emit('update:selected', item);
};

const addNewOption = () => {
  const trimmedOption = newOption.value.trim();
  if (trimmedOption) {
    const updatedOptions = [...props.options, trimmedOption];
    emit('update:options', updatedOptions);
    selectItem(trimmedOption);
    newOption.value = "";
  }
};

const calculateDropdownPosition = () => {
  const el = wrapperEl.value;
  if (!el) return;

  const rect = el.getBoundingClientRect();

  let top = rect.bottom + 2;
  let bottomSpace = viewportHeight.value - rect.bottom;

  if (bottomSpace < 200) {
    top = rect.top - 200 - 2;
  }

  dropdownPosition.value = {
    top: `${top}px`,
    left: `${rect.left}px`,
    width: '100%'
  };
};

const handlePageClick = (e) => {
  const dropdownContainer = wrapperEl.value;
  if (!dropdownContainer.contains(e.target)) {
    showDropdown.value = false;
    // 使用 Vue 的 onUnmounted 或自定义指令移除事件监听
    onUnmounted(() => {
      document.removeEventListener('click', handlePageClick);
    });
  }
};

// Lifecycle hooks
onMounted(() => {
  // Initialize any necessary logic here
});

// Watchers
watch(() => props.selected, (newValue) => {
  selectedText.value = newValue;
});

watch(showDropdown, (newVal) => {
  if (!newVal) {
    // 移除：避免与 toggleDropdown 中的延迟设置冲突
    // dropdownPosition.value = {};
  }
});
</script>

<style scoped>
.dropdown-container {
  position: relative;
  width: 100%;
  max-width: 300px;
  font-family: Arial, sans-serif;
}

.dropdown-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #fff;
  border: 1px solid #1e90ff;
  border-radius: 4px;
  cursor: pointer;
}

.dropdown-text {
  color: #1e90ff;
  font-size: 14px;
}

.dropdown-list {
  position: absolute;
  z-index: 10;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  width: 100%;
  transition: all 0.3s ease;
}

.dropdown-scroll {
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  color: #333;
}

.dropdown-item:hover {
  background-color: #f0f8ff;
}

.add-option {
  padding: 8px 12px;
  background-color: #f0f8ff;
}

.add-option-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #1e90ff;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.add-option-input:focus {
  border-color: #1e90ff;
}
</style>