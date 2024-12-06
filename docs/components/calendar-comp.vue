<script lang="ts" setup>
import { computed, ref } from 'vue'
import chineseDays from "chinese-days"

const { getDayDetail, getLunarDate, getSolarTermsInRange, isInLieu } = chineseDays

const props = withDefaults(
  defineProps<{
    lang: 'zh' | 'en'
    startOfWeek?: 1 | 2 | 3 | 4 | 5 | 6 | 0
  }>(),
  {
    lang: 'zh',
    startOfWeek: 1,
  },
)

const currentDate = ref(new Date())
const currentMonth = ref(currentDate.value.getMonth())
const currentYear = ref(currentDate.value.getFullYear())
const daysOfWeek = computed(() =>
  props.lang === 'zh'
    ? ['日', '一', '二', '三', '四', '五', '六']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
)
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const daysInMonth = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days: Date[] = []

  let firstDayIndex = firstDay.getDay() - props.startOfWeek
  if (firstDayIndex < 0) {
    firstDayIndex += 7
  }

  for (let i = firstDayIndex; i > 0; i--) {
    days.push(new Date(year, month, -i + 1))
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day))
  }

  let lastDayIndex = lastDay.getDay() - props.startOfWeek
  if (lastDayIndex < 0) {
    lastDayIndex += 7
  }
  for (let i = 1; i < 7 - lastDayIndex; i++) {
    days.push(new Date(year, month + 1, i))
  }

  return days
})

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  }
  else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  }
  else {
    currentMonth.value++
  }
}

function isToday(date: Date) {
  const today = new Date()
  return (
    date.getDate() === today.getDate()
    && date.getMonth() === today.getMonth()
    && date.getFullYear() === today.getFullYear()
  )
}

function getDayInfo(date: Date) {
  const dayDetail = getDayDetail(date)
  const holidayName = dayDetail.name.split(',')[1]
  return {
    disable: currentMonth.value !== date.getMonth(),
    isToday: isToday(date),
    isInLieu: isInLieu(date),
    solarTerm: getSolarTermsInRange(date)[0],
    ...getLunarDate(date),
    ...dayDetail,
    holidayName,
    date,
  }
}

const selectedDate = ref(getDayInfo(new Date()))
function selectDate(date: any) {
  selectedDate.value = date
}

function isSelected(date: Date) {
  return (
    date.getDate() === selectedDate.value?.date.getDate()
    && date.getMonth() === selectedDate.value?.date.getMonth()
    && date.getFullYear() === selectedDate.value?.date.getFullYear()
  )
}

const daysInfo = computed(() => daysInMonth.value.map((date: Date) => getDayInfo(date)))
</script>

