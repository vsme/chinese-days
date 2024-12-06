import{_ as i,c as a,a2 as n,o as l}from"./chunks/framework.Ct9Y1XYN.js";const E=JSON.parse('{"title":"节假日","description":"","frontmatter":{},"headers":[],"relativePath":"guide/holidays.md","filePath":"zh/guide/holidays.md"}'),h={name:"guide/holidays.md"};function t(e,s,k,p,d,r){return l(),a("div",null,s[0]||(s[0]=[n(`<h1 id="节假日" tabindex="-1">节假日 <a class="header-anchor" href="#节假日" aria-label="Permalink to &quot;节假日&quot;">​</a></h1><h2 id="isholiday-检查某个日期是否为节假日" tabindex="-1"><code>isHoliday</code> 检查某个日期是否为节假日 <a class="header-anchor" href="#isholiday-检查某个日期是否为节假日" aria-label="Permalink to &quot;\`isHoliday\` 检查某个日期是否为节假日&quot;">​</a></h2><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isHoliday</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;2023-01-01&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// true</span></span></code></pre></div><h2 id="getholidaysinrange-获取指定日期范围内的所有节假日" tabindex="-1"><code>getHolidaysInRange</code> 获取指定日期范围内的所有节假日 <a class="header-anchor" href="#getholidaysinrange-获取指定日期范围内的所有节假日" aria-label="Permalink to &quot;\`getHolidaysInRange\` 获取指定日期范围内的所有节假日&quot;">​</a></h2><p>接收起始日期和结束日期，并可选地决定是否包括周末。如果包括周末，则函数会返回包括周末在内的所有节假日；否则，只返回工作日的节假日。</p><div class="info custom-block"><p class="custom-block-title">提示</p><p>即使不包括周末，周末的节假日仍然会被返回</p></div><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 示例用法</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> start</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;2024-04-26&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> end</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;2024-05-06&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 获取从 2024-05-01 到 2024-05-10 的所有节假日，包括周末</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> holidaysIncludingWeekends</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getHolidaysInRange</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(start, end, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Holidays including weekends:&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, holidaysIncludingWeekends.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">map</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">d</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getDayDetail</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(d)));</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 获取从 2024-05-01 到 2024-05-10 的节假日，不包括周末</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> holidaysExcludingWeekends</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getHolidaysInRange</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(start, end, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Holidays excluding weekends:&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, holidaysExcludingWeekends.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">map</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">d</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getDayDetail</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(d)));</span></span></code></pre></div>`,7)]))}const o=i(h,[["render",t]]);export{E as __pageData,o as default};