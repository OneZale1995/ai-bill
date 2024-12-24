// 开发环境配置
const devConfig = {
    baseUrl: 'http://localhost:8081/bill',  // 开发环境API地址
}

// // 生产环境配置
// const prodConfig = {
//   baseUrl: 'https://api.yourserver.com',  // 生产环境API地址
// }

// 根据环境返回对应配置
const config = devConfig

// API路径配置
export const baseConfig = {
    baseUrl: config.baseUrl
}

export default config 