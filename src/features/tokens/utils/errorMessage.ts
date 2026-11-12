import { ElMessage } from 'element-plus'
export const showErrorOnce = (_error: unknown, message: string) => ElMessage.error(message)
