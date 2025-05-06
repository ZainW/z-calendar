<script setup lang="ts">
import { ref, onMounted, h } from 'vue'
import {
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useVueTable,
  FlexRender,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState
} from '@tanstack/vue-table'

// Define a type for our data
type Person = {
  id: number
  firstName: string
  lastName: string
  age: number
  visits: number
  status: 'relationship' | 'complicated' | 'single'
  progress: number
  email: string
}

// Example data
const makeData = (length: number): Person[] => {
  return Array.from({ length }).map((_, i) => ({
    id: i + 1,
    firstName: `First-${i}`,
    lastName: `Last-${i}`,
    age: Math.floor(Math.random() * 40) + 20,
    visits: Math.floor(Math.random() * 100),
    status: ['relationship', 'complicated', 'single'][Math.floor(Math.random() * 3)] as Person['status'],
    progress: Math.floor(Math.random() * 100),
    email: `example${i}@example.com`
  }))
}

// Define columns for our table
const columns = ref<ColumnDef<Person>[]>([
  {
    header: 'ID',
    accessorKey: 'id',
    cell: info => info.getValue(),
    enableSorting: true
  },
  {
    header: 'Name',
    columns: [
      {
        accessorKey: 'firstName',
        header: 'First Name',
        cell: info => info.getValue(),
        enableSorting: true
      },
      {
        accessorKey: 'lastName',
        header: 'Last Name',
        cell: info => info.getValue(),
        enableSorting: true
      }
    ]
  },
  {
    header: 'Info',
    columns: [
      {
        accessorKey: 'age',
        header: 'Age',
        cell: info => info.getValue(),
        enableSorting: true
      },
      {
        accessorKey: 'visits',
        header: 'Visits',
        cell: info => info.getValue(),
        enableSorting: true
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: info => info.getValue(),
        enableSorting: true
      },
      {
        accessorKey: 'progress',
        header: 'Progress',
        cell: info => {
          const value = info.getValue() as number
          return h('div', { class: 'w-full bg-gray-200 rounded-full h-2.5' }, [
            h('div', {
              class: 'bg-blue-600 h-2.5 rounded-full',
              style: { width: `${value}%` }
            })
          ])
        },
        enableSorting: true
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: info => info.getValue(),
        enableSorting: true
      }
    ]
  }
])

// Generate data
const data = ref<Person[]>([])

// Set up sorting state
const sorting = ref<SortingState>([])

// Set up global filter state
const globalFilter = ref('')

// Create the table instance
const instance = useVueTable({
  get data() {
    return data.value
  },
  get columns() {
    return columns.value
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  state: {
    get sorting() {
      return sorting.value
    },
    get globalFilter() {
      return globalFilter.value
    }
  },
  onSortingChange: updater => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
  onGlobalFilterChange: updater => {
    globalFilter.value = typeof updater === 'function' ? updater(globalFilter.value) : updater
  },
  onStateChange: () => {},
  renderFallbackValue: null
})

// Set default pagination
onMounted(() => {
  instance.setPageSize(10)
  data.value = makeData(100)
})

// Set pagination options
const pageSizeOptions = [5, 10, 20, 30, 40, 50]
</script>

<template>
  <div class="data-grid-container">
    <div class="filter-search my-4">
      <input
        type="text"
        v-model="globalFilter"
        placeholder="Search all columns..."
        class="px-4 py-2 border border-gray-300 rounded-md w-full md:w-64"
      />
    </div>

    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
          <tr v-for="headerGroup in instance.getHeaderGroups()" :key="headerGroup.id">
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              :colSpan="header.colSpan"
              scope="col"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
            >
              <div
                v-if="!header.isPlaceholder"
                class="flex items-center gap-2 cursor-pointer sortable-header"
                @click="header.column.getToggleSortingHandler()?.($event)"
              >
                {{ header.column.columnDef.header }}
                <span v-if="header.column.getIsSorted() === 'asc'">🔼</span>
                <span v-else-if="header.column.getIsSorted() === 'desc'">🔽</span>
                <span v-else-if="header.column.getCanSort()">↕️</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="row in instance.getRowModel().rows" :key="row.id" class="hover:bg-gray-50">
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-b border-gray-200"
            >
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </td>
          </tr>
          <tr v-if="instance.getRowModel().rows.length === 0">
            <td :colSpan="columns.length" class="px-6 py-4 text-center text-sm text-gray-500">
              No results found
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination flex items-center justify-between my-4">
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-700">
          Page {{ instance.getState().pagination.pageIndex + 1 }} of {{ instance.getPageCount() }}
        </span>
        <select
          :value="instance.getState().pagination.pageSize"
          @change="(e: Event) => instance.setPageSize(Number((e.target as HTMLSelectElement).value))"
          class="px-2 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option v-for="pageSize in pageSizeOptions" :key="pageSize" :value="pageSize">
            Show {{ pageSize }}
          </option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
          :disabled="!instance.getCanPreviousPage()"
          @click="instance.setPageIndex(0)"
        >
          «
        </button>
        <button
          class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
          :disabled="!instance.getCanPreviousPage()"
          @click="instance.previousPage()"
        >
          ‹
        </button>
        <button
          class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
          :disabled="!instance.getCanNextPage()"
          @click="instance.nextPage()"
        >
          ›
        </button>
        <button
          class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
          :disabled="!instance.getCanNextPage()"
          @click="instance.setPageIndex(instance.getPageCount() - 1)"
        >
          »
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-grid-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(16, 30, 54, 0.06);
  padding: 32px 24px 24px 24px;
  font-family: 'Inter', 'SF Pro Display', 'Segoe UI', Arial, sans-serif;
  max-width: 1200px;
  margin: 40px auto;
}

