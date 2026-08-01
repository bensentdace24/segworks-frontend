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
    path: "/medical-records",
    component: MedicalRecords,
    meta: {
      requiresAuth: true,
      roles: ["receptionist", "nurse", "doctor", "admin"],
    },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.requiresAuth && !auth.token) {
    return "/login";
  }
  console.log("Navigation check:", {
    destination: to.path,
    requiresAuth: to.meta.requiresAuth,
    allowedRoles: to.meta.roles,
    currentRole: auth.user?.role,
    hasToken: Boolean(auth.token),
  });

  const allowedRoles = to.meta.roles;
  const userRole = auth.user?.role;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.log("Route blocked:", {
      destination: to.path,
      userRole,
      allowedRoles,
    });

    return "/";
  }
});

export default router;
