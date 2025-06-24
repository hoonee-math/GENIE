<!-- @/components/main/SideNavBarComponent.vue -->
<template>
    <div class="sidebar">
      <div class="logo">
        <h2>GenieQ</h2>
      </div>
      <ul class="nav-links">
        <li>
          <router-link to="/home" :class="{ active: currentPath === '/home' }">
            <span>Home</span>
          </router-link>
        </li>
        <li>
          <router-link to="/immediately" :class="{ active: currentPath === '/immediately' }">
            <span>즉시 호출됨</span>
          </router-link>
        </li>
        <li>
          <router-link to="/delay" :class="{ active: currentPath === '/delay' }">
            <span>지연 호출</span>
          </router-link>
        </li>
      </ul>
    </div>
  </template>
  
<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const currentPath = computed(() => route.path);
</script>

<style scoped>

</style>