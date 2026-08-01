import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import Appointments from "../views/Appointments.vue";
import Doctors from "../views/Doctors.vue";
import MedicalRecords from "../views/MedicalRecords.vue";
import Patients from "../views/Patients.vue";
import Consultation from "../views/Consultations.vue";
import PatientProfile from "../views/PatientProfile.vue";

const routes = [
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/",
    component: Dashboard,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/doctors",
    component: Doctors,
    meta: {
      requiresAuth: true,
      roles: ["receptionist", "doctor", "nurse", "admin"],
    },
  },
  {
    path: "/patients",
    component: Patients,
    meta: {
      requiresAuth: true,
      roles: ["receptionist", "doctor", "nurse", "admin"],
    },
  },
  {
    path: "/patients/:id",
    component: PatientProfile,
    meta: {
      requiresAuth: true,
      roles: ["receptionist", "doctor", "nurse", "admin"],
    },
  },
  {
    path: "/appointments",
    component: Appointments,
    meta: {
      requiresAuth: true,
      roles: ["receptionist", "admin"],
    },
  },
  {
    path: "/consultation",
    component: Consultation,
    meta: {
      requiresAuth: true,
      roles: ["doctor"],
    },
  },
  {
    path: "/medical-records",
    component: MedicalRecords,
    meta: {
      requiresAuth: true,
      roles: ["doctor", "nurse", "admin"],
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.token) {
    return {
      path: "/login",
      query: { redirect: to.fullPath },
    };
  }

  const allowedRoles = to.meta.roles;
  const userRole = auth.user?.role;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return "/";
  }

  if (to.path === "/login" && auth.token) {
    return "/";
  }
});

export default router;
