<script>
import { createSSRApp } from 'vue'
import uView from 'uview-ui'

export function createApp() {
  const app = createSSRApp(App)
  app.use(uView)
  return { app }
}
</script>

<style lang="scss">
</style>
