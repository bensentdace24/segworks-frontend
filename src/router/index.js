import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import Appointments from "../views/Appointments.vue";
import Doctors from "../views/Doctors.vue";
import MedicalRecords from "../views/MedicalRecords.vue";
import Patients from "../views/Patients.vue";
import Consultation from "../views/Consultations.vue";

const routes = [
  { path: "/login", component: Login },
  { path: "/", component: Dashboard, meta: { requiresAuth: true } },
  {
    path: "/appointments",
    component: Appointments,
    meta: { requiresAuth: true },
  },
  { path: "/doctors", component: Doctors, meta: { requiresAuth: true } },
  {
    path: "/medical-records",
    component: MedicalRecords,
    meta: { requiresAuth: true },
  },

  //Patients route
  {
    path: "/patients",
    component: Patients,
    meta: { requiresAuth: true },
  },

  //consultation
  {
    path: "/consultations",
    component: Consultation,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.token) {
    return "/login";
  }
});

export default router;
