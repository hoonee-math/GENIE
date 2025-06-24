<template>
    <div :class="isLoginOrLanding ? 'min-h-screen w-full bg-white' : ''">
        <RouterView />
    </div>
</template>

<script setup>
import { RouterView, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { computed, onMounted } from "vue";

const authStore = useAuthStore();
const route = useRoute();

const isLoginOrLanding = computed(() => {
    return route.path === "/login" || route.path === "/landing";
});

onMounted(() => {
    authStore.initializeAuth();
});
</script>

<style scoped>
.login-bg {
    min-height: 100vh;
    width: 100%;
    background-color: #fff;
}
</style>
