<script setup>
import { computed, ref, onMounted } from "vue";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";
import AppShell from "../components/AppShell.vue";

const auth = useAuthStore();
const canManagePatients = computed(() =>
  ["receptionist", "nurse", "admin"].includes(auth.user?.role),
);

const patients = ref([]);
const search = ref("");
const loading = ref(true);
const error = ref("");
const showForm = ref(false);
const customGender = ref("");

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
  error.value = "";

  try {
    const payload = {
      ...form.value,
      gender:
        form.value.gender === "Other"
          ? customGender.value.trim()
          : form.value.gender,
    };

    if (editingId.value) {
      await api.put(`/patients/${editingId.value}`, payload);
    } else {
      await api.post("/patients", payload);
    }
    resetForm();
    await fetchPatients();
  } catch (e) {
    const validationMessage = Object.values(e.response?.data?.errors || {})
      .flat()
      .find(Boolean);
    error.value =
      validationMessage || e.response?.data?.message || "Unable to save patient.";
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
  const savedGender = patient.gender || "";
  const standardGender = ["Male", "Female"].includes(savedGender);

  editingId.value = patient.id;
  showForm.value = true;
  customGender.value = standardGender ? "" : savedGender;
  form.value = {
    full_name: patient.full_name,
    date_of_birth: patient.date_of_birth?.slice(0, 10),
    gender: standardGender ? savedGender : savedGender ? "Other" : "",
    phone: patient.phone,
    address: patient.address,
    blood_type: patient.blood_type,
  };
}

function resetForm() {
  editingId.value = null;
  showForm.value = false;
  customGender.value = "";
  form.value = {
    full_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    address: "",
    blood_type: "",
  };
}

onMounted(fetchPatients);
</script>

<template>
  <AppShell title="Patients" subtitle="Manage patient registration and profiles">
      <div class="flex items-center justify-between mb-6">
        <h2 class="font-display text-2xl font-semibold text-ink">Patients</h2>
        <button
          v-if="canManagePatients"
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
          <select
            v-model="form.gender"
            class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input
            v-if="form.gender === 'Other'"
            v-model="customGender"
            placeholder="Please specify gender"
            required
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
                  v-if="canManagePatients"
                  @click="startEdit(patient)"
                  class="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Edit
                </button>

                <button
                  v-if="canManagePatients"
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
  </AppShell>
</template>
