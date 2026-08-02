<!--Importss-->
<script setup>
import { ref, onMounted } from "vue";
import api from "../api/client";
import { useRoute } from "vue-router";
import AppShell from "../components/AppShell.vue";

const route = useRoute();
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

    appointments.value = data.filter(
      (appointment) => !["completed", "cancelled"].includes(appointment.status),
    );
    const appointmentId = Number(route.query.appointment);

    if (appointmentId) {
      const matchingAppointment = appointments.value.find(
        (appointment) => appointment.id === appointmentId,
      );

      if (matchingAppointment) {
        openConsultation(matchingAppointment);
      }
    }
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
  <AppShell title="Consultation" subtitle="Review assigned patients and complete consultations">
    <div class="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div><h1 class="font-display text-2xl font-bold text-slate-900">Doctor consultations</h1><p class="mt-1 text-sm text-slate-500">Only active appointments assigned to your account are available here.</p></div>
      <span class="w-fit rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700">{{ appointments.length }} ready</span>
    </div>

    <div v-if="loading" class="space-y-3"><div v-for="item in 3" :key="item" class="h-20 animate-pulse rounded-2xl bg-slate-200"></div></div>
    <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{{ error }}</div>

    <div v-else class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div class="hidden overflow-x-auto md:block">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-[0.12em] text-slate-400"><tr><th class="px-6 py-4 font-bold">Patient</th><th class="px-6 py-4 font-bold">Appointment</th><th class="px-6 py-4 font-bold">Status</th><th class="px-6 py-4 text-right font-bold">Action</th></tr></thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="appt in appointments" :key="appt.id" class="transition hover:bg-slate-50/70">
              <td class="px-6 py-4"><div class="flex items-center gap-3"><div class="grid h-10 w-10 place-items-center rounded-full bg-sky-50 font-bold text-sky-700">{{ appt.patient?.full_name?.charAt(0) || 'P' }}</div><div><p class="font-semibold text-slate-800">{{ appt.patient?.full_name || 'Unknown patient' }}</p><p class="mt-0.5 text-xs text-slate-400">PHN {{ appt.patient?.phn || '—' }}</p></div></div></td>
              <td class="px-6 py-4 font-medium text-slate-600">{{ new Date(appt.scheduled_at).toLocaleString() }}</td>
              <td class="px-6 py-4"><span class="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold capitalize text-amber-700">{{ appt.status }}</span></td>
              <td class="px-6 py-4 text-right"><button class="rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700" @click="openConsultation(appt)">Consult →</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="divide-y divide-slate-100 md:hidden"><article v-for="appt in appointments" :key="appt.id" class="p-5"><div class="flex items-start justify-between gap-3"><div><p class="font-semibold text-slate-800">{{ appt.patient?.full_name || 'Unknown patient' }}</p><p class="mt-1 text-xs text-slate-400">PHN {{ appt.patient?.phn || '—' }}</p></div><span class="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold capitalize text-amber-700">{{ appt.status }}</span></div><p class="mt-3 text-sm text-slate-600">{{ new Date(appt.scheduled_at).toLocaleString() }}</p><button class="mt-4 w-full rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white" @click="openConsultation(appt)">Start consultation</button></article></div>
      <div v-if="!appointments.length" class="px-6 py-14 text-center"><p class="font-semibold text-slate-700">No active consultations</p><p class="mt-1 text-sm text-slate-400">Your assigned appointments will appear here.</p></div>
    </div>

    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      @click.self="showModal = false"
    >
      <div class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div class="sticky top-0 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-5"><div><h2 class="text-xl font-bold text-slate-900">New consultation</h2><p class="mt-1 text-sm text-slate-500">{{ selectedAppointment?.patient?.full_name }}</p></div><button class="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200" @click="showModal = false">✕</button></div>
        <form class="space-y-5 p-6" @submit.prevent="submitConsultation">
          <label class="block"><span class="mb-2 block text-sm font-semibold text-slate-700">Diagnosis</span><textarea v-model="consultation.diagnosis" required class="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" rows="2"></textarea></label>
          <label class="block"><span class="mb-2 block text-sm font-semibold text-slate-700">Consultation notes</span><textarea v-model="consultation.consultation_notes" class="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" rows="3"></textarea></label>
          <div class="grid gap-5 sm:grid-cols-2"><label class="block"><span class="mb-2 block text-sm font-semibold text-slate-700">Prescription</span><textarea v-model="consultation.prescription" class="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" rows="3"></textarea></label><label class="block"><span class="mb-2 block text-sm font-semibold text-slate-700">Treatment plan</span><textarea v-model="consultation.treatment_plan" class="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" rows="3"></textarea></label></div>
          <label class="block"><span class="mb-2 block text-sm font-semibold text-slate-700">Follow-up instructions</span><textarea v-model="consultation.follow_up_instructions" class="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20" rows="2"></textarea></label>
          <div class="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" class="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" @click="showModal = false">Cancel</button><button type="submit" class="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700">Save consultation</button></div>
        </form>
      </div>
    </div>
  </AppShell>
</template>
