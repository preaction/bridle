<script setup lang="ts">
import { ref } from "vue";
console.log('👋 This message is being logged by "App.vue", included via Vite');

let url = "https://govhub.com/sunshine/demo";
function loadUrl(url: string) {
  electron.loadUrl(url);
}

const steps = ref([]);
electron.onStep((step) => {
  steps.value.push(step);
});
</script>

<template>
  <div class="toolbar">
    <input v-model="url" />
    <button @click="loadUrl(url)">Go</button>
  </div>

  <div class="steps">
    <h2>Steps</h2>
    <div v-for="step in steps">
      {{ step.action }} {{ step.value }} on {{ step.locator.role }}
      {{ step.locator.name }}
    </div>
  </div>
</template>

<style>
.toolbar {
  position: fixed;
  top: 0;
  left: 240px;
  right: 0;
  height: 64px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}
.toolbar input {
  flex: 1 1 auto;
}
.steps {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  bottom: 0;
  overflow: auto;
  margin: 5px;
  display: flex;
  flex-flow: column;
}
.steps > * {
  padding: 0.2em;
}
</style>
