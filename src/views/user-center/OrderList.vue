<template>
  <div>
    <el-table :data="orders" style="width: 100%">
      <el-table-column prop="orderNo" label="Order No" width="120" />
      <el-table-column prop="productName" label="Product" />
      <el-table-column prop="amount" label="Amount" width="100" />
      <el-table-column prop="createdAt" label="Date" width="160" />
      <el-table-column prop="status" label="Status" width="100" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
const orders = [
  { orderNo: '2024001', productName: 'Wristo Pro', amount: '¥199', createdAt: '2024-06-01', status: 'Paid' },
  { orderNo: '2024002', productName: 'Wristo Lite', amount: '¥99', createdAt: '2024-06-10', status: 'Pending' },
]
</script> 