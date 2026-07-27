<script setup>
import { ref, onMounted } from "vue";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const patient = ref(null);
const upcomingAppointments = ref([]);
const recentRecords = ref([]);
const loading = ref(true);
const error = ref("");

async function fetchDashboard() {
  try {
    const { data } = await api.get("/dashboard");
    patient.value = data.patient;
    upcomingAppointments.value = data.upcoming_appointments;
    recentRecords.value = data.recent_records;
  } catch (e) {
    error.value = "Failed to load dashboard";
  } finally {
    loading.value = false;
  }
}

function logout() {
  auth.logout();
  router.push("/login");
}

onMounted(fetchDashboard);
</script>

<template>
  <div>
    <button @click="logout">Logout</button>
    <h1>Dashboard</h1>

    <p v-if="loading">Loading...</p>
    <p v-else-if="error">{{ error }}</p>

    <div v-else>
      <h2>Welcome, {{ patient?.full_name }}</h2>
      <p>Blood Type: {{ patient?.blood_type }}</p>

      <h3>Upcoming Appointments</h3>
      <ul>
        <li v-for="appt in upcomingAppointments" :key="appt.id">
          {{ appt.doctor_name }} — {{ appt.department }} —
          {{ new Date(appt.scheduled_at).toLocaleString() }}
        </li>
      </ul>
      <p v-if="!upcomingAppointments.length">No upcoming appointments.</p>

      <h3>Recent Medical Records</h3>
      <ul>
        <li v-for="record in recentRecords" :key="record.id">
          {{ record.title }} ({{ record.record_type }}) —
          {{ record.recorded_at }}
        </li>
      </ul>
      <p v-if="!recentRecords.length">No recent records.</p>

      <nav>
        <router-link to="/appointments">Appointments</router-link> |
        <router-link to="/doctors">Doctors</router-link> |
        <router-link to="/medical-records">Medical Records</router-link>
      </nav>
    </div>
  </div>
</template>
