<script setup>
import { ref, onMounted } from "vue";
import api from "../api/client";

const records = ref([]);
const loading = ref(true);

async function fetchRecords() {
  const { data } = await api.get("/medical-records");
  records.value = data;
  loading.value = false;
}

onMounted(fetchRecords);
</script>

<template>
  <div>
    <router-link to="/">Back to Dashboard</router-link>
    <h1>Medical Records</h1>
    <p v-if="loading">Loading...</p>
    <table v-else border="1" cellpadding="6">
      <tr>
        <th>Type</th>
        <th>Title</th>
        <th>Date</th>
      </tr>
      <tr v-for="record in records" :key="record.id">
        <td>{{ record.record_type }}</td>
        <td>{{ record.title }}</td>
        <td>{{ record.recorded_at }}</td>
      </tr>
    </table>
  </div>
</template>
