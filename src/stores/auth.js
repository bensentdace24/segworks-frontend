import { defineStore } from "pinia";
import api from "../api/client";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
  }),

  actions: {
    async login(email, password) {
      const { data } = await api.post("/login", { email, password });
      this.user = data.user;
      this.token = data.token;
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    },
    async logout() {
      try {
        // Attempt to revoke the token on Laravel.
        if (this.token) {
          await api.post("/logout");
        }
      } catch (error) {
        // A 401 means the token was already expired or revoked.
        console.warn("Server logout failed:", error.response?.status);
      } finally {
        // Always clear the frontend session.
        this.user = null;
        this.token = null;

        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },
  },
});
