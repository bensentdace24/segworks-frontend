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
      await api.post("/logout");
      this.user = null;
      this.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});