<template>
  <div class="calendar">
    <header class="calendar-header">
      <button @click="prevMonth">
        <svg
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="200"
          height="200"
        >
          <path
            d="M684.29 799.276L393.929 513.019 684.29 226.762c37.685-37.153 38.003-97.625 0.707-134.384-37.297-36.758-98.646-36.435-136.331 0.718l-357.43 352.378c-0.155 0.153-0.297 0.314-0.451 0.468-0.084 0.082-0.172 0.157-0.256 0.239-18.357 18.092-27.581 41.929-27.743 65.902-0.004 0.311-0.017 0.623-0.018 0.934 0.001 0.316 0.014 0.632 0.018 0.948 0.165 23.97 9.389 47.803 27.743 65.892 0.083 0.082 0.171 0.157 0.255 0.239 0.154 0.154 0.296 0.315 0.452 0.468l357.43 352.378c37.685 37.153 99.034 37.476 136.331 0.718 37.297-36.758 36.979-97.231-0.707-134.384z"
            fill="currentColor"
          />
        </svg>
      </button>
      <h2 v-if="lang === 'zh'">
        <select v-model="currentYear" style="width: 130px;">
          <option v-for="(y, index) in 201" :key="index" :value="1900 + index">
            {{ 1900 + index }}
          </option>
        </select>
        年
        <select v-model="currentMonth">
          <option v-for="(month, index) in 12" :key="index" :value="index">
            {{ month < 10 ? `0${month}` : month }}
          </option>
        </select>
        月
      </h2>
      <h2 v-else>        
        <select v-model="currentMonth" style="width: 160px;">
          <option v-for="(month, index) in 12" :key="index" :value="index">
            {{ monthNames[month - 1] }}
          </option>
        </select>
        
        <select v-model="currentYear">
          <option v-for="(y, index) in 201" :key="index" :value="1900 + index">
            {{ 1900 + index }}
          </option>
        </select>
      </h2>
      <button @click="nextMonth">
        <svg
          class="r"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          width="200"
          height="200"
        >
          <path
            d="M684.29 799.276L393.929 513.019 684.29 226.762c37.685-37.153 38.003-97.625 0.707-134.384-37.297-36.758-98.646-36.435-136.331 0.718l-357.43 352.378c-0.155 0.153-0.297 0.314-0.451 0.468-0.084 0.082-0.172 0.157-0.256 0.239-18.357 18.092-27.581 41.929-27.743 65.902-0.004 0.311-0.017 0.623-0.018 0.934 0.001 0.316 0.014 0.632 0.018 0.948 0.165 23.97 9.389 47.803 27.743 65.892 0.083 0.082 0.171 0.157 0.255 0.239 0.154 0.154 0.296 0.315 0.452 0.468l357.43 352.378c37.685 37.153 99.034 37.476 136.331 0.718 37.297-36.758 36.979-97.231-0.707-134.384z"
            fill="currentColor"
          />
        </svg>
      </button>
    </header>
    <div class="calendar-grid">
      <div v-for="(day, i) in 7" :key="day" class="calendar-day">
        {{ daysOfWeek[daysInfo[i].date.getDay()] }}
      </div>
      <div
        v-for="(day, index) in daysInfo"
        :key="index"
        class="calendar-cell"
        :class="{
          today: day.isToday,
          disable: day.disable,
          holiday: day.holidayName,
          inlieu: day.isInLieu,
          work: day.holidayName && day.work,
          solar: day.solarTerm?.index === 1,
          selected: isSelected(day.date),
        }"
        @click="selectDate(day)"
      >
        <span v-if="day.isToday" class="today-dot">{{ lang === 'en' ? 'Today' : '今' }}</span>
        <span v-if="day.holidayName" class="holiday-dot">{{
          day.work ? '班' : day.isInLieu ? '调' : '休'
        }}</span>
        <span class="day">{{ day.date.getDate() }}</span>
        <span class="desc">{{
          day.solarTerm?.index === 1 ? day.solarTerm?.name : day.holidayName || day.lunarDayCN
        }}</span>
      </div>
    </div>
  </div>

  <div class="calendar-day-info">
    <div class="left">
      <p>
        {{ selectedDate.lunarYearCN }}
        {{ selectedDate.lunarMonCN }}{{ selectedDate.lunarDayCN }}
      </p>
      <p>
        {{ selectedDate.yearCyl }}{{ selectedDate.zodiac }}年 {{ selectedDate.monCyl }}月
        {{ selectedDate.dayCyl }}日
      </p>
    </div>
    <div class="right">
      <p>
        {{ selectedDate.isToday ? '今天是' : '此日是' }}
        <span>{{ selectedDate.solarTerm?.name }}</span> 节气的第
        <span>{{ selectedDate.solarTerm?.index }}</span> 天。
      </p>
      <p>
        {{
          selectedDate.work
            ? '又是需要工作的一天！😥'
            : selectedDate.isInLieu
              ? '虽然调休，但要补班还回来的！🤬'
              : '休息啦~😃'
        }}
      </p>
    </div>
  </div>
</template>

<style lang="postcss">
body {
  --calendar-max-width: 660px;
  --calendar-padding: 30px;
  --calendar-border-width: 1px;
  --calendar-grid-gap: 18px 12px;
  --calendar-border-radius: 10px;
}

@media screen and (max-width: 560px) {
  body {
    --calendar-padding: 10px;
    --calendar-border-width: 0;
    --calendar-grid-gap: 12px 6px;
    --calendar-border-radius: 0;
  }
}
</style>

<style lang="postcss" scoped>
.calendar {
  max-width: var(--calendar-max-width);
  margin: 0 auto;
  padding: var(--calendar-padding);
  border: var(--calendar-border-width) solid var(--vp-c-gray-2);
  border-radius: var(--calendar-border-radius);
  position: relative;
  background: var(--vp-c-bg);
  z-index: 1;

  h2, p {
    margin: 0;
    padding: 0;
    border: 0;
  }

  select {
    font-size: 24px;
    width: 100px;
    margin: 0 15px;
    font-weight: bold;
    text-align: center;
    border: 1px solid var(--vp-c-default-3);
    border-radius: 6px;
  }

  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: calc(20px + var(--calendar-padding));

    button {
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: 40px;
      height: 40px;
      opacity: 0.5;
      transition: all 0.2s ease;
      &:hover {
        opacity: 0.8;
      }
      svg {
        width: 22px;
        height: 22px;
        &.r {
          transform: rotate(180deg);
        }
      }
    }
    h2 {
      font-size: 24px;
      font-weight: bold;
    }
  }

  @media screen and (max-width: 560px) {
    .calendar-header {
      button {
        width: 30px;
        height: 30px;
        svg {
          width: 18px;
          height: 18px;
        }
      }
      h2 {
        font-size: 18px;
      }
    }
  }

  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--calendar-grid-gap);

    .calendar-day {
      font-weight: bold;
      text-align: center;
      line-height: 3;
    }

    .calendar-cell {
      min-height: 70px;
      display: flex;
      flex-flow: column nowrap;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: var(--calendar-border-radius);
      position: relative;
      transition: all 0.2s ease;
      color: var(--vp-c-text-1);

      &:nth-child(7n + 6),
      &:nth-child(7n + 7) {
        .day {
          color: #eb3333;
        }
      }

      .day {
        font-size: 24px;
        font-weight: bold;
      }
      .desc {
        font-size: 12px;
      }

      .today-dot,
      .holiday-dot {
        position: absolute;
        right: -6px;
        top: -6px;
        font-size: 12px;
        padding: 0 4px;
        border-radius: 4px;
        min-width: 20px;
        line-height: 20px;
        transform: scale(0.9);
      }

      &.work {
        background: transparent;
      }

      &.holiday {
        &:not(&.work) {
          background: rgba(235, 51, 51, 0.05);
          color: #eb3333;
        }
        /** background: #f28c28; */
        .holiday-dot {
          background: #eb3333;
          color: #fff;
        }
        &.work {
          .day {
            color: #4e5877;
          }
          .holiday-dot {
            background: #4e5877;
            color: #fff;
          }
        }
      }

      &:hover {
        background: rgba(118, 142, 240, 0.2);
        color: var(--vp-c-text-1);
      }

      &.solar {
        .desc {
          color: #f28c28;
          border: 1px solid #f28c28;
          border-radius: 4px;
          padding: 0 4px;
        }
      }

      &.today {
        color: #4e6ef2;
        .today-dot {
          background: #6b88ff;
          color: #fff;
        }

        &.selected {
          background: #4e6ef2;
          color: #fff;
        }
      }

      &.selected {
        background: #4e6ef2 !important;
        color: #fff !important;
        .day {
          color: #fff !important;
        }
        &.solar {
          .desc {
            color: #fff;
            border: 1px solid #fff;
          }
        }
      }

      &.disable {
        opacity: 0.2;
        pointer-events: none;
      }
    }
  }
}

.calendar-day-info {
  max-width: var(--calendar-max-width);
  margin: 0 auto;
  padding: 50px 20px 30px;
  background: var(--vp-c-gray-3);
  border: var(--calendar-border-width) solid var(--vp-c-gray-3);
  border-radius: var(--calendar-border-radius);
  position: relative;
  top: -20px;
  z-index: 0;
  font-size: 16px;
  display: flex;
  align-items: center;

  .left {
    display: flex;
    flex-flow: column nowrap;
    align-items: flex-start;
    margin-right: var(--calendar-padding);
    p {
      font-weight: bold;
      font-size: 14px;
      margin: 0;
      &:first-child {
        font-size: 22px;
      }
    }
  }

  .right {
    display: flex;
    flex-flow: column nowrap;
    align-items: flex-start;
    padding-left: var(--calendar-padding);
    border-left: 1px solid var(--vp-c-gray-2);
    p {
      font-size: 14px;
      margin: 0;
      span {
        font-weight: bold;
      }
      &:first-child {
        font-size: 18px;
      }
    }
  }

  @media screen and (max-width: 560px) {
    .left,
    .right {
      p {
        font-size: 12px;
        &:first-child {
          font-size: 14px;
        }
      }
    }
  }
}
</style>