<script setup>
import { ref, onMounted } from "vue";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const patients = ref([]);
const search = ref("");
const loading = ref(true);
const error = ref("");
const showForm = ref(false);

const editingId = ref(null);

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

async function submitForm() {
  try {
    if (editingId.value) {
      await api.put(`/patients/${editingId.value}`, form.value);
    } else {
      await api.post("/patients", form.value);
    }
    resetForm();
    await fetchPatients();
  } catch (e) {
    error.value = e.response?.data?.message || "Save failed";
  }
}

//delete patient
async function deletePatient(patient) {
  if (!confirm(`Delete ${patient.full_name}?`)) {
    return;
  }

  try {
    await api.delete(`/patients/${patient.id}`);
    await fetchPatients();
  } catch (e) {
    alert(e.response?.data?.message || "Unable to delete patient.");
  }
}

function startEdit(patient) {
  editingId.value = patient.id;
  showForm.value = true;
  form.value = {
    full_name: patient.full_name,
    date_of_birth: patient.date_of_birth?.slice(0, 10),
    gender: patient.gender,
    phone: patient.phone,
    address: patient.address,
    blood_type: patient.blood_type,
  };
}

function resetForm() {
  editingId.value = null;
  showForm.value = false;
  form.value = {
    full_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    address: "",
    blood_type: "",
  };
}

function logout() {
  auth.logout();
  router.push("/login");
}

onMounted(fetchPatients);
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
          <router-link to="/patients" class="text-primary-700"
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
      <div class="flex items-center justify-between mb-6">
        <h2 class="font-display text-2xl font-semibold text-ink">Patients</h2>
        <button
          @click="showForm = !showForm"
          class="bg-primary-600 hover:bg-primary-700 transition-colors text-white text-sm font-medium rounded-lg px-4 py-2"
        >
          {{ showForm ? "Cancel" : "+ New Patient" }}
        </button>
      </div>

      <!-- Search -->
      <div class="flex gap-2 mb-6">
        <input
          v-model="search"
          @keyup.enter="fetchPatients"
          placeholder="Search by name or PHN"
          class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        <button
          @click="fetchPatients"
          class="bg-white border border-slate-300 hover:bg-slate-50 text-sm font-medium rounded-lg px-4 py-2 text-slate-700"
        >
          Search
        </button>
      </div>

      <!-- Add form -->
      <div
        v-if="showForm"
        class="bg-white rounded-xl border border-slate-200 p-6 mb-6"
      >
        <h3 class="font-display text-lg font-semibold text-ink mb-4">
          {{ editingId ? "Edit" : "New" }} Patient
        </h3>
        <form
          @submit.prevent="submitForm"
          class="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <input
            v-model="form.full_name"
            placeholder="Full Name"
            required
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            v-model="form.date_of_birth"
            type="date"
            required
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            v-model="form.gender"
            placeholder="Gender"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            v-model="form.phone"
            placeholder="Phone"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            v-model="form.address"
            placeholder="Address"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 sm:col-span-2"
          />
          <input
            v-model="form.blood_type"
            placeholder="Blood Type"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            class="bg-primary-600 hover:bg-primary-700 transition-colors text-white text-sm font-medium rounded-lg py-2 sm:col-span-2"
          >
            {{ editingId ? "Update" : "Add" }} Patient
          </button>
        </form>
      </div>

      <p v-if="error" class="text-red-600 text-sm mb-4">{{ error }}</p>
      <p v-if="loading" class="text-slate-500">Loading...</p>

      <div
        v-else
        class="bg-white rounded-xl border border-slate-200 overflow-hidden"
      >
        <table class="w-full text-sm">
          <thead
            class="bg-slate-50 text-left text-slate-500 text-xs uppercase tracking-wide"
          >
            <tr>
              <th class="px-4 py-3">PHN</th>
              <th class="px-4 py-3">Name</th>
              <th class="px-4 py-3">DOB</th>
              <th class="px-4 py-3">Gender</th>
              <th class="px-4 py-3">Phone</th>
              <th class="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="patient in patients" :key="patient.id">
              <td class="px-4 py-3 font-mono text-xs text-slate-500">
                {{ patient.phn }}
              </td>
              <td class="px-4 py-3 font-medium text-ink">
                {{ patient.full_name }}
              </td>
              <td class="px-4 py-3">
                {{ patient.date_of_birth?.slice(0, 10) }}
              </td>
              <td class="px-4 py-3">
                {{ patient.gender }}
              </td>

              <td class="px-4 py-3">
                {{ patient.phone }}
              </td>

              <!--action button-->
              <td class="px-4 py-3 space-x-3">
                <router-link
                  :to="`/patients/${patient.id}`"
                  class="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View
                </router-link>

                <button
                  @click="startEdit(patient)"
                  class="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Edit
                </button>

                <button
                  v-if="
                    ['receptionist', 'nurse', 'admin'].includes(auth.user?.role)
                  "
                  @click="deletePatient(patient)"
                  class="text-red-600 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p
          v-if="!patients.length"
          class="px-4 py-6 text-center text-slate-400 text-sm"
        >
          No patients found.
        </p>
      </div>
    </main>
  </div>
</template>
