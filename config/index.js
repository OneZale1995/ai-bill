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
export const API = {
    baseUrl: config.baseUrl,
    login: `${config.baseUrl}/login`,
    // 在这里添加其他API路径
    bills: {
        list: `${config.baseUrl}/bills`,
        create: `${config.baseUrl}/bills`,
        update: `${config.baseUrl}/bills`,
        delete: `${config.baseUrl}/bills`,
    }
}

export default config 