<script setup>
import { ref, onMounted } from "vue";
import api from "../api/client";

const patients = ref([]);
const search = ref("");
const loading = ref(true);
const error = ref("");

const form = ref({
  full_name: "",
  date_of_birth: "",
  gender: "",
  phone: "",
  address: "",
  blood_type: "",
});

async function fetchPatients() {
  loading.value = true;
  try {
    const { data } = await api.get("/patients", {
      params: { search: search.value },
    });
    patients.value = data;
  } catch (e) {
    error.value = "Failed to load patients";
  } finally {
    loading.value = false;
  }
}

async function addPatient() {
  try {
    await api.post("/patients", form.value);
    form.value = {
      full_name: "",
      date_of_birth: "",
      gender: "",
      phone: "",
      address: "",
      blood_type: "",
    };
    await fetchPatients();
  } catch (e) {
    error.value = e.response?.data?.message || "Failed to add patient";
  }
}

onMounted(fetchPatients);
</script>

<template>
  <div>
    <router-link to="/">Back to Dashboard</router-link>
    <h1>Patients</h1>

    <input
      v-model="search"
      placeholder="Search by name or PHN"
      @keyup.enter="fetchPatients"
    />
    <button @click="fetchPatients">Search</button>

    <h3>Add New Patient</h3>
    <form @submit.prevent="addPatient">
      <input v-model="form.full_name" placeholder="Full Name" required />
      <input v-model="form.date_of_birth" type="date" required />
      <input v-model="form.gender" placeholder="Gender" />
      <input v-model="form.phone" placeholder="Phone" />
      <input v-model="form.address" placeholder="Address" />
      <input v-model="form.blood_type" placeholder="Blood Type" />
      <button type="submit">Add Patient</button>
    </form>

    <p v-if="error" style="color: red">{{ error }}</p>
    <p v-if="loading">Loading...</p>

    <table v-else border="1" cellpadding="6">
      <tr>
        <th>PHN</th>
        <th>Name</th>
        <th>DOB</th>
        <th>Gender</th>
        <th>Phone</th>
      </tr>
      <tr v-for="patient in patients" :key="patient.id">
        <td>{{ patient.phn }}</td>
        <td>{{ patient.full_name }}</td>
        <td>{{ patient.date_of_birth?.slice(0, 10) }}</td>
        <td>{{ patient.gender }}</td>
        <td>{{ patient.phone }}</td>
      </tr>
    </table>
  </div>
</template>
