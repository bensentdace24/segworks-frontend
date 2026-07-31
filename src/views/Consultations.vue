<!--Importss-->
<script setup>
import { ref, onMounted } from "vue";
import api from "../api/client";

const appointments = ref([]);
const loading = ref(true);
const error = ref("");

const consultation = ref({
  diagnosis: "",
  consultation_notes: "",
  prescription: "",
  treatment_plan: "",
  follow_up_instructions: "",
});

const selectedAppointment = ref(null);
const showModal = ref(false);

//Load appointments
async function fetchAppointments() {
  loading.value = true;

  try {
    const { data } = await api.get("/appointments");

    appointments.value = data.filter((a) => a.status !== "completed");
  } catch (e) {
    error.value = "Unable to load appointments.";
  } finally {
    loading.value = false;
  }
}

//Open consultation
function openConsultation(appt) {
  selectedAppointment.value = appt;

  consultation.value = {
    diagnosis: "",
    consultation_notes: "",
    prescription: "",
    treatment_plan: "",
    follow_up_instructions: "",
  };

  showModal.value = true;
}

//Submit consultation
async function submitConsultation() {
  try {
    await api.post(
      `/appointments/${selectedAppointment.value.id}/consult`,

      consultation.value,
    );

    showModal.value = false;

    await fetchAppointments();

    alert("Consultation completed!");
  } catch (e) {
    alert(e.response?.data?.message || "Consultation failed.");
  }
}
onMounted(fetchAppointments);
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Doctor Consultations</h1>

    <p v-if="loading">Loading...</p>

    <p v-if="error" class="text-red-500">
      {{ error }}
    </p>

    <table v-if="!loading" class="table-auto border w-full">
      <thead>
        <tr>
          <th class="border p-2">Patient</th>

          <th class="border p-2">Date</th>

          <th class="border p-2">Status</th>

          <th class="border p-2"></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="appt in appointments" :key="appt.id">
          <td class="border p-2">
            {{ appt.patient?.full_name }}
          </td>

          <td class="border p-2">
            {{ new Date(appt.scheduled_at).toLocaleString() }}
          </td>

          <td class="border p-2">
            {{ appt.status }}
          </td>

          <td class="border p-2">
            <button
              @click="openConsultation(appt)"
              class="bg-green-600 text-white px-3 py-1 rounded"
            >
              Consult
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
