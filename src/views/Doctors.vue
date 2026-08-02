<script setup>
import { ref, onMounted } from "vue";
import api from "../api/client";
import AppShell from "../components/AppShell.vue";

const doctors = ref([]);
const loading = ref(true);
const error = ref("");

async function fetchDoctors() {
  try {
    const { data } = await api.get("/doctors");
    doctors.value = data;
  } catch (e) {
    error.value = "Failed to load doctors";
  } finally {
    loading.value = false;
  }
}

onMounted(fetchDoctors);
</script>

<template>
  <AppShell title="Doctors" subtitle="View the SegHIS clinical team">
      <h2 class="font-display text-2xl font-semibold text-ink mb-6">Doctors</h2>

      <p v-if="error" class="text-red-600 text-sm mb-4">{{ error }}</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="doctor in doctors"
          :key="doctor.id"
          class="bg-white rounded-xl border border-slate-200 p-5"
        >
          <template v-if="doctor.name">
            <div
              class="w-10 h-10 rounded-full bg-primary-50 text-primary-700 font-display font-semibold flex items-center justify-center mb-3"
            >
              {{ doctor.name.charAt(0) }}
            </div>
            <p class="font-medium text-ink">{{ doctor.name }}</p>
            <p class="text-sm text-slate-500">{{ doctor.specialty }}</p>
          </template>
          <template v-else>
            <div
              class="w-10 h-10 rounded-full bg-slate-100 animate-pulse mb-3"
            ></div>
            <div
              class="h-4 bg-slate-100 rounded animate-pulse mb-2 w-2/3"
            ></div>
            <div class="h-3 bg-slate-100 rounded animate-pulse w-1/2"></div>
          </template>
        </div>
      </div>
      <p v-if="!loading && !doctors.length" class="text-slate-400 text-sm">
        No doctors found.
      </p>
  </AppShell>
</template>
