import{_ as a,c as i,a2 as n,o as t}from"./chunks/framework.Ct9Y1XYN.js";const E=JSON.parse('{"title":"农历转换阳历","description":"","frontmatter":{},"headers":[],"relativePath":"guide/from-lunar.md","filePath":"zh/guide/from-lunar.md"}'),e={name:"guide/from-lunar.md"};function l(p,s,h,r,k,d){return t(),i("div",null,s[0]||(s[0]=[n(`<h1 id="农历转换阳历" tabindex="-1">农历转换阳历 <a class="header-anchor" href="#农历转换阳历" aria-label="Permalink to &quot;农历转换阳历&quot;">​</a></h1><p>当为阴历闰月的时候，会出现一个农历日期对应两个阳历日期的情况，所以返回对象形式。</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getSolarDateFromLunar</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;2001-03-05&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">));</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// {date: &#39;2001-03-29&#39;, leapMonthDate: undefined}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getSolarDateFromLunar</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;2001-04-05&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">));</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// {date: &#39;2001-04-27&#39;, leapMonthDate: &#39;2001-05-27&#39;}</span></span></code></pre></div>`,3)]))}const c=a(e,[["render",l]]);export{E as __pageData,c as default};