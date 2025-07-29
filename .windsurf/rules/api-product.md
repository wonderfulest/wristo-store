---
trigger: model_decision
description: 
globs: 
---
### 查询系列

GET {{baseUrl}}/api/public/categories/all
Content-Type: application/json
Authorization: Bearer {{api_token}}


{
  "code": 0,
  "msg": "success",
  "data": [
    {
      "id": 1,
      "name": "Whole",
      "slug": "whole",
      "image": null,
      "sort": 0
    },
  ]
}

### 查询最新产品
GET {{baseUrl}}/api/public/products/new
返回
{
    "code": 0,
    "msg": "success",
    "data": [
        {
            "appId": 175774,
            "designId": "test-design-id-001",
            "name": "测试产品-更新",
            "description": "描述-更新",
            "price": 19.99,
            "garminImageUrl": "http://img.url",
            "garminStoreUrl": "http://store.url",
            "garminAppUuid": "test-uuid-001",
            "trialLasts": 24.0,
            "createdAt": "2025-06-09T11:33:03.960+00:00",
            "updatedAt": "2025-06-14T02:01:13.362+00:00",
            "isDeleted": 0,
            "download": 0,
            "purchase": 0,
            "heroFile": null,
            "backgroundFile": null
        },
    ]
}

### 根据AppId查询产品详情
GET {{baseUrl}}/api/public/products/app/{{appId}}
返回

{
  "code": 0,
  "msg": "success",
  "data": {
    "appId": 2487,
    "name": "Vision 001",
    "price": 1.99,
    "designId": "",
    "garminImageUrl": "",
    "garminStoreUrl": "https://apps.garmin.com/apps/7d89fa1b-4dc6-43b9-b334-b980609dcd94",
    "heroFile": {
      "id": 10216,
      "name": "5952fbd8-9f1e-4fb8-a025-704cfcac4152.png",
      "url": "https://files.garminface.com/5952fbd8_9f1e_4fb8_a025_704cfcac4152_6d4ebc50c8.png",
      "previewUrl": null,
      "provider": "@strapi/provider-upload-aws-s3"
    }
  }
}