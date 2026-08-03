<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import api from "../api/client";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();

const staff = ref(null);
const totalPatients = ref(0);
const todaysAppointments = ref([]);
const myUpcomingAppointments = ref([]);
const totalUsers = ref(0);
const totalAppointments = ref(0);
const totalRecords = ref(0);
const notifications = ref([]);
const loading = ref(true);
const error = ref("");
const mobileMenuOpen = ref(false);

const role = computed(() => staff.value?.role || auth.user?.role || "");
const firstName = computed(() => staff.value?.name?.split(" ")[0] || "there");
const formattedRole = computed(() => {
  if (role.value === "receptionist") return "Receptionist";
  return role.value
    ? role.value.charAt(0).toUpperCase() + role.value.slice(1)
    : "";
});

const navigation = computed(() => {
  const items = [
    {
      label: "Dashboard",
      to: "/",
      icon: "dashboard",
      roles: ["admin", "doctor", "nurse", "receptionist"],
    },
    {
      label: "Patients",
      to: "/patients",
      icon: "patients",
      roles: ["admin", "doctor", "nurse", "receptionist"],
    },
    {
      label: "Appointments",
      to: "/appointments",
      icon: "calendar",
      roles: ["admin", "nurse", "receptionist"],
    },
    {
      label: "Doctors",
      to: "/doctors",
      icon: "doctor",
      roles: ["admin", "doctor", "nurse", "receptionist"],
    },
    {
      label: "Medical Records",
      to: "/medical-records",
      icon: "records",
      roles: ["admin", "doctor", "nurse", "receptionist"],
    },
    {
      label: "Consultation",
      to: "/consultation",
      icon: "consult",
      roles: ["doctor"],
    },
  ];

  return items.filter((item) => item.roles.includes(role.value));
});

const adminStats = computed(() => [
  {
    label: "Total users",
    value: totalUsers.value,
    icon: "users",
    tone: "teal",
    to: null,
  },
  {
    label: "Total patients",
    value: totalPatients.value,
    icon: "patients",
    tone: "blue",
    to: "/patients",
  },
  {
    label: "Appointments",
    value: totalAppointments.value,
    icon: "calendar",
    tone: "orange",
    to: "/appointments",
  },
  {
    label: "Medical records",
    value: totalRecords.value,
    icon: "records",
    tone: "violet",
    to: "/medical-records",
  },
]);

function iconPath(icon) {
  const icons = {
    dashboard: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z",
    patients:
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87m-2-11.96a4 4 0 0 1 0 7.75",
    users:
      "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87m-2-11.96a4 4 0 0 1 0 7.75",
    calendar:
      "M19 4H5a2 2 0 0 0-2 2v14h18V6a2 2 0 0 0-2-2ZM16 2v4M8 2v4M3 10h18",
    doctor: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm0-14v8m-4-4h8",
    records:
      "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8m-8 4h8",
    consult:
      "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Zm-13-4h8m-4-4v8",
    logout: "M10 17l5-5-5-5m5 5H3m12-9h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",
  };
  return icons[icon] || icons.dashboard;
}

function formatDateTime(value) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function statusClass(status) {
  const normalized = String(status || "pending").toLowerCase();
  if (["confirmed", "completed"].includes(normalized)) return "status-success";
  if (["cancelled", "canceled"].includes(normalized)) return "status-danger";
  return "status-warning";
}

async function fetchDashboard() {
  loading.value = true;
  error.value = "";

  try {
    const { data } = await api.get("/dashboard");
    staff.value = data.staff;
    notifications.value = data.notifications || [];

    if (data.staff.role === "admin") {
      totalUsers.value = data.total_users || 0;
      totalPatients.value = data.total_patients || 0;
      totalAppointments.value = data.total_appointments || 0;
      totalRecords.value = data.total_records || 0;
    } else if (data.staff.role === "doctor") {
      myUpcomingAppointments.value = data.my_upcoming_appointments || [];
    } else {
      totalPatients.value = data.total_patients || 0;
      todaysAppointments.value = data.todays_appointments || [];
    }
  } catch (requestError) {
    if (requestError.response?.status === 401) {
      await auth.logout();
      await router.replace("/login");
      return;
    }
    error.value = "We couldn't load your dashboard. Please try again.";
  } finally {
    loading.value = false;
  }
}

