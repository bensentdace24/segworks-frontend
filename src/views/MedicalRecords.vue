<script setup>
import { computed, onMounted, ref } from "vue";
import api from "../api/client";
import AppShell from "../components/AppShell.vue";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();

const records = ref([]);
const loading = ref(true);
const error = ref("");
const search = ref("");
const selectedRecord = ref(null);
const patients = ref([]);
const showForm = ref(false);
const saving = ref(false);
const formError = ref("");
const canCreateRecord = computed(() =>
  ["doctor", "nurse", "admin"].includes(auth.user?.role),
);

function currentLocalDateTime() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

const form = ref({
  patient_id: "",
  record_type: "",
  title: "",
  summary: "",
  recorded_at: currentLocalDateTime(),
});

const filteredRecords = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return records.value;

  return records.value.filter((record) =>
    [
      record.patient?.full_name,
      record.patient?.phn,
      record.record_type,
      record.title,
    ].some((value) => String(value || "").toLowerCase().includes(term)),
  );
});

async function fetchRecords() {
  loading.value = true;
  error.value = "";

  try {
    const { data } = await api.get("/medical-records");
    records.value = data;
  } catch (requestError) {
    error.value =
      requestError.response?.data?.message || "Unable to load medical records.";
  } finally {
    loading.value = false;
  }
}

async function fetchPatients() {
  if (!canCreateRecord.value) return;
  const { data } = await api.get("/patients");
  patients.value = data;
}

function resetForm() {
  showForm.value = false;
  formError.value = "";
  form.value = {
    patient_id: "",
    record_type: "",
    title: "",
    summary: "",
    recorded_at: currentLocalDateTime(),
  };
}

