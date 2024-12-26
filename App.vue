<script>
import { createSSRApp } from 'vue'

export function createApp() {
  const app = createSSRApp(App)
  return { app }
}
</script>

<style lang="scss">
@import './styles/common.scss';
@import './uni_modules/uni-scss/index.scss';
</style>
