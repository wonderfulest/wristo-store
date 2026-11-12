import { ElMessage } from 'element-plus'
export const useMessageStore = () => ({ success: (message: string) => ElMessage.success(message) })
