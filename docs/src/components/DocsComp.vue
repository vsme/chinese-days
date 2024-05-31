<script lang="ts" setup>
import { ref } from 'vue'
import markdownit from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-light.css'

const md: markdownit = markdownit({
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre><code class="hljs">' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        )
      } catch (__) {
        // do nothing
      }
    }

    return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>'
  }
})

const html = ref('')
fetch('//cdn.jsdelivr.net/npm/chinese-days/README.md')
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText)
    }
    return response.text()
  })
  .then((data) => {
    html.value = md.render(data) as string
    console.log(data)
  })
  .catch((error) => {
    console.error('There has been a problem with your fetch operation:', error)
  })
</script>

<template>
  <div class="markdown-body" v-html="html"></div>
</template>

<style>
.markdown-body {
  max-width: 700px;
  padding: 0 20px;
  margin: 0 auto;
  text-align: left;
  line-height: 1.7;
  .hljs {
    border-radius: 10px;
    border: 1px solid #ddd;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p {
    margin: 20px 0;
  }
  p {
    & > img {
      display: inline;
    }
    & > a {
      display: inline;
      & > img {
        display: inline;
      }
    }
  }
  a {
    text-decoration: underline;
    display: inline;
  }
  ol, ul {
    padding-left: 20px;
  }
  li {
    list-style: circle;
    margin-bottom: 10px;
  }
}
</style>
