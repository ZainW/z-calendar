<script setup lang="ts">
import DataGrid from '@/components/DataGrid.vue'
</script>

<template>
  <div class="data-grid-example">
    <h1 class="text-2xl font-bold mb-4">Data Grid Example</h1>
    <p class="mb-6">A fully featured data grid component using TanStack Table for Vue.</p>

    <div class="card p-6 bg-white rounded-lg shadow-md">
      <DataGrid />
    </div>
  </div>
</template>

<style scoped>
.data-grid-example {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.card {
  overflow: hidden;
}
</style>
