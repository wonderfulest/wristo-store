import instance from '@/config/axios'

// 上传产品图片
export const uploadUserAvatar = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file as unknown as Blob);
    return instance.post('/files/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
} 
