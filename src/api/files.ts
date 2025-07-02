import instance from '@/config/axios'
import type { ApiResponse } from '@/types'

// 上传产品图片
export const uploadUserAvatar = async (file: File): Promise<ApiResponse<String>> => {
    const formData = new FormData();
    formData.append('file', file as unknown as Blob);
    return instance.post('/files/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
} 
