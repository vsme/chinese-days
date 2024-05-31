<script lang="ts" setup>
import { ref } from 'vue';
import Calendar from './components/CalendarComp.vue';
import Docs from './components/DocsComp.vue';

let lang = ref<'zh' | 'en'>('zh');
</script>

<template>
  <!-- <button @click="lang = lang === 'zh' ? 'en' : 'zh'">{{ lang === 'zh' ? 'en' : 'zh' }}</button> -->
  <div class="demo-title">
    <span>Chinese Days</span>
    <a href="https://github.com/vsme/chinese-days" target="_blank" rel="noopener noreferrer">
      GitHub
      <svg width="13.5" height="13.5" aria-hidden="true" viewBox="0 0 24 24">
        <path fill="currentColor" d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"></path>
      </svg>
    </a>
  </div>
  <Calendar :lang />
  <Docs />
</template>

<style>
#app {
  text-align: center;
  color: #2c3e50;
  padding: 20px 0;
  @media screen and (max-width: 560px) {
    padding: 10px 0;
  }
  .demo-title {
    max-width: 680px;
    padding: 10px 20px 30px;
    margin: 0 auto;
    text-align: left;
    font-size: 1.25em;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: space-between;
    a {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 14px;
    }
  }
}
</style>
