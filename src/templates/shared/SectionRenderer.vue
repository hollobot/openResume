<template>
  <section v-if="resolved && show" class="rr-section" :data-section="sectionId">
    <!-- 区块标题（可带图标） -->
    <h2 v-if="showHeading" class="rr-section-heading">
      <i v-if="headingIcon" :class="`ph ph-${headingIcon}`" class="rr-section-heading-icon" />
      <span>{{ title }}</span>
    </h2>

    <!-- summary：单条富文本 -->
    <div v-if="type === 'summary' && sectionId === 'summary'" class="rr-items">
      <div class="rr-item"><RichTextView :html="section.content" /></div>
    </div>

    <!-- 其余类型：条目网格（columns 1-6） -->
    <div
      v-else
      class="rr-items"
      :style="columns > 1 ? { display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)` } : {}"
    >
      <div v-for="item in items" :key="item.id" class="rr-item">
        <!-- ── summary（自定义区块） ── -->
        <template v-if="type === 'summary'">
          <RichTextView :html="item.content" />
        </template>

        <!-- ── profiles ── -->
        <template v-else-if="type === 'profiles'">
          <div class="rr-inline">
            <i v-if="item.icon" :class="`ph ph-${item.icon}`" class="rr-icon" :style="iconColorStyle(item)" />
            <span class="rr-bold">{{ item.network }}</span>
          </div>
          <a v-if="item.website?.url" class="rr-link" :href="item.website.url" target="_blank" rel="noopener">
            {{ item.username || websiteText(item.website) }}
          </a>
          <span v-else>{{ item.username }}</span>
        </template>

        <!-- ── experience ── -->
        <template v-else-if="type === 'experience'">
          <div class="rr-split-row">
            <ItemTitle :website="item.website">{{ item.company }}</ItemTitle>
            <span v-if="item.location" class="rr-align-end">{{ item.location }}</span>
          </div>
          <div v-if="item.position || item.period" class="rr-split-row">
            <span>{{ item.position }}</span>
            <span v-if="item.period" class="rr-align-end">{{ item.period }}</span>
          </div>
          <!-- 多角色：逐角色渲染；无角色用整体描述 -->
          <template v-if="item.roles?.length">
            <div v-for="role in item.roles" :key="role.id">
              <div class="rr-split-row">
                <span>{{ role.position }}</span>
                <span class="rr-align-end">{{ role.period }}</span>
              </div>
              <RichTextView :html="role.description" />
            </div>
          </template>
          <RichTextView v-else :html="item.description" />
          <ItemWebsiteLink :website="item.website" />
        </template>

        <!-- ── education ── -->
        <template v-else-if="type === 'education'">
          <div class="rr-split-row">
            <ItemTitle :website="item.website">{{ item.school }}</ItemTitle>
            <span v-if="joined(item.degree, item.grade)" class="rr-align-end">{{ joined(item.degree, item.grade) }}</span>
          </div>
          <div v-if="item.area || joined(item.location, item.period)" class="rr-split-row">
            <span>{{ item.area }}</span>
            <span v-if="joined(item.location, item.period)" class="rr-align-end">{{ joined(item.location, item.period) }}</span>
          </div>
          <RichTextView :html="item.description" />
          <ItemWebsiteLink :website="item.website" />
        </template>

        <!-- ── projects ── -->
        <template v-else-if="type === 'projects'">
          <div class="rr-split-row">
            <ItemTitle :website="item.website">{{ item.name }}</ItemTitle>
            <span v-if="item.period" class="rr-align-end">{{ item.period }}</span>
          </div>
          <RichTextView :html="item.description" />
          <ItemWebsiteLink :website="item.website" />
        </template>

        <!-- ── skills ── -->
        <template v-else-if="type === 'skills'">
          <div class="rr-inline">
            <i v-if="item.icon" :class="`ph ph-${item.icon}`" class="rr-icon" :style="iconColorStyle(item)" />
            <span class="rr-bold">{{ item.name }}</span>
          </div>
          <div v-if="item.proficiency || item.keywords?.length">
            <div v-if="item.proficiency">{{ item.proficiency }}</div>
            <div v-if="item.keywords?.length" class="rr-small">{{ item.keywords.join('、') }}</div>
          </div>
          <LevelDisplay :level="item.level" />
        </template>

        <!-- ── languages ── -->
        <template v-else-if="type === 'languages'">
          <div>
            <div class="rr-bold">{{ item.language }}</div>
            <div v-if="item.fluency">{{ item.fluency }}</div>
          </div>
          <LevelDisplay :level="item.level" />
        </template>

        <!-- ── interests ── -->
        <template v-else-if="type === 'interests'">
          <div class="rr-inline">
            <i v-if="item.icon" :class="`ph ph-${item.icon}`" class="rr-icon" :style="iconColorStyle(item)" />
            <span class="rr-bold">{{ item.name }}</span>
          </div>
          <div v-if="item.keywords?.length" class="rr-small">{{ item.keywords.join('、') }}</div>
        </template>

        <!-- ── awards ── -->
        <template v-else-if="type === 'awards'">
          <div class="rr-split-row">
            <ItemTitle :website="item.website">{{ item.title }}</ItemTitle>
            <span v-if="item.date" class="rr-align-end">{{ item.date }}</span>
          </div>
          <div v-if="item.awarder">{{ item.awarder }}</div>
          <RichTextView :html="item.description" />
          <ItemWebsiteLink :website="item.website" />
        </template>

        <!-- ── certifications ── -->
        <template v-else-if="type === 'certifications'">
          <div class="rr-split-row">
            <ItemTitle :website="item.website">{{ item.title }}</ItemTitle>
            <span v-if="item.date" class="rr-align-end">{{ item.date }}</span>
          </div>
          <div v-if="item.issuer">{{ item.issuer }}</div>
          <RichTextView :html="item.description" />
          <ItemWebsiteLink :website="item.website" />
        </template>

        <!-- ── publications ── -->
        <template v-else-if="type === 'publications'">
          <div class="rr-split-row">
            <ItemTitle :website="item.website">{{ item.title }}</ItemTitle>
            <span v-if="item.date" class="rr-align-end">{{ item.date }}</span>
          </div>
          <div v-if="item.publisher">{{ item.publisher }}</div>
          <RichTextView :html="item.description" />
          <ItemWebsiteLink :website="item.website" />
        </template>

        <!-- ── volunteer ── -->
        <template v-else-if="type === 'volunteer'">
          <div class="rr-split-row">
            <ItemTitle :website="item.website">{{ item.organization }}</ItemTitle>
            <span v-if="item.period" class="rr-align-end">{{ item.period }}</span>
          </div>
          <div v-if="item.location">{{ item.location }}</div>
          <RichTextView :html="item.description" />
          <ItemWebsiteLink :website="item.website" />
        </template>

        <!-- ── references ── -->
        <template v-else-if="type === 'references'">
          <ItemTitle :website="item.website">{{ item.name }}</ItemTitle>
          <div v-if="item.position">{{ item.position }}</div>
          <div v-if="item.phone">{{ item.phone }}</div>
          <RichTextView :html="item.description" />
          <ItemWebsiteLink :website="item.website" />
        </template>

        <!-- ── cover-letter ── -->
        <template v-else-if="type === 'cover-letter'">
          <RichTextView :html="item.recipient" />
          <RichTextView :html="item.content" />
        </template>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * 统一区块渲染器（移植 RR shared/sections.tsx，976 行 → 单 SFC）
 *
 * props.sectionId：标准区块 key（experience...）、'summary' 或自定义区块 UUID。
 * 每种类型的条目字段组合与 split-row 头部布局 1:1 对照 RR 实现。
 * 模板通过外层 CSS（rr-* 语义类）控制风格差异。
 */
