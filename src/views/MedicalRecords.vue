<script setup>
import { ref, onMounted } from "vue";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const records = ref([]);
const loading = ref(true);

async function fetchRecords() {
  const { data } = await api.get("/medical-records");
  records.value = data;
  loading.value = false;
}

function logout() {
  auth.logout();
  router.push("/login");
}

onMounted(fetchRecords);
</script>

<template>
  <div class="min-h-screen bg-surface">
    <header class="bg-white border-b border-slate-200">
      <div
        class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between"
      >
        <h1 class="font-display text-xl font-semibold text-primary-700">
          SegHIS
        </h1>
        <nav class="flex items-center gap-6 text-sm font-medium text-slate-600">
          <router-link to="/" class="hover:text-primary-700"
            >Dashboard</router-link
          >
          <router-link to="/patients" class="hover:text-primary-700"
            >Patients</router-link
          >
          <router-link to="/appointments" class="hover:text-primary-700"
            >Appointments</router-link
          >
          <router-link to="/doctors" class="hover:text-primary-700"
            >Doctors</router-link
          >
          <router-link to="/medical-records" class="text-primary-700"
            >Medical Records</router-link
          >
          <button @click="logout" class="text-slate-400 hover:text-red-600">
            Logout
          </button>
        </nav>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 py-8">
      <h2 class="font-display text-2xl font-semibold text-ink mb-6">
        Medical Records
      </h2>

      <p v-if="loading" class="text-slate-500">Loading...</p>

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
    </main>
  </div>
</template>
