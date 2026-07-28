<script setup>
import { ref, onMounted } from "vue";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const staff = ref(null);
const totalPatients = ref(0);
const todaysAppointments = ref([]);
const loading = ref(true);
const error = ref("");

async function fetchDashboard() {
  try {
    const { data } = await api.get("/dashboard");
    staff.value = data.staff;
    totalPatients.value = data.total_patients;
    todaysAppointments.value = data.todays_appointments;
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
      <h2>Welcome, {{ staff?.name }}</h2>
      <p>Role: {{ staff?.role }}</p>
      <p>Total Patients: {{ totalPatients }}</p>

      <h3>Today's Appointments</h3>
      <ul>
        <li v-for="appt in todaysAppointments" :key="appt.id">
          {{ appt.doctor_name }} — {{ appt.department }} —
          {{ new Date(appt.scheduled_at).toLocaleString() }}
        </li>
      </ul>
      <p v-if="!todaysAppointments.length">No appointments today.</p>

      <nav>
        <router-link to="/patients">Patients</router-link> |
        <router-link to="/appointments">Appointments</router-link> |
        <router-link to="/doctors">Doctors</router-link> |
        <router-link to="/medical-records">Medical Records</router-link>
      </nav>
    </div>
  </div>
</template>
