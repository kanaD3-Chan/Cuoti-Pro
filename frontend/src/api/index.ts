/* ==========================================================================
 * API 层统一出口
 * USE_MOCK 开关：true 使用本地 Mock，false 使用真实 API
 * ========================================================================== */

export const USE_MOCK = true

export * from './request'
export * from './chat'
export * from './upload'
export * from './wrongQuestion'
export * from './mock'
