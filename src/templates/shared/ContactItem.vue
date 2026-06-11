<template>
  <component
    :is="href ? 'a' : 'span'"
    class="rr-contact-item"
    v-bind="href ? { href, target: '_blank', rel: 'noopener' } : {}"
  >
    <i v-if="icon" :class="`ph ph-${icon}`" class="rr-icon" />
    <span>{{ text }}</span>
  </component>
</template>

<script setup>
/**
 * 头部联系方式项（对应 RR shared/contact-item.tsx）
 * icon 受 page.hideIcons 控制（由 artboard.css 的 .rr-hide-icons 统一隐藏）
 */
defineProps({
  icon: { type: String, default: '' },
  text: { type: String, default: '' },
  href: { type: String, default: '' },
})
</script>
