<script setup>
import { ref, onMounted } from "vue";
import api from "../api/client";

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
  <div>
    <router-link to="/">Back to Dashboard</router-link>
    <h1>Doctors</h1>

    <p v-if="error" style="color: red">{{ error }}</p>

    <div style="display: flex; gap: 16px; flex-wrap: wrap">
      <div
        v-for="doctor in doctors"
        :key="doctor.id"
        style="border: 1px solid #ccc; padding: 12px; width: 200px"
      >
        <template v-if="doctor.name">
          <p>
            <strong>{{ doctor.name }}</strong>
          </p>
          <p>{{ doctor.specialty }}</p>
        </template>
        <template v-else>
          <p>Loading doctor info…</p>
        </template>
      </div>
    </div>
  </div>
</template>
