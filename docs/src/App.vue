<script lang="ts" setup>
import { ref } from 'vue'
import Calendar from './components/CalendarComp.vue'
import Docs from './components/DocsComp.vue'

const lang = ref<'zh' | 'en'>('zh')
</script>

<template>
  <!-- <button @click="lang = lang === 'zh' ? 'en' : 'zh'">{{ lang === 'zh' ? 'en' : 'zh' }}</button> -->
  <div class="demo-title">
    <span>Chinese Days - Demo</span>
    <a href="https://github.com/vsme/chinese-days" target="_blank" rel="noopener noreferrer">
      <img src="//img.shields.io/github/stars/vsme/chinese-days" alt="GitHub Repo stars">
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