async function submitRecord() {
  saving.value = true;
  formError.value = "";

  try {
    await api.post("/medical-records", form.value);
    resetForm();
    await fetchRecords();
  } catch (requestError) {
    const validationMessage = Object.values(
      requestError.response?.data?.errors || {},
    )
      .flat()
      .find(Boolean);
    formError.value =
      validationMessage ||
      requestError.response?.data?.message ||
      "Unable to save the medical record.";
  } finally {
    saving.value = false;
  }
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function typeClass(type) {
  const normalized = String(type || "").toLowerCase();
  if (normalized.includes("lab")) return "bg-violet-50 text-violet-700";
  if (normalized.includes("diagnosis")) return "bg-amber-50 text-amber-700";
  return "bg-blue-50 text-blue-700";
}

onMounted(() => Promise.all([fetchRecords(), fetchPatients()]));
</script>

<template>
  <AppShell
    title="Medical Records"
    subtitle="Review clinical documentation across patients"
  >
    <div class="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <h1 class="font-display text-2xl font-bold text-slate-900">
          Medical records
        </h1>
        <p class="mt-1 text-sm text-slate-500">
          Consultation summaries, diagnoses, and test results in one place.
        </p>
      </div>
      <div class="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
        <input
          v-model="search"
          type="search"
          placeholder="Search patient, PHN, type, or title"
          class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 lg:w-96"
        />
        <button
          v-if="canCreateRecord"
          class="whitespace-nowrap rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
          @click="showForm ? resetForm() : (showForm = true)"
        >
          {{ showForm ? "Cancel" : "+ New Record" }}
        </button>
      </div>
    </div>

    <form
      v-if="showForm"
      class="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      @submit.prevent="submitRecord"
    >
      <div class="mb-5">
        <h2 class="text-lg font-bold text-slate-900">New medical record</h2>
        <p class="mt-1 text-sm text-slate-500">
          Add a diagnosis, laboratory result, or other clinical document.
        </p>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-slate-700">Patient</span>
          <select
            v-model="form.patient_id"
            required
            class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Select patient</option>
            <option v-for="patient in patients" :key="patient.id" :value="patient.id">
              {{ patient.full_name }} ({{ patient.phn }})
            </option>
          </select>
        </label>
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-slate-700">Record type</span>
          <select
            v-model="form.record_type"
            required
            class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Select type</option>
            <option value="Diagnosis">Diagnosis</option>
            <option value="Lab Result">Lab Result</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-slate-700">Title</span>
          <input
            v-model="form.title"
            required
            maxlength="255"
            placeholder="e.g. Complete Blood Count"
            class="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </label>
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-slate-700">Recorded date and time</span>
          <input
            v-model="form.recorded_at"
            type="datetime-local"
            required
            class="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </label>
        <label class="block sm:col-span-2">
          <span class="mb-2 block text-sm font-semibold text-slate-700">Clinical summary</span>
          <textarea
            v-model="form.summary"
            required
            rows="5"
            placeholder="Enter findings, results, or clinical notes"
            class="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          ></textarea>
        </label>
      </div>
      <p
        v-if="formError"
        class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
      >
        {{ formError }}
      </p>
      <div class="mt-5 flex justify-end gap-3">
        <button
          type="button"
          class="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          @click="resetForm"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="saving"
          class="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ saving ? "Saving…" : "Save record" }}
        </button>
      </div>
    </form>

    <div v-if="loading" class="space-y-3">
      <div
        v-for="item in 5"
        :key="item"
        class="h-20 animate-pulse rounded-2xl bg-slate-200"
      ></div>
    </div>

    <div
      v-else-if="error"
      class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700"
    >
      {{ error }}
    </div>

    <div
      v-else
      class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div class="hidden overflow-x-auto md:block">
        <table class="w-full text-left text-sm">
          <thead
            class="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-[0.12em] text-slate-400"
          >
            <tr>
              <th class="px-6 py-4 font-bold">Patient</th>
              <th class="px-6 py-4 font-bold">Type</th>
              <th class="px-6 py-4 font-bold">Record</th>
              <th class="px-6 py-4 font-bold">Date</th>
              <th class="px-6 py-4 text-right font-bold">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="record in filteredRecords"
              :key="record.id"
              class="transition hover:bg-slate-50/70"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 font-bold text-blue-700"
                  >
                    {{ record.patient?.full_name?.charAt(0) || "P" }}
                  </div>
                  <div>
                    <p class="font-semibold text-slate-800">
                      {{ record.patient?.full_name || "Unknown patient" }}
                    </p>
                    <p class="mt-0.5 text-xs text-slate-400">
                      PHN {{ record.patient?.phn || "—" }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex rounded-full px-2.5 py-1 text-xs font-bold"
                  :class="typeClass(record.record_type)"
                >
                  {{ record.record_type || "Record" }}
                </span>
              </td>
              <td class="px-6 py-4 font-semibold text-slate-700">
                {{ record.title || "Untitled record" }}
              </td>
              <td class="px-6 py-4 text-slate-500">
                {{ formatDate(record.recorded_at) }}
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  class="rounded-xl border border-blue-200 px-3.5 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
                  @click="selectedRecord = record"
                >
                  View details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="divide-y divide-slate-100 md:hidden">
        <article
          v-for="record in filteredRecords"
          :key="record.id"
          class="p-5"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-semibold text-slate-800">
                {{ record.patient?.full_name || "Unknown patient" }}
              </p>
              <p class="mt-1 text-xs text-slate-400">
                PHN {{ record.patient?.phn || "—" }}
              </p>
            </div>
            <span
              class="rounded-full px-2.5 py-1 text-xs font-bold"
              :class="typeClass(record.record_type)"
            >
              {{ record.record_type || "Record" }}
            </span>
          </div>
          <p class="mt-4 font-semibold text-slate-700">{{ record.title }}</p>
          <div class="mt-4 flex items-center justify-between">
            <p class="text-sm text-slate-500">
              {{ formatDate(record.recorded_at) }}
            </p>
            <button
              class="text-sm font-bold text-blue-700"
              @click="selectedRecord = record"
            >
              View details →
            </button>
          </div>
        </article>
      </div>

      <div v-if="!filteredRecords.length" class="px-6 py-16 text-center">
        <div
          class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400"
        >
          <svg
            viewBox="0 0 24 24"
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16h16V8l-6-6Zm0 0v6h6M8 13h8m-8 4h6" />
          </svg>
        </div>
        <p class="mt-4 font-semibold text-slate-700">No records found</p>
        <p class="mt-1 text-sm text-slate-400">
          Try another search or complete a patient consultation.
        </p>
      </div>
    </div>

    <div
      v-if="selectedRecord"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      @click.self="selectedRecord = null"
    >
      <section
        class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
      >
        <header
          class="sticky top-0 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-5"
        >
          <div>
            <span
              class="inline-flex rounded-full px-2.5 py-1 text-xs font-bold"
              :class="typeClass(selectedRecord.record_type)"
            >
              {{ selectedRecord.record_type }}
            </span>
            <h2 class="mt-3 text-xl font-bold text-slate-900">
              {{ selectedRecord.title }}
            </h2>
          </div>
          <button
            class="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
            aria-label="Close record details"
            @click="selectedRecord = null"
          >
            ✕
          </button>
        </header>
        <div class="p-6">
          <div class="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <p class="text-xs font-bold uppercase tracking-wide text-slate-400">Patient</p>
              <p class="mt-1 font-semibold text-slate-800">
                {{ selectedRecord.patient?.full_name || "Unknown patient" }}
              </p>
            </div>
            <div>
              <p class="text-xs font-bold uppercase tracking-wide text-slate-400">PHN</p>
              <p class="mt-1 font-semibold text-slate-800">
                {{ selectedRecord.patient?.phn || "—" }}
              </p>
            </div>
            <div>
              <p class="text-xs font-bold uppercase tracking-wide text-slate-400">Recorded on</p>
              <p class="mt-1 font-semibold text-slate-800">
                {{ formatDate(selectedRecord.recorded_at) }}
              </p>
            </div>
          </div>
          <div class="mt-6">
            <h3 class="text-sm font-bold text-slate-800">Clinical summary</h3>
            <p class="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
              {{ selectedRecord.summary || "No clinical summary was provided." }}
            </p>
          </div>
        </div>
      </section>
    </div>
  </AppShell>
</template>