.filter-search {
  margin-bottom: 20px;
}

.filter-search input[type="text"] {
  background: #f6f7f9;
  border: 1px solid #e3e6eb;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 15px;
  width: 100%;
  max-width: 320px;
  transition: border 0.2s;
}
.filter-search input[type="text"]:focus {
  border: 1.5px solid #5b6ee1;
  outline: none;
  background: #fff;
}

.overflow-x-auto {
  border-radius: 10px;
  overflow: auto;
  background: #fff;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
}

thead {
  background: #f6f7f9;
}

th {
  font-weight: 600;
  color: #222b45;
  font-size: 13px;
  letter-spacing: 0.03em;
  padding: 12px 16px;
  border-bottom: 1.5px solid #e3e6eb;
  background: #f6f7f9;
  position: relative;
  user-select: none;
}

th .flex {
  gap: 6px;
}

th:after {
  content: '';
  position: absolute;
  right: 0;
  top: 25%;
  height: 50%;
  width: 1px;
  background-color: #e3e6eb;
}

th:last-child:after {
  display: none;
}

tbody tr {
  transition: background 0.15s;
}
tbody tr:hover {
  background: #f3f6fa;
}

td {
  font-size: 15px;
  color: #2d3748;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f1f3;
  background: #fff;
}

tbody tr:last-child td {
  border-bottom: none;
}

/* Progress bar cell */
.w-full.bg-gray-200.rounded-full.h-2\.5 {
  background: #e3e6eb !important;
}
.bg-blue-600.h-2\.5.rounded-full {
  background: linear-gradient(90deg, #5b6ee1 0%, #3a8dde 100%) !important;
}

/* Empty state */
tbody tr td[colspan] {
  color: #a0aec0;
  font-size: 15px;
  padding: 32px 0;
  background: #fff;
}

.pagination {
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination .text-sm {
  color: #6b7280;
  font-size: 14px;
}

.pagination select {
  background: #f6f7f9;
  border: 1px solid #e3e6eb;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  margin-left: 8px;
  transition: border 0.2s;
}
.pagination select:focus {
  border: 1.5px solid #5b6ee1;
  outline: none;
  background: #fff;
}

.pagination button {
  background: #f6f7f9;
  border: 1px solid #e3e6eb;
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 16px;
  color: #5b6ee1;
  margin: 0 2px;
  transition: background 0.15s, border 0.15s;
  cursor: pointer;
}
.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  color: #b0b7c3;
  background: #f6f7f9;
  border: 1px solid #e3e6eb;
}
.pagination button:not(:disabled):hover {
  background: #e3e6eb;
  border: 1.5px solid #5b6ee1;
}

.sortable-header {
  transition: background 0.15s;
  border-radius: 6px;
  padding: 4px 8px;
}
.sortable-header:hover {
  background: #e3e6eb;
}

@media (max-width: 900px) {
  .data-grid-container {
    padding: 16px 4px 16px 4px;
  }
  th, td {
    padding: 8px 8px;
    font-size: 13px;
  }
  .filter-search input[type="text"] {
    max-width: 100%;
  }
}
</style>
