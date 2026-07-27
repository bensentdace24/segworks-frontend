<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const email = ref("juan@example.com");
const password = ref("123");
const error = ref("");
const auth = useAuthStore();
const router = useRouter();

async function submit() {
  try {
    await auth.login(email.value, password.value);
    router.push("/");
  } catch (e) {
    error.value = "Login Failed";
  }
}
</script>

<template>
  <form @submit.prevent="submit">
    <input v-model="email" type="email" />
    <input v-model="password" type="password" />
    <button type="submit">Login</button>
    <p v-if="error">{{ error }}</p>
  </form>
</template>
