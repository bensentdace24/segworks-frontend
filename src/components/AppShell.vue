<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "SegHIS healthcare workspace" },
});

const auth = useAuthStore();
const router = useRouter();
const mobileMenuOpen = ref(false);
const role = computed(() => auth.user?.role || "");
const displayRole = computed(() =>
  role.value
    ? role.value.charAt(0).toUpperCase() + role.value.slice(1)
    : "Staff",
);

const navigation = computed(() =>
  [
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
  ].filter((item) => item.roles.includes(role.value)),
);

const icons = {
  dashboard: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z",
  patients:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87m-2-11.96a4 4 0 0 1 0 7.75",
  calendar: "M19 4H5a2 2 0 0 0-2 2v14h18V6a2 2 0 0 0-2-2ZM16 2v4M8 2v4M3 10h18",
  doctor: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm0-14v8m-4-4h8",
  records:
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8m-8 4h8",
  consult:
    "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Zm-13-4h8m-4-4v8",
  logout: "M10 17l5-5-5-5m5 5H3m12-9h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",
};

async function logout() {
  await auth.logout();
  await router.replace("/login");
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
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
          aria-label="Close menu"
          @click="mobileMenuOpen = false"
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
          class="shell-nav-item flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-500 transition"
          active-class="shell-nav-active"
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
            <path :d="icons[item.icon]" /></svg
          ><span>{{ item.label }}</span>
        </router-link>
      </nav>
      <div class="border-t border-slate-100 p-4">
        <div class="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div
            class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-teal-100 text-sm font-bold text-teal-700"
          >
            {{ auth.user?.name?.charAt(0)?.toUpperCase() || "S" }}
          </div>
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-slate-800">
              {{ auth.user?.name || "SegHIS Staff" }}
            </p>
            <p class="truncate text-xs text-slate-500">{{ displayRole }}</p>
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
            <path :d="icons.logout" /></svg
          >Logout
        </button>
      </div>
    </aside>
    <div class="min-h-screen lg:pl-72">
      <header
        class="sticky top-0 z-20 flex h-20 items-center border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur md:px-8 lg:px-10"
      >
        <button
          class="mr-3 rounded-xl border border-slate-200 p-2.5 text-slate-600 lg:hidden"
          aria-label="Open menu"
          @click="mobileMenuOpen = true"
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
          <p class="text-sm font-semibold text-slate-800">{{ title }}</p>
          <p class="hidden text-xs text-slate-400 sm:block">{{ subtitle }}</p>
        </div>
        <div class="ml-auto flex items-center gap-3">
          <div
            class="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 sm:flex"
          >
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>System
            online
          </div>
          <div
            class="grid h-10 w-10 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white"
          >
            {{ auth.user?.name?.charAt(0)?.toUpperCase() || "S" }}
          </div>
        </div>
      </header>
      <main class="mx-auto max-w-[1500px] px-4 py-7 md:px-8 lg:px-10 lg:py-10">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell-nav-item:hover {
  background: #f8fafc;
  color: #3478db;
}
.shell-nav-active {
  background: #eff6ff;
  color: #285fae;
  font-weight: 700;
}
.shell-nav-active::before {
  content: "";
  width: 3px;
  height: 20px;
  margin-left: -14px;
  margin-right: 11px;
  border-radius: 999px;
  background: #3478db;
}
</style>
