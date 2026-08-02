<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const email = ref("staff@example.com");
const password = ref("");
const error = ref("");
const submitting = ref(false);
const auth = useAuthStore();
const router = useRouter();

async function submit() {
  submitting.value = true;
  error.value = "";
  try {
    const result = await auth.login(email.value, password.value);

    console.log("Login successful!");
    console.log("Token:", localStorage.getItem("token"));
    console.log("User:", JSON.parse(localStorage.getItem("user")));

    router.push("/");
  } catch (e) {
    console.error(e);
    console.log("Response:", e.response?.data);
    error.value = "Invalid email or password";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="grid min-h-screen bg-white lg:grid-cols-[1.05fr_0.95fr]">
    <section
      class="relative hidden overflow-hidden bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between"
    >
      <div
        class="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-teal-400/20 blur-3xl"
      ></div>
      <div
        class="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl"
      ></div>
      <div class="relative flex items-center gap-3">
        <img
          src="/segworks.jpg"
          alt="Segworks Technologies Corporation"
          class="h-28 w-28 rounded-2xl object-contain shadow-xl"
        />
      </div>
      <div class="relative max-w-xl">
        <span
          class="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-teal-100"
          >Secure staff portal</span
        >
        <h1 class="mt-6 font-display text-5xl font-bold leading-tight">
          Connected care starts with a clear view.
        </h1>
        <p class="mt-5 max-w-lg text-base leading-7 text-slate-300">
          Manage patients, appointments, medical records, and consultations
          through one coordinated healthcare workspace.
        </p>
      </div>
      <p class="relative text-xs text-slate-500">
        Segworks Hospital Information System
      </p>
    </section>

    <section
      class="flex items-center justify-center bg-slate-50 px-5 py-12 sm:px-10"
    >
      <div class="w-full max-w-md">
        <div class="mb-9 flex items-center gap-3 lg:hidden">
          <img
            src="/segworks.jpg"
            alt="Segworks Technologies Corporation"
            class="h-24 w-24 rounded-xl object-contain shadow-sm"
          />
        </div>
        <div class="mb-8">
          <p
            class="text-xs font-bold uppercase tracking-[0.16em] text-teal-600"
          >
            Staff access
          </p>
          <h2 class="mt-3 font-display text-3xl font-bold text-slate-900">
            Welcome back
          </h2>
          <p class="mt-2 text-sm text-slate-500">
            Sign in with your staff credentials to continue.
          </p>
        </div>

        <form @submit.prevent="submit" class="space-y-5">
          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700"
              >Email</label
            >
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              required
              class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-semibold text-slate-700"
              >Password</label
            >
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <p
            v-if="error"
            class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {{ error }}
          </p>

          <button
            type="submit"
            :disabled="submitting"
            class="w-full rounded-xl bg-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/15 transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ submitting ? "Signing in…" : "Sign in" }}
          </button>
        </form>
        <p class="mt-8 text-center text-xs text-slate-400">
          Protected healthcare information. Authorized staff only.
        </p>
      </div>
    </section>
  </div>
</template>
