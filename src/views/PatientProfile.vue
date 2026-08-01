<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "../api/client";

const route = useRoute();

const patient = ref(null);

const loading = ref(true);

async function fetchPatient() {
  const { data } = await api.get(`/patients/${route.params.id}`);

  patient.value = data;

  loading.value = false;
}

onMounted(fetchPatient);
</script>

<template>
  <div class="max-w-6xl mx-auto p-6">
    <p v-if="loading">Loading patient...</p>

    <div v-if="patient">
      <h1 class="text-3xl font-bold mb-6">
        {{ patient.full_name }}
      </h1>

      <div class="bg-white rounded-xl shadow border p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Patient Information</h2>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <strong>PHN</strong><br />
            {{ patient.phn }}
          </div>

          <div>
            <strong>Birth Date</strong><br />
            {{ patient.date_of_birth }}
          </div>

          <div>
            <strong>Gender</strong><br />
            {{ patient.gender }}
          </div>

          <div>
            <strong>Blood Type</strong><br />
            {{ patient.blood_type }}
          </div>

          <div>
            <strong>Phone</strong><br />
            {{ patient.phone }}
          </div>

          <div>
            <strong>Created By</strong><br />
            {{ patient.created_by?.name || patient.createdBy?.name }}
          </div>
        </div>

        <div class="mt-5">
          <strong>Address</strong>

          <p class="mt-1 text-gray-700">
            {{ patient.address }}
          </p>
        </div>
      </div>
      <div class="bg-white rounded-xl shadow border p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Appointment History</h2>

        <table class="w-full text-sm">
          <thead class="border-b">
            <tr>
              <th class="text-left py-2">Date</th>
              <th class="text-left py-2">Department</th>
              <th class="text-left py-2">Doctor</th>
              <th class="text-left py-2">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="appointment in patient.appointments"
              :key="appointment.id"
            >
              <td class="py-3">
                {{ new Date(appointment.scheduled_at).toLocaleString() }}
              </td>

              <td>
                {{ appointment.department }}
              </td>

              <td>
                {{ appointment.doctor_name }}
              </td>

              <td>
                <span
                  class="px-2 py-1 rounded text-xs"
                  :class="{
                    'bg-yellow-100 text-yellow-700':
                      appointment.status == 'pending',
                    'bg-blue-100 text-blue-700':
                      appointment.status == 'confirmed',
                    'bg-green-100 text-green-700':
                      appointment.status == 'completed',
                    'bg-red-100 text-red-700':
                      appointment.status == 'cancelled',
                  }"
                >
                  {{ appointment.status }}
                </span>
              </td>
            </tr>

            <tr v-if="!patient.appointments.length">
              <td colspan="4" class="text-center py-4 text-gray-500">
                No appointments yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
