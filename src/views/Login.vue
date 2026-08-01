<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const email = ref("staff@example.com");
const password = ref("");
const error = ref("");
const auth = useAuthStore();
const router = useRouter();

async function submit() {
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
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-surface">
    <div
      class="w-full max-w-sm bg-white rounded-xl shadow-sm border border-slate-200 p-8"
    >
      <h1 class="font-display text-2xl font-semibold text-primary-700 mb-1">
        SegHIS
      </h1>
      <p class="text-sm text-slate-500 mb-6">Staff sign in</p>

      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Email</label
          >
          <input
            v-model="email"
            type="email"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Password</label
          >
          <input
            v-model="password"
            type="password"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <button
          type="submit"
          class="w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg py-2.5 transition-colors"
        >
          Sign in
        </button>
      </form>
    </div>
  </div>
</template>
