<script setup>
import { ref, onMounted } from "vue";
import api from "../api/client";
import AppShell from "../components/AppShell.vue";

const records = ref([]);
const loading = ref(true);
const initialLoad = ref(true);

async function fetchRecords() {
  try {
    const { data } = await api.get("/medical-records");

    console.log("Medical Records:", data);

    records.value = data;
  } catch (e) {
    console.log(e.response?.data);
    alert(JSON.stringify(e.response?.data, null, 2));
  } finally {
    loading.value = false;
    initialLoad.value = false;
  }
}

onMounted(fetchRecords);
</script>

<template>
  <AppShell title="Medical Records" subtitle="Review clinical documentation across patients">
      <h2 class="font-display text-2xl font-semibold text-ink mb-6">
        Medical Records
      </h2>

      <p v-if="loading && initialLoad" class="text-slate-500">Loading...</p>

      <div
        v-else
        class="bg-white rounded-xl border border-slate-200 overflow-hidden"
      >
        <table class="w-full text-sm">
          <thead
            class="bg-slate-50 text-left text-slate-500 text-xs uppercase tracking-wide"
          >
            <tr>
              <th class="px-4 py-3">Type</th>
              <th class="px-4 py-3">Title</th>
              <th class="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="record in records" :key="record.id">
              <td class="px-4 py-3">
                <span
                  class="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700"
                  >{{ record.record_type }}</span
                >
              </td>
              <td class="px-4 py-3 font-medium text-ink">{{ record.title }}</td>
              <td class="px-4 py-3">{{ record.recorded_at?.slice(0, 10) }}</td>
            </tr>
          </tbody>
        </table>
        <p
          v-if="!records.length"
          class="px-4 py-6 text-center text-slate-400 text-sm"
        >
          No records found.
        </p>
      </div>
  </AppShell>
</template>
