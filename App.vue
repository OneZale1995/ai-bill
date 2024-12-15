<script>
import { createSSRApp } from 'vue'

export function createApp() {
  const app = createSSRApp(App)
  return { app }
}
</script>

<style lang="scss">
</style>
