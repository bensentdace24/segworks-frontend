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
const myUpcomingAppointments = ref([]);
const loading = ref(true);
const error = ref("");

async function fetchDashboard() {
  try {
    const { data } = await api.get("/dashboard");
    staff.value = data.staff;

    if (data.staff.role === "doctor") {
      myUpcomingAppointments.value = data.my_upcoming_appointments;
    } else {
      totalPatients.value = data.total_patients;
      todaysAppointments.value = data.todays_appointments;
    }
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

      <!-- DOCTOR VIEW -->
      <div v-if="staff?.role === 'doctor'">
        <h3>My Upcoming Appointments</h3>
        <table border="1" cellpadding="6">
          <tr>
            <th>Patient</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
          <tr v-for="appt in myUpcomingAppointments" :key="appt.id">
            <td>{{ appt.patient?.full_name }} ({{ appt.patient?.phn }})</td>
            <td>{{ new Date(appt.scheduled_at).toLocaleString() }}</td>
            <td>{{ appt.status }}</td>
          </tr>
        </table>
        <p v-if="!myUpcomingAppointments.length">No upcoming appointments.</p>
      </div>

      <!-- RECEPTIONIST / FRONT DESK VIEW -->
      <div v-else>
        <h3>Front Desk Overview</h3>
        <p><strong>Total Patients:</strong> {{ totalPatients }}</p>

        <h4>Today's Appointments</h4>
        <table border="1" cellpadding="6">
          <tr>
            <th>Patient</th>
            <th>Doctor</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
          <tr v-for="appt in todaysAppointments" :key="appt.id">
            <td>{{ appt.patient?.full_name }}</td>
            <td>{{ appt.doctor?.name || "Unassigned" }}</td>
            <td>{{ new Date(appt.scheduled_at).toLocaleTimeString() }}</td>
            <td>{{ appt.status }}</td>
          </tr>
        </table>
        <p v-if="!todaysAppointments.length">No appointments today.</p>

        <div>
          <router-link to="/patients">
            <button>+ New Patient</button>
          </router-link>
          <router-link to="/appointments">
            <button>+ New Appointment</button>
          </router-link>
        </div>
      </div>

      <nav>
        <router-link to="/patients">Patients</router-link> |
        <router-link to="/appointments">Appointments</router-link> |
        <router-link to="/doctors">Doctors</router-link> |
        <router-link to="/medical-records">Medical Records</router-link>
      </nav>
    </div>
  </div>
</template>