async function logout() {
  await auth.logout();
  await router.replace("/login");
}

onMounted(fetchDashboard);
</script>

<template>
  <div class="dashboard-shell min-h-screen bg-slate-50 text-slate-900">
    <div
      v-if="mobileMenuOpen"
      class="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-sm lg:hidden"
      @click="mobileMenuOpen = false"
    />

    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0"
      :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <img
          src="/segworks.jpg"
          alt="Segworks Technologies Corporation"
          class="h-16 w-16 rounded-lg object-contain"
        />
        <button
          class="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          @click="mobileMenuOpen = false"
          aria-label="Close menu"
        >
          <svg
            viewBox="0 0 24 24"
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <div class="px-5 pt-7">
        <p
          class="px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400"
        >
          Workspace
        </p>
      </div>
      <nav class="mt-3 flex-1 space-y-1 overflow-y-auto px-4">
        <router-link
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="nav-item group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-500 transition"
          active-class="nav-item-active"
          @click="mobileMenuOpen = false"
        >
          <svg
            viewBox="0 0 24 24"
            class="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path :d="iconPath(item.icon)" />
          </svg>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="border-t border-slate-100 p-4">
        <div class="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div
            class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-100 text-sm font-bold text-teal-700"
          >
            {{ staff?.name?.charAt(0)?.toUpperCase() || "S" }}
          </div>
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-slate-800">
              {{ staff?.name || auth.user?.name }}
            </p>
            <p class="truncate text-xs text-slate-500">{{ formattedRole }}</p>
          </div>
        </div>
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
          @click="logout"
        >
          <svg
            viewBox="0 0 24 24"
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path :d="iconPath('logout')" />
          </svg>
          Logout
        </button>
      </div>
    </aside>

    <div class="min-h-screen lg:pl-72">
      <header
        class="sticky top-0 z-20 flex h-20 items-center border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:px-8 lg:px-10"
      >
        <button
          class="mr-3 rounded-xl border border-slate-200 p-2.5 text-slate-600 lg:hidden"
          @click="mobileMenuOpen = true"
          aria-label="Open menu"
        >
          <svg
            viewBox="0 0 24 24"
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <div>
          <p class="text-sm font-semibold text-slate-800">Dashboard</p>
          <p class="hidden text-xs text-slate-400 sm:block">
            Your healthcare workspace at a glance
          </p>
        </div>
        <div class="ml-auto flex items-center gap-3">
          <div
            class="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 sm:flex"
          >
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            System online
          </div>
          <div
            class="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white"
          >
            {{ staff?.name?.charAt(0)?.toUpperCase() || "S" }}
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-[1500px] px-4 py-7 md:px-8 lg:px-10 lg:py-10">
        <div v-if="loading" class="space-y-6" aria-live="polite">
          <div class="h-28 animate-pulse rounded-3xl bg-slate-200"></div>
          <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div
              v-for="item in 4"
              :key="item"
              class="h-36 animate-pulse rounded-2xl bg-slate-200"
            ></div>
          </div>
        </div>

        <div
          v-else-if="error"
          class="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"
        >
          <div
            class="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600"
          >
            !
          </div>
          <h2 class="text-lg font-bold text-slate-900">
            Dashboard unavailable
          </h2>
          <p class="mt-2 text-sm text-slate-500">{{ error }}</p>
          <button
            class="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            @click="fetchDashboard"
          >
            Try again
          </button>
        </div>

        <template v-else>
          <section
            class="welcome-panel relative mb-7 overflow-hidden rounded-3xl bg-slate-900 px-6 py-7 text-white shadow-xl shadow-slate-900/10 md:px-9 md:py-9"
          >
            <div
              class="welcome-glow absolute -right-16 -top-28 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl"
            ></div>
            <div
              class="absolute -bottom-24 right-32 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl"
            ></div>
            <div
              class="relative flex flex-col justify-between gap-6 md:flex-row md:items-end"
            >
              <div>
                <div
                  class="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-teal-100"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-teal-300"></span>
                  {{ formattedRole }} workspace
                </div>
                <h1
                  class="font-display text-3xl font-bold tracking-tight md:text-4xl"
                >
                  Welcome back, {{ firstName }}.
                </h1>
                <p
                  class="mt-2 max-w-2xl text-sm leading-6 text-slate-300 md:text-base"
                >
                  <template v-if="role === 'admin'"
                    >Monitor your hospital operations and manage key resources
                    from one place.</template
                  >
                  <template v-else-if="role === 'doctor'"
                    >Review your assigned appointments and stay on top of
                    today's consultations.</template
                  >
                  <template v-else
                    >Keep today's patient flow organized and appointments
                    running smoothly.</template
                  >
                </p>
              </div>
              <p class="text-xs font-medium text-slate-400">
                {{
                  new Date().toLocaleDateString("en-PH", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })
                }}
              </p>
            </div>
          </section>

          <section v-if="notifications.length" class="mb-7">
            <div class="mb-3 flex items-center justify-between">
              <h2 class="text-sm font-bold text-slate-800">Notifications</h2>
              <span
                class="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600"
                >{{ notifications.length }} new</span
              >
            </div>
            <div class="grid gap-3 lg:grid-cols-2">
              <div
                v-for="(note, index) in notifications"
                :key="note.id || index"
                class="flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-sm"
                :class="
                  note.type === 'alert' ? 'border-amber-200' : 'border-teal-100'
                "
              >
                <div
                  class="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                  :class="
                    note.type === 'alert'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-teal-50 text-teal-600'
                  "
                >
                  <svg
                    v-if="note.type === 'alert'"
                    viewBox="0 0 24 24"
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M12 9v4m0 4h.01M10.3 3.7 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z"
                    />
                  </svg>
                  <svg
                    v-else
                    viewBox="0 0 24 24"
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 13h4"
                    />
                  </svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-800">
                    {{
                      note.type === "alert"
                        ? "Action needed"
                        : "Appointment reminder"
                    }}
                  </p>
                  <p class="mt-1 text-sm leading-5 text-slate-500">
                    {{ note.message }}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section v-if="role === 'admin'">
            <div class="mb-5">
              <h2 class="text-xl font-bold text-slate-900">
                Hospital overview
              </h2>
              <p class="mt-1 text-sm text-slate-500">
                A summary of your current system activity.
              </p>
            </div>
            <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <component
                v-for="stat in adminStats"
                :key="stat.label"
                :is="stat.to ? RouterLink : 'div'"
                :to="stat.to || undefined"
                class="stat-card group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition"
                :class="stat.to ? 'hover:-translate-y-0.5 hover:shadow-lg' : ''"
              >
                <div class="flex items-start justify-between">
                  <div
                    class="grid h-11 w-11 place-items-center rounded-xl"
                    :class="`tone-${stat.tone}`"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      class="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path :d="iconPath(stat.icon)" />
                    </svg>
                  </div>
                  <svg
                    v-if="stat.to"
                    viewBox="0 0 24 24"
                    class="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
                <p
                  class="mt-5 text-3xl font-bold tracking-tight text-slate-900"
                >
                  {{ stat.value.toLocaleString() }}
                </p>
                <p class="mt-1 text-sm font-medium text-slate-500">
                  {{ stat.label }}
                </p>
              </component>
            </div>
          </section>

          <section v-else-if="role === 'doctor'">
            <div
              class="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"
            >
              <div>
                <h2 class="text-xl font-bold text-slate-900">
                  My upcoming appointments
                </h2>
                <p class="mt-1 text-sm text-slate-500">
                  Only patients currently assigned to you are shown.
                </p>
              </div>
              <span
                class="w-fit rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700"
                >{{ myUpcomingAppointments.length }} scheduled</span
              >
            </div>
            <div
              class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div class="hidden overflow-x-auto md:block">
                <table class="w-full text-left text-sm">
                  <thead
                    class="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-[0.12em] text-slate-400"
                  >
                    <tr>
                      <th class="px-6 py-4 font-bold">Patient</th>
                      <th class="px-6 py-4 font-bold">Date & time</th>
                      <th class="px-6 py-4 font-bold">Status</th>
                      <th class="px-6 py-4 text-right font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr
                      v-for="appt in myUpcomingAppointments"
                      :key="appt.id"
                      class="transition hover:bg-slate-50/70"
                    >
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div
                            class="grid h-10 w-10 place-items-center rounded-full bg-sky-50 font-bold text-sky-700"
                          >
                            {{ appt.patient?.full_name?.charAt(0) || "P" }}
                          </div>
                          <div>
                            <p class="font-semibold text-slate-800">
                              {{ appt.patient?.full_name || "Unknown patient" }}
                            </p>
                            <p class="mt-0.5 text-xs text-slate-400">
                              PHN {{ appt.patient?.phn || "—" }}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-4 font-medium text-slate-600">
                        {{ formatDateTime(appt.scheduled_at) }}
                      </td>
                      <td class="px-6 py-4">
                        <span
                          class="status-pill"
                          :class="statusClass(appt.status)"
                          >{{ appt.status || "Pending" }}</span
                        >
                      </td>
                      <td class="px-6 py-4 text-right">
                        <router-link
                          v-if="
                            !['completed', 'cancelled', 'canceled'].includes(
                              String(appt.status).toLowerCase(),
                            )
                          "
                          :to="{
                            path: '/consultation',
                            query: { appointment: appt.id },
                          }"
                          class="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-teal-700"
                          >Consult
                          <span aria-hidden="true">→</span></router-link
                        ><span v-else class="text-xs text-slate-400"
                          >No action</span
                        >
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="divide-y divide-slate-100 md:hidden">
                <article
                  v-for="appt in myUpcomingAppointments"
                  :key="appt.id"
                  class="p-5"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="font-semibold text-slate-800">
                        {{ appt.patient?.full_name || "Unknown patient" }}
                      </p>
                      <p class="mt-1 text-xs text-slate-400">
                        PHN {{ appt.patient?.phn || "—" }}
                      </p>
                    </div>
                    <span
                      class="status-pill"
                      :class="statusClass(appt.status)"
                      >{{ appt.status || "Pending" }}</span
                    >
                  </div>
                  <p class="mt-4 text-sm text-slate-600">
                    {{ formatDateTime(appt.scheduled_at) }}
                  </p>
                  <router-link
                    v-if="
                      !['completed', 'cancelled', 'canceled'].includes(
                        String(appt.status).toLowerCase(),
                      )
                    "
                    :to="{
                      path: '/consultation',
                      query: { appointment: appt.id },
                    }"
                    class="mt-4 flex justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white"
                    >Consult patient</router-link
                  >
                </article>
              </div>
              <div
                v-if="!myUpcomingAppointments.length"
                class="px-6 py-14 text-center"
              >
                <div
                  class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400"
                >
                  <svg
                    viewBox="0 0 24 24"
                    class="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                  >
                    <path
                      d="M19 4H5a2 2 0 0 0-2 2v14h18V6a2 2 0 0 0-2-2ZM8 2v4m8-4v4M3 10h18"
                    />
                  </svg>
                </div>
                <p class="mt-4 font-semibold text-slate-700">
                  No upcoming appointments
                </p>
                <p class="mt-1 text-sm text-slate-400">
                  Your assigned appointments will appear here.
                </p>
              </div>
            </div>
          </section>

          <section v-else-if="role === 'receptionist' || role === 'nurse'">
            <div class="mb-7 grid gap-4 md:grid-cols-3">
              <div
                class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-slate-500">
                      Registered patients
                    </p>
                    <p class="mt-2 text-3xl font-bold text-slate-900">
                      {{ totalPatients.toLocaleString() }}
                    </p>
                  </div>
                  <div
                    class="tone-teal grid h-12 w-12 place-items-center rounded-xl"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      class="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                    >
                      <path :d="iconPath('patients')" />
                    </svg>
                  </div>
                </div>
              </div>
              <router-link
                to="/patients"
                class="quick-action group flex items-center justify-between rounded-2xl bg-teal-600 p-5 text-white shadow-lg shadow-teal-600/15 transition hover:bg-teal-700"
                ><div>
                  <p
                    class="text-xs font-semibold uppercase tracking-[0.14em] text-teal-100"
                  >
                    Quick action
                  </p>
                  <p class="mt-2 text-lg font-bold">New Patient</p>
                </div>
                <span
                  class="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-2xl transition group-hover:rotate-90"
                  >+</span
                ></router-link
              >
              <router-link
                to="/appointments"
                class="quick-action group flex items-center justify-between rounded-2xl bg-slate-900 p-5 text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800"
                ><div>
                  <p
                    class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"
                  >
                    Quick action
                  </p>
                  <p class="mt-2 text-lg font-bold">New Appointment</p>
                </div>
                <span
                  class="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-2xl transition group-hover:rotate-90"
                  >+</span
                ></router-link
              >
            </div>
            <div
              class="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"
            >
              <div>
                <h2 class="text-xl font-bold text-slate-900">
                  Today's appointments
                </h2>
                <p class="mt-1 text-sm text-slate-500">
                  Monitor today's patient schedule and confirmation status.
                </p>
              </div>
              <span
                class="w-fit rounded-full bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600"
                >{{ todaysAppointments.length }} today</span
              >
            </div>
            <div
              class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div class="hidden overflow-x-auto md:block">
                <table class="w-full text-left text-sm">
                  <thead
                    class="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-[0.12em] text-slate-400"
                  >
                    <tr>
                      <th class="px-6 py-4 font-bold">Patient</th>
                      <th class="px-6 py-4 font-bold">Doctor</th>
                      <th class="px-6 py-4 font-bold">Time</th>
                      <th class="px-6 py-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr
                      v-for="appt in todaysAppointments"
                      :key="appt.id"
                      class="transition hover:bg-slate-50/70"
                    >
                      <td class="px-6 py-4 font-semibold text-slate-800">
                        {{ appt.patient?.full_name || "Unknown patient" }}
                      </td>
                      <td class="px-6 py-4 text-slate-600">
                        {{
                          appt.doctor_name || appt.doctor?.name || "Unassigned"
                        }}
                      </td>
                      <td class="px-6 py-4 font-medium text-slate-600">
                        {{ formatTime(appt.scheduled_at) }}
                      </td>
                      <td class="px-6 py-4">
                        <span
                          class="status-pill"
                          :class="statusClass(appt.status)"
                          >{{ appt.status || "Pending" }}</span
                        >
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="divide-y divide-slate-100 md:hidden">
                <article
                  v-for="appt in todaysAppointments"
                  :key="appt.id"
                  class="p-5"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="font-semibold text-slate-800">
                        {{ appt.patient?.full_name || "Unknown patient" }}
                      </p>
                      <p class="mt-1 text-sm text-slate-500">
                        {{
                          appt.doctor_name || appt.doctor?.name || "Unassigned"
                        }}
                      </p>
                    </div>
                    <span
                      class="status-pill"
                      :class="statusClass(appt.status)"
                      >{{ appt.status || "Pending" }}</span
                    >
                  </div>
                  <p class="mt-3 text-sm font-semibold text-slate-600">
                    {{ formatTime(appt.scheduled_at) }}
                  </p>
                </article>
              </div>
              <div
                v-if="!todaysAppointments.length"
                class="px-6 py-14 text-center"
              >
                <div
                  class="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400"
                >
                  <svg
                    viewBox="0 0 24 24"
                    class="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                  >
                    <path
                      d="M19 4H5a2 2 0 0 0-2 2v14h18V6a2 2 0 0 0-2-2ZM8 2v4m8-4v4M3 10h18"
                    />
                  </svg>
                </div>
                <p class="mt-4 font-semibold text-slate-700">
                  No appointments today
                </p>
                <p class="mt-1 text-sm text-slate-400">
                  New bookings will appear here.
                </p>
              </div>
            </div>
          </section>
        </template>
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-shell {
  min-width: 320px;
}
.nav-item:hover {
  background: #f8fafc;
  color: #3478db;
}
.nav-item-active {
  background: #eff6ff;
  color: #285fae;
  font-weight: 700;
}
.nav-item-active::before {
  content: "";
  width: 3px;
  height: 20px;
  margin-left: -14px;
  margin-right: 11px;
  border-radius: 999px;
  background: #3478db;
}
.tone-teal {
  background: #eff6ff;
  color: #285fae;
}
.tone-blue {
  background: #eff6ff;
  color: #2563eb;
}
.tone-orange {
  background: #f0f5fd;
  color: #7098dc;
}
.tone-violet {
  background: #f3f6fb;
  color: #536f9f;
}
.status-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1;
  text-transform: capitalize;
}
.status-success {
  background: #ecfdf5;
  color: #047857;
}
.status-warning {
  background: #fffbeb;
  color: #b45309;
}
.status-danger {
  background: #fef2f2;
  color: #dc2626;
}
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>
