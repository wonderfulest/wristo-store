<template>
  <div :class="['tree-node', `level-${level}`, { 'has-post': hasPost, 'no-post': !hasPost, active: isActive }]" :style="{ paddingLeft }">
    <button v-if="hasChildren" class="toggle" @click.stop="toggle">
      <svg v-if="!expanded" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 6L15 12L9 18" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <span v-else class="toggle-placeholder"></span>

    <button class="node-btn" :class="{ active: isActive, 'with-post': hasPost }" @click="onClick">{{ titleText }}</button>
  </div>
  <div v-if="hasChildren && expanded">
    <TreeNode
      v-for="c in node.children"
      :key="c.id"
      :node="c"
      :level="level + 1"
      :active-id="activeId"
      @select="$emit('select', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BlogPostTocItemVO } from '@/types'

interface Props {
  node: BlogPostTocItemVO
  level: number
  activeId?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'select', node: BlogPostTocItemVO): void }>()

const expanded = ref(true)
const isActive = computed(() => props.activeId === props.node.id)
const hasChildren = computed(() => !!props.node.children && props.node.children.length > 0)
const hasPost = computed(() => !!props.node.post)
const titleText = computed(() => props.node.title || props.node.post?.title || 'Untitled')
const paddingLeft = computed(() => 4 + (props.level as number) * 16 + 'px')

function onClick() {
  emit('select', props.node)
}
function toggle() {
  expanded.value = !expanded.value
}
</script>

<style scoped>
.tree-node { display: flex; align-items: center; gap: 4px; margin: 1px 0; position: relative; }
.toggle { appearance: none; background: transparent; border: none; color: #64748b; cursor: pointer; font-size: 10px; padding: 2px 4px; border-radius: 4px; transition: all .2s ease; min-width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; }
.toggle:hover { background: #f1f5f9; color: #475569; }
.toggle-placeholder { min-width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; }
.node-btn { appearance: none; border: none; background: transparent; color: #475569; padding: 4px 8px; border-radius: 8px; font-weight: 500; font-size: 14px; transition: all .2s ease; text-align: left; flex: 1; cursor: pointer; line-height: 1.4; }
.node-btn:hover { background: #f8fafc; color: #1e293b; }
.node-btn.active { color: #2563eb; background: linear-gradient(135deg, #dbeafe, #bfdbfe); font-weight: 600; box-shadow: 0 1px 3px rgba(37, 99, 235, 0.2); }
</style>