import { computed, h } from 'vue'
import { useResumeData, providePlacement } from './context.js'
import { resolveSection, sectionTitle, sectionIcon, visibleItems, isSectionVisible } from './filtering.js'
import RichTextView from './RichTextView.vue'
import LevelDisplay from './LevelDisplay.vue'

const props = defineProps({
  sectionId: { type: String, required: true },
  placement: { type: String, default: 'main' }, // main | sidebar
  showHeading: { type: Boolean, default: true },
})

providePlacement(props.placement)

const data = useResumeData()

const resolved = computed(() => resolveSection(props.sectionId, data.value))
const show = computed(() => isSectionVisible(props.sectionId, data.value))
const section = computed(() => resolved.value?.section)
const type = computed(() => resolved.value?.type)
const title = computed(() => sectionTitle(props.sectionId, data.value))
const columns = computed(() => section.value?.columns || 1)
const items = computed(() => visibleItems(section.value))

// 标题图标受 hideSectionIcons 控制
const headingIcon = computed(() =>
  data.value.metadata.page.hideSectionIcons ? '' : sectionIcon(props.sectionId, data.value),
)

// ── 工具函数 ─────────────────────────────────────────────────

/** 用「 • 」拼接非空片段（对齐 RR 的 join(" • ")） */
function joined(...parts) {
  return parts.filter(Boolean).join(' • ')
}

/** 链接显示文本：label 优先 */
function websiteText(website) {
  return website?.label || website?.url || ''
}

/** 条目级图标自定义颜色 */
function iconColorStyle(item) {
  return item.iconColor ? { color: item.iconColor } : {}
}

// ── 内部小组件（render 函数，避免再拆文件） ──────────────────

/**
 * 条目标题：inlineLink=true 时整个标题变为超链接（对齐 RR ItemTitle）
 */
const ItemTitle = (p, { slots }) => {
  const w = p.website || {}
  const titleEl = h('span', { class: 'rr-bold rr-item-title' }, slots.default?.())
  if (w.inlineLink && w.url) {
    return h('a', { class: 'rr-link', href: w.url, target: '_blank', rel: 'noopener' }, [titleEl])
  }
  return titleEl
}
ItemTitle.props = { website: { type: Object, default: () => ({}) } }

/**
 * 条目底部独立链接行：inlineLink=false 且有 url 时显示（对齐 RR ItemWebsiteLink）
 */
const ItemWebsiteLink = (p) => {
  const w = p.website || {}
  if (!w.url || w.inlineLink) return null
  return h(
    'a',
    { class: 'rr-link rr-item-website', href: w.url, target: '_blank', rel: 'noopener' },
    websiteText(w),
  )
}
ItemWebsiteLink.props = { website: { type: Object, default: () => ({}) } }
</script>
