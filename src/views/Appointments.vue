<script setup>
import { ref, onMounted } from "vue";
import api from "../api/client";

const appointments = ref([]);
const loading = ref(true);
const error = ref("");

// form state
const form = ref({
  doctor_name: "",
  department: "",
  scheduled_at: "",
  notes: "",
});
const editingId = ref(null);

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
    doctor_name: appt.doctor_name,
    department: appt.department,
    scheduled_at: appt.scheduled_at.slice(0, 16), // format for datetime-local input
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
  form.value = { doctor_name: "", department: "", scheduled_at: "", notes: "" };
}

onMounted(fetchAppointments);
</script>

<template>
  <div>
    <router-link to="/">Back to Dashboard</router-link>
    <h1>Appointments</h1>

    <form @submit.prevent="submitForm">
      <h3>{{ editingId ? "Edit" : "New" }} Appointment</h3>
      <input v-model="form.doctor_name" placeholder="Doctor Name" required />
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
        <th>Doctor</th>
        <th>Department</th>
        <th>Date</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
      <tr v-for="appt in appointments" :key="appt.id">
        <td>{{ appt.doctor_name }}</td>
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
