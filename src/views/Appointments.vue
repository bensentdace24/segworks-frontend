<script setup>
import { ref, onMounted } from "vue";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const appointments = ref([]);
const doctors = ref([]);
const patients = ref([]);
const loading = ref(true);
const error = ref("");
const showForm = ref(false);
const initialLoad = ref(true);

const form = ref({
  patient_id: "",
  doctor_name: "",
  department: "",
  scheduled_at: "",
  notes: "",
});
const editingId = ref(null);

async function fetchDoctors() {
  const { data } = await api.get("/doctors");
  doctors.value = data;
}

async function fetchPatients() {
  const { data } = await api.get("/patients");
  patients.value = data;
}

async function fetchAppointments() {
  loading.value = true;
  try {
    const { data } = await api.get("/appointments");
    appointments.value = data;
  } catch (e) {
    error.value = "Failed to load appointments";
  } finally {
    loading.value = false;
    initialLoad.value = false;
  }
}

async function submitForm() {
  try {
    if (editingId.value) {
      await api.put(`/appointments/${editingId.value}`, form.value);
    } else {
      await api.post("/appointments", form.value);
    }
    resetForm();
    await fetchAppointments();
  } catch (e) {
    error.value = e.response?.data?.message || "Save failed";
  }
}

function startEdit(appt) {
  editingId.value = appt.id;
  showForm.value = true;
  form.value = {
    patient_id: appt.patient_id,
    doctor_id: appt.doctor_id,
    department: appt.department,
    scheduled_at: appt.scheduled_at.slice(0, 16),
    notes: appt.notes,
    status: appt.status,
  };
}

async function deleteAppointment(id) {
  if (!confirm("Delete this appointment?")) return;
  await api.delete(`/appointments/${id}`);
  await fetchAppointments();
}

function resetForm() {
  editingId.value = null;
  showForm.value = false;
  form.value = {
    patient_id: "",
    doctor_id: "",
    department: "",
    scheduled_at: "",
    notes: "",
  };
}

function logout() {
  auth.logout();
  router.push("/login");
}

const statusStyles = {
  pending: "bg-slate-100 text-slate-600",
  confirmed: "bg-primary-50 text-primary-700",
  completed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

onMounted(() => {
  fetchDoctors();
  fetchPatients();
  fetchAppointments();
});
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
          <router-link to="/appointments" class="text-primary-700"
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
      <div class="flex items-center justify-between mb-6">
        <h2 class="font-display text-2xl font-semibold text-ink">
          Appointments
        </h2>
        <button
          @click="showForm ? resetForm() : (showForm = true)"
          class="bg-primary-600 hover:bg-primary-700 transition-colors text-white text-sm font-medium rounded-lg px-4 py-2"
        >
          {{ showForm ? "Cancel" : "+ New Appointment" }}
        </button>
      </div>

      <div
        v-if="showForm"
        class="bg-white rounded-xl border border-slate-200 p-6 mb-6"
      >
        <h3 class="font-display text-lg font-semibold text-ink mb-4">
          {{ editingId ? "Edit" : "New" }} Appointment
        </h3>
        <form
          @submit.prevent="submitForm"
          class="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <select
            v-model="form.patient_id"
            required
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Patient</option>
            <option v-for="p in patients" :key="p.id" :value="p.id">
              {{ p.full_name }} ({{ p.phn }})
            </option>
          </select>

          <select
            v-model="form.doctor_name"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select Doctor</option>
            <option v-for="doc in doctors" :key="doc.id" :value="doc.name">
              {{ doc.name }} — {{ doc.specialty }}
            </option>
          </select>

          <input
            v-model="form.department"
            placeholder="Department"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            v-model="form.scheduled_at"
            type="datetime-local"
            required
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          <select
            v-if="editingId"
            v-model="form.status"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <textarea
            v-model="form.notes"
            placeholder="Notes"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 sm:col-span-2"
          ></textarea>

          <button
            type="submit"
            class="bg-primary-600 hover:bg-primary-700 transition-colors text-white text-sm font-medium rounded-lg py-2 sm:col-span-2"
          >
            {{ editingId ? "Update" : "Book" }} Appointment
          </button>
        </form>
      </div>

      <p v-if="error" class="text-red-600 text-sm mb-4">{{ error }}</p>
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
              <th class="px-4 py-3">Patient</th>
              <th class="px-4 py-3">Doctor</th>
              <th class="px-4 py-3">Department</th>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="appt in appointments" :key="appt.id">
              <td class="px-4 py-3 font-medium text-ink">
                {{ appt.patient?.full_name || "—" }}
              </td>
              <td class="px-4 py-3">{{ appt.doctor_name || "Unassigned" }}</td>
              <td class="px-4 py-3">{{ appt.department }}</td>
              <td class="px-4 py-3">
                {{ new Date(appt.scheduled_at).toLocaleString() }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-block px-2 py-1 rounded-full text-xs font-medium"
                  :class="statusStyles[appt.status]"
                  >{{ appt.status }}</span
                >
              </td>
              <td class="px-4 py-3 space-x-2">
                <button
                  @click="startEdit(appt)"
                  class="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Edit
                </button>
                <button
                  @click="deleteAppointment(appt.id)"
                  class="text-red-500 hover:text-red-600 font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p
          v-if="!appointments.length"
          class="px-4 py-6 text-center text-slate-400 text-sm"
        >
          No appointments found.
        </p>
      </div>
    </main>
  </div>
</template>
