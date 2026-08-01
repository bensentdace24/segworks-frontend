<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "../api/client";

const route = useRoute();

const patient = ref(null);
const loading = ref(true);
const error = ref("");

async function fetchPatient() {
  try {
    const { data } = await api.get(`/patients/${route.params.id}`);

    console.log("Patient profile:", data);

    patient.value = data;
  } catch (e) {
    console.error("Patient profile error:", e.response?.data);

    error.value =
      e.response?.data?.message || "Unable to load patient information.";
  } finally {
    loading.value = false;
  }
}

onMounted(fetchPatient);
</script>
<template>
  <div class="max-w-6xl mx-auto p-6">
    <p v-if="loading" class="text-slate-500">Loading patient...</p>

    <p v-else-if="error" class="text-red-600">
      {{ error }}
    </p>

    <div v-else-if="patient">
      <h1 class="text-3xl font-bold mb-6">
        {{ patient.full_name }}
      </h1>

      <!-- PATIENT INFORMATION -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Patient Information</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <p class="text-sm text-slate-500">PHN</p>
            <p class="font-medium">{{ patient.phn || "—" }}</p>
          </div>

          <div>
            <p class="text-sm text-slate-500">Date of Birth</p>
            <p class="font-medium">
              {{ patient.date_of_birth?.slice(0, 10) || "—" }}
            </p>
          </div>

          <div>
            <p class="text-sm text-slate-500">Gender</p>
            <p class="font-medium">{{ patient.gender || "—" }}</p>
          </div>

          <div>
            <p class="text-sm text-slate-500">Blood Type</p>
            <p class="font-medium">{{ patient.blood_type || "—" }}</p>
          </div>

          <div>
            <p class="text-sm text-slate-500">Phone</p>
            <p class="font-medium">{{ patient.phone || "—" }}</p>
          </div>

          <div>
            <p class="text-sm text-slate-500">Created By</p>
            <p class="font-medium">
              {{ patient.created_by?.name || "—" }}
            </p>
          </div>
        </div>

        <div class="mt-5">
          <p class="text-sm text-slate-500">Address</p>
          <p class="font-medium">{{ patient.address || "—" }}</p>
        </div>
      </div>

      <!-- APPOINTMENT HISTORY -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Appointment History</h2>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="border-b text-left text-slate-500">
              <tr>
                <th class="py-3 pr-4">Date</th>
                <th class="py-3 pr-4">Doctor</th>
                <th class="py-3 pr-4">Department</th>
                <th class="py-3">Status</th>
              </tr>
            </thead>

            <tbody class="divide-y">
              <tr
                v-for="appointment in patient.appointments"
                :key="appointment.id"
              >
                <td class="py-3 pr-4">
                  {{ new Date(appointment.scheduled_at).toLocaleString() }}
                </td>

                <td class="py-3 pr-4">
                  {{ appointment.doctor_name || "Unassigned" }}
                </td>

                <td class="py-3 pr-4">
                  {{ appointment.department || "—" }}
                </td>

                <td class="py-3">
                  {{ appointment.status }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p
          v-if="!patient.appointments?.length"
          class="text-slate-500 text-sm mt-4"
        >
          No appointments found.
        </p>
      </div>

      <!-- CONSULTATION HISTORY -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Consultation History</h2>

        <div
          v-for="appointment in patient.appointments"
          :key="`consultation-${appointment.id}`"
          class="mb-4"
        >
          <div
            v-if="appointment.patient_case?.diagnosis"
            class="border border-slate-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between gap-4 mb-4">
              <div>
                <h3 class="font-semibold">
                  {{ appointment.doctor_name || "Doctor not assigned" }}
                </h3>

                <p class="text-sm text-slate-500">
                  {{ appointment.department || "No department" }}
                </p>
              </div>

              <span class="text-sm text-slate-500">
                {{ new Date(appointment.scheduled_at).toLocaleString() }}
              </span>
            </div>

            <div class="space-y-4 text-sm">
              <div>
                <p class="font-medium">Diagnosis</p>
                <p class="mt-1 whitespace-pre-line">
                  {{ appointment.patient_case.diagnosis || "—" }}
                </p>
              </div>

              <div>
                <p class="font-medium">Consultation Notes</p>
                <p class="mt-1 whitespace-pre-line">
                  {{ appointment.patient_case.consultation_notes || "—" }}
                </p>
              </div>

              <div>
                <p class="font-medium">Prescription</p>
                <p class="mt-1 whitespace-pre-line">
                  {{ appointment.patient_case.prescription || "—" }}
                </p>
              </div>

              <div>
                <p class="font-medium">Treatment Plan</p>
                <p class="mt-1 whitespace-pre-line">
                  {{ appointment.patient_case.treatment_plan || "—" }}
                </p>
              </div>

              <div>
                <p class="font-medium">Follow-up Instructions</p>
                <p class="mt-1 whitespace-pre-line">
                  {{ appointment.patient_case.follow_up_instructions || "—" }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <p
          v-if="
            !patient.appointments?.some(
              (appointment) => appointment.patient_case?.diagnosis,
            )
          "
          class="text-slate-500 text-sm"
        >
          No completed consultations found.
        </p>
      </div>

      <!-- MEDICAL RECORDS -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <h2 class="text-xl font-semibold mb-4">Medical Records</h2>

        <div
          v-for="record in patient.medical_records"
          :key="record.id"
          class="border-b border-slate-100 py-4 last:border-0"
        >
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="font-medium">{{ record.title }}</p>
              <p class="text-sm text-slate-500">
                {{ record.record_type }}
              </p>
            </div>

            <span class="text-sm text-slate-500">
              {{ record.recorded_at?.slice(0, 10) }}
            </span>
          </div>

          <p class="mt-3 whitespace-pre-line text-sm">
            {{ record.summary }}
          </p>
        </div>

        <p
          v-if="!patient.medical_records?.length"
          class="text-slate-500 text-sm"
        >
          No medical records found.
        </p>
      </div>
    </div>
  </div>
</template>
