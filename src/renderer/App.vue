<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import {
  Play,
  Circle,
  Square,
  ArrowLeft,
  ArrowRight,
  RotateCw,
} from "@lucide/vue";

let state = ref({ recording: true, playing: false });
function stop() {
  state.value.recording = false;
  state.value.playing = false;
}
function record() {
  state.value.recording = true;
}
function play() {
  state.value.playing = true;
}

let url = ref("https://govhub.com/sunshine/demo");
function loadUrl() {
  electron.loadUrl(url.value);
}
electron.onLocation((newUrl) => {
  url.value = newUrl;
});

const steps = ref([]);
const stepList = useTemplateRef("step-list");

electron.onStep((step) => {
  steps.value.push(step);
  stepList.lastElementChild?.scrollIntoView();
});
</script>

<template>
  <div class="toolbar">
    <button @click="goBack()">
      <ArrowLeft class="icon" />
    </button>
    <button @click="goForward()">
      <ArrowRight class="icon" />
    </button>
    <button @click="refresh()">
      <RotateCw class="icon" />
    </button>
    <input v-model="url" @keypress.enter="loadUrl()" />
  </div>

  <div class="steps">
    <div class="steps-bar">
      <button v-if="!state.recording && !state.playing" @click="record()">
        <Circle />
        Record
      </button>
      <button v-else @click="stop()">
        <Square />
        Stop
      </button>
      <button :disabled="state.recording || state.playing" @click="play()">
        <Play />
        Play
      </button>
    </div>
    <div ref="step-list" class="step-list">
      <div v-for="step in steps" class="step">
        <span v-if="step.action === 'open'"> User opens {{ step.url }} </span>
        <span v-else>
          {{ step.action }} {{ step.value }} on {{ step.locator.role }}
          {{ step.locator.name }}
          {{ JSON.stringify(step, null, 2) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style>
.toolbar {
  position: fixed;
  top: 0;
  left: 234px;
  z-index: 10;
  right: 0;
  height: 32px;
  margin: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  background: #ccc;
  border-bottom: 2px outset #dedede;
}

.toolbar input {
  flex: 1 1 auto;
  align-self: stretch;
  display: block;
  border-radius: 16px;
  padding: 0px 0.8em;
}

.toolbar button {
  display: block;
  align-self: stretch;
  border-radius: 16px;
}

.toolbar .icon {
  height: 16px;
  width: 16px;
  vertical-align: middle;
}

.steps {
  position: fixed;
  box-sizing: border-box;
  top: 0;
  left: 0;
  width: 236px;
  bottom: 0;
  overflow: hidden;
  display: flex;
  padding: 48px 0 0;
  flex-flow: column;
  background: #ccc;
  border-right: 2px outset #dedede;
}
.steps > * {
  margin: 0;
  padding: 0;
}
.steps-bar {
  padding: 0 0.2em;
}
.steps-bar button > * {
  vertical-align: middle;
}
.step-list {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column;
  overflow-y: auto;
  overflow-x: hidden;
  gap: 0.2em;
  padding: 0.2em;
  border: 2px inset #999;
  background: white;
}
.step-list > * {
  padding: 0.2em;
}
.step {
  border: 1px solid black;
  border-radius: 4px;
}
</style>
