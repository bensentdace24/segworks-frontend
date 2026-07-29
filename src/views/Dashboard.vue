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
  <div class="min-h-screen bg-surface">
    <!-- Top nav -->
    <header class="bg-white border-b border-slate-200">
      <div
        class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between"
      >
        <h1 class="font-display text-xl font-semibold text-primary-700">
          SegHIS
        </h1>
        <nav class="flex items-center gap-6 text-sm font-medium text-slate-600">
          <router-link to="/" class="text-primary-700">Dashboard</router-link>
          <router-link to="/patients" class="hover:text-primary-700"
            >Patients</router-link
          >
          <router-link to="/appointments" class="hover:text-primary-700"
            >Appointments</router-link
          >
          <router-link to="/doctors" class="hover:text-primary-700"
            >Doctors</router-link
          >
          <router-link to="/medical-records" class="hover:text-primary-700"
            >Medical Records</router-link
          >
          <button @click="logout" class="text-slate-400 hover:text-red-600">
            Logout
          </button>
        </nav>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 py-8">
      <p v-if="loading" class="text-slate-500">Loading...</p>
      <p v-else-if="error" class="text-red-600">{{ error }}</p>

      <div v-else>
        <div class="mb-8">
          <h2 class="font-display text-2xl font-semibold text-ink">
            Welcome, {{ staff?.name }}
          </h2>
          <span
            class="inline-block mt-1 text-xs font-medium uppercase tracking-wide text-primary-700 bg-primary-50 px-2 py-1 rounded"
          >
            {{ staff?.role }}
          </span>
        </div>

        <!-- DOCTOR VIEW -->
        <div v-if="staff?.role === 'doctor'">
          <h3 class="font-display text-lg font-semibold text-ink mb-4">
            My Upcoming Appointments
          </h3>
          <div
            class="bg-white rounded-xl border border-slate-200 overflow-hidden"
          >
            <table class="w-full text-sm">
              <thead
                class="bg-slate-50 text-left text-slate-500 text-xs uppercase tracking-wide"
              >
                <tr>
                  <th class="px-4 py-3">Patient</th>
                  <th class="px-4 py-3">Date</th>
                  <th class="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="appt in myUpcomingAppointments" :key="appt.id">
                  <td class="px-4 py-3">
                    {{ appt.patient?.full_name }}
                    <span class="text-slate-400"
                      >({{ appt.patient?.phn }})</span
                    >
                  </td>
                  <td class="px-4 py-3">
                    {{ new Date(appt.scheduled_at).toLocaleString() }}
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700"
                      >{{ appt.status }}</span
                    >
                  </td>
                </tr>
              </tbody>
            </table>
            <p
              v-if="!myUpcomingAppointments.length"
              class="px-4 py-6 text-center text-slate-400 text-sm"
            >
              No upcoming appointments.
            </p>
          </div>
        </div>

        <!-- RECEPTIONIST / FRONT DESK VIEW -->
        <div v-else>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div class="bg-white rounded-xl border border-slate-200 p-5">
              <p class="text-xs uppercase tracking-wide text-slate-400 mb-1">
                Total Patients
              </p>
              <p class="font-display text-3xl font-semibold text-ink">
                {{ totalPatients }}
              </p>
            </div>
            <router-link
              to="/patients"
              class="bg-primary-600 hover:bg-primary-700 transition-colors rounded-xl p-5 flex items-center justify-center text-white font-medium text-sm"
            >
              + New Patient
            </router-link>
            <router-link
              to="/appointments"
              class="bg-accent-500 hover:bg-accent-600 transition-colors rounded-xl p-5 flex items-center justify-center text-white font-medium text-sm"
            >
              + New Appointment
            </router-link>
          </div>

          <h3 class="font-display text-lg font-semibold text-ink mb-4">
            Today's Appointments
          </h3>
          <div
            class="bg-white rounded-xl border border-slate-200 overflow-hidden"
          >
            <table class="w-full text-sm">
              <thead
                class="bg-slate-50 text-left text-slate-500 text-xs uppercase tracking-wide"
              >
                <tr>
                  <th class="px-4 py-3">Patient</th>
                  <th class="px-4 py-3">Doctor</th>
                  <th class="px-4 py-3">Time</th>
                  <th class="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-for="appt in todaysAppointments" :key="appt.id">
                  <td class="px-4 py-3">{{ appt.patient?.full_name }}</td>
                  <td class="px-4 py-3">
                    {{ appt.doctor?.name || "Unassigned" }}
                  </td>
                  <td class="px-4 py-3">
                    {{ new Date(appt.scheduled_at).toLocaleTimeString() }}
                  </td>
                  <td class="px-4 py-3">
                    <span
                      class="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700"
                      >{{ appt.status }}</span
                    >
                  </td>
                </tr>
              </tbody>
            </table>
            <p
              v-if="!todaysAppointments.length"
              class="px-4 py-6 text-center text-slate-400 text-sm"
            >
              No appointments today.
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
