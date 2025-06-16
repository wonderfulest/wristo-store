import instance from '@/config/axios'

// 定义返回数据类型
interface Response<T> {
  code: number
  msg: string
  data: T
}

// 定义商品类型
export interface Product {
  appId: number
  designId: string
  name: string
  description: string
  price: number
  garminImageUrl: string
  garminStoreUrl: string
  garminAppUuid: string
  trialLasts: number
  createdAt: string
  updatedAt: string
  isDeleted: number
  download: number
  purchase: number
  heroFile: string | null
  backgroundFile: string | null
}

// 定义系列类型
export interface Series {
  id: number
  name: string
  slug: string
  image: string | null
  sort: number
}

// 搜索商品
export const searchProducts = (keyword: string): Promise<Response<Product[]>> => {
  return instance.get('/products/search', {
    params: { keyword }
  })
}

// 获取新品
export const getNewProducts = (): Promise<Response<Product[]>> => {
  return instance.get('/public/products/new')
}

// 获取系列列表
export const getSeries = (): Promise<Response<Series[]>> => {
  return instance.get('/public/categories')
}

// 获取热门商品
export const getHotProducts = (): Promise<Response<Product[]>> => {
  return instance.get('/public/products/hot')
}
