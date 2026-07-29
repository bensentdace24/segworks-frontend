<script setup>
import { ref, onMounted } from "vue";
import api from "../api/client";

const appointments = ref([]);
const doctors = ref([]);
const patients = ref([]);
const loading = ref(true);
const error = ref("");

const form = ref({
  patient_id: "",
  doctor_id: "",
  department: "",
  scheduled_at: "",
  notes: "",
});
const editingId = ref(null);

async function fetchDoctors() {
  const { data } = await api.get("/doctors-list");
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
  form.value = {
    patient_id: "",
    doctor_id: "",
    department: "",
    scheduled_at: "",
    notes: "",
  };
}

onMounted(() => {
  fetchDoctors();
  fetchPatients();
  fetchAppointments();
});
</script>

<template>
  <div>
    <router-link to="/">Back to Dashboard</router-link>
    <h1>Appointments</h1>

    <form @submit.prevent="submitForm">
      <h3>{{ editingId ? "Edit" : "New" }} Appointment</h3>

      <select v-model="form.patient_id" required>
        <option value="">Select Patient</option>
        <option v-for="p in patients" :key="p.id" :value="p.id">
          {{ p.full_name }} ({{ p.phn }})
        </option>
      </select>

      <select v-model="form.doctor_id">
        <option value="">Select Doctor</option>
        <option v-for="doc in doctors" :key="doc.id" :value="doc.id">
          {{ doc.name }}
        </option>
      </select>

      <input v-model="form.department" placeholder="Department" />
      <input v-model="form.scheduled_at" type="datetime-local" required />

      <select v-if="editingId" v-model="form.status">
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <textarea v-model="form.notes" placeholder="Notes"></textarea>

      <button type="submit">{{ editingId ? "Update" : "Book" }}</button>
      <button v-if="editingId" type="button" @click="resetForm">Cancel</button>
    </form>

    <p v-if="error" style="color: red">{{ error }}</p>
    <p v-if="loading">Loading...</p>

    <table v-else border="1" cellpadding="6">
      <tr>
        <th>Patient</th>
        <th>Doctor</th>
        <th>Department</th>
        <th>Date</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
      <tr v-for="appt in appointments" :key="appt.id">
        <td>{{ appt.patient?.full_name || "—" }}</td>
        <td>{{ appt.doctor?.name || "Unassigned" }}</td>
        <td>{{ appt.department }}</td>
        <td>{{ new Date(appt.scheduled_at).toLocaleString() }}</td>
        <td>{{ appt.status }}</td>
        <td>
          <button @click="startEdit(appt)">Edit</button>
          <button @click="deleteAppointment(appt.id)">Delete</button>
        </td>
      </tr>
    </table>
  </div>
</template>
