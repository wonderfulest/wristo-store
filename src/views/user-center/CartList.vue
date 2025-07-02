<template>
  <div>
    <el-table :data="cart" style="width: 100%">
      <el-table-column prop="productName" label="Product" />
      <el-table-column prop="quantity" label="Quantity" width="100" />
      <el-table-column prop="price" label="Price" width="100" />
      <el-table-column label="Action" width="120">
        <template #default="scope">
          <el-button size="small" type="danger">Remove</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
const cart = [
  { productName: 'Wristo Pro', quantity: 1, price: '¥199' },
  { productName: 'Wristo Lite', quantity: 2, price: '¥99' },
]
</script> 