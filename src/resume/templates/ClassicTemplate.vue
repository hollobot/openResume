<template>
  <article class="classic">
    <!-- ── 头部：姓名 + 职位 + 联系方式 ── -->
    <header class="head">
      <h1 class="name">{{ resume.basics.name }}</h1>
      <p v-if="resume.basics.headline" class="headline">{{ resume.basics.headline }}</p>
      <p class="contacts">
        <span v-for="(c, i) in contacts" :key="i" class="contact">{{ c }}</span>
      </p>
    </header>

    <!-- ── 个人简介 ── -->
    <section v-if="showSummary" class="block">
      <h2 class="section-title">{{ resume.summary.title }}</h2>
      <div class="rich" v-html="summaryHtml" />
    </section>

    <!-- ── 各区块 ── -->
    <template v-for="def in SECTION_DEFS" :key="def.key">
      <section v-if="visibleItems(def.key).length" class="block">
        <h2 class="section-title">{{ resume.sections[def.key].title }}</h2>

        <div v-for="item in visibleItems(def.key)" :key="item.id" class="entry">
          <div v-if="entry(def.key, item).title || entry(def.key, item).period" class="entry-head">
            <span class="entry-title">{{ entry(def.key, item).title }}</span>
            <span v-if="entry(def.key, item).period" class="entry-period">
              {{ entry(def.key, item).period }}
            </span>
          </div>

          <div v-if="entry(def.key, item).subtitle" class="entry-sub">
            {{ entry(def.key, item).subtitle }}
            <a
              v-if="entry(def.key, item).link"
              class="entry-link"
              :href="entry(def.key, item).link"
              target="_blank"
              rel="noopener"
            >{{ entry(def.key, item).linkLabel }}</a>
          </div>

          <p v-if="entry(def.key, item).keywords?.length" class="tags">
            <span v-for="(k, i) in entry(def.key, item).keywords" :key="i" class="tag">{{ k }}</span>
          </p>

          <div
            v-if="entry(def.key, item).description"
            class="rich"
            v-html="textToHtml(entry(def.key, item).description)"
          />
        </div>
      </section>
    </template>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { SECTION_DEFS } from '../schema.js'
import { textToHtml } from '../richText.js'

const props = defineProps({
  resume: { type: Object, required: true },
})

const resume = props.resume

// 头部联系方式行（过滤空值）
const contacts = computed(() => {
  const b = resume.basics
  const list = [b.phone, b.email, b.location]
  if (b.website?.url) list.push(b.website.label || b.website.url)
  return list.filter(Boolean)
})

const showSummary = computed(() => !resume.summary.hidden && resume.summary.content)
const summaryHtml = computed(() => textToHtml(resume.summary.content))

// 区块内未隐藏的条目
function visibleItems(key) {
  const sec = resume.sections[key]
  if (!sec || sec.hidden) return []
  return sec.items.filter((it) => !it.hidden)
}

/**
 * 把不同区块的条目归一成统一展示结构：
 *   { title, subtitle, period, link, linkLabel, keywords, description }
 * 模板按这个结构渲染，无需对每个区块写专门布局。
 */
function entry(key, item) {
  const w = item.website || {}
  const link = w.url || ''
  const linkLabel = w.label || w.url || ''
  switch (key) {
    case 'profiles':
      return { title: item.network, subtitle: item.username, link, linkLabel }
    case 'education':
      return {
        title: item.school,
        subtitle: [item.degree, item.area, item.location].filter(Boolean).join(' · '),
        period: item.period,
        description: item.description,
      }
    case 'skills':
      return { title: item.name, description: item.description }
    case 'experience':
      return {
        title: item.company,
        subtitle: [item.position, item.location].filter(Boolean).join(' · '),
        period: item.period,
        link,
        linkLabel,
        description: item.description,
      }
    case 'projects':
      return {
        title: item.name,
        subtitle: item.role,
        period: item.period,
        link,
        linkLabel,
        keywords: item.keywords,
        description: item.description,
      }
    case 'awards':
      return { title: item.title, subtitle: item.awarder, period: item.date, description: item.description }
    default:
      return { title: '', description: '' }
  }
}
</script>

<style scoped>
.classic {
  /* 区块之间的纵向间距来自页面变量 */
  display: flex;
  flex-direction: column;
}

.head {
  margin-bottom: var(--section-gap);
}

.name {
  font-size: calc(var(--heading-size) * 1.7);
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 2px;
  margin: 0 0 4px;
}

.headline {
  font-size: var(--font-size);
  color: var(--text);
  margin: 0 0 6px;
  opacity: 0.85;
}

.contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  margin: 0;
  font-size: calc(var(--font-size) * 0.88);
  opacity: 0.8;
}

.contact:not(:last-child)::after {
  content: '|';
  margin-left: 14px;
  opacity: 0.4;
}

.block {
  margin-bottom: var(--section-gap);
}

.section-title {
  font-size: var(--heading-size);
  font-weight: 700;
  color: var(--primary);
  margin: 0 0 8px;
  padding-bottom: 4px;
  border-bottom: 2px solid var(--primary);
  letter-spacing: 0.5px;
}

.entry {
  margin-bottom: 10px;
}

.entry:last-child {
  margin-bottom: 0;
}

.entry-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.entry-title {
  font-weight: 600;
  font-size: calc(var(--font-size) * 1.02);
}

.entry-period {
  flex-shrink: 0;
  font-size: calc(var(--font-size) * 0.85);
  opacity: 0.7;
  white-space: nowrap;
}

.entry-sub {
  font-size: calc(var(--font-size) * 0.9);
  opacity: 0.8;
  margin-top: 2px;
}

.entry-link {
  color: var(--primary);
  text-decoration: none;
  margin-left: 6px;
}

.entry-link:hover {
  text-decoration: underline;
}

/* 技术栈标签 */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 4px 0;
}

.tag {
  font-size: calc(var(--font-size) * 0.8);
  padding: 1px 8px;
  border-radius: 4px;
  background: color-mix(in srgb, var(--primary) 10%, transparent);
  color: var(--primary);
}

/* 富文本描述 */
.rich {
  font-size: calc(var(--font-size) * 0.92);
  margin-top: 3px;
}

.rich :deep(p) {
  margin: 2px 0;
}

.rich :deep(ul) {
  list-style: none;
  margin: 3px 0;
  padding-left: 0;
}

.rich :deep(li) {
  position: relative;
  padding-left: 13px;
  margin-bottom: 2px;
}

.rich :deep(li)::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 0.6em;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--primary);
}
</style>
