<template>
  <div class="markdown-editor">
    <MdEditor
      ref="editorRef"
      v-model="editorValue"
      :theme="'light'"
      :preview="false"
      :toolbars="toolbars"
      :footers="[]"
      :show-code-row-number="false"
      :sanitize="sanitizeHtml"
      placeholder="# 标题&#10;> 副标题&#10;&#10;#标签1 #标签2&#10;&#10;## 步骤一&#10;支持 **加粗** *斜体* `代码`&#10;> 💡 小提示&#10;&#10;粘贴图片: Ctrl+V / 拖入&#10;封面图: ![cover](img-001)&#10;内容图: ![](img-002)&#10;&#10;===&#10;&#10;# 第二页标题"
      @on-upload-img="handleUploadImg"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MdEditor, type ToolbarNames } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editorRef = ref<InstanceType<typeof MdEditor>>()

const editorValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

// 自定义工具栏
const toolbars: ToolbarNames[] = [
  'bold',
  'underline',
  'italic',
  'strikeThrough',
  '-',
  'title',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  '-',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  '-',
  'revoke',
  'next',
  'save',
  '=',
  'pageFullscreen',
  'fullscreen',
  'preview'
]

// 禁用 HTML 过滤
const sanitizeHtml = (html: string) => html

/**
 * 将图片文件转换为 Base64 Data URL
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 处理图片上传 - 直接返回 base64 URL
 */
async function handleUploadImg(files: File[], callback: (urls: string[]) => void) {
  const urls: string[] = []
  
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      try {
        // 直接转为 base64 URL
        const base64Url = await fileToBase64(file)
        urls.push(base64Url)
      } catch (error) {
        console.error('图片转换失败:', error)
      }
    }
  }
  
  // 回调传入 base64 URLs，编辑器会自动插入 ![name](base64) 语法
  callback(urls)
}
</script>

<style scoped>
.markdown-editor {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #FFFFFF;
  border-radius: 0 0 16px 16px;
}
.markdown-editor :deep(.md-editor) {
  flex: 1;
  border: none;
  border-radius: 0;
  height: 100%;
  background: #FFFFFF;
}
.markdown-editor :deep(.md-editor-toolbar) {
  border-bottom: 1px solid #f0f0f0;
  background: #FFFFFF;
  border-radius: 0;
}
.markdown-editor :deep(.md-editor-toolbar-item) {
  border-radius: 6px;
  transition: all 0.2s;
}
.markdown-editor :deep(.md-editor-toolbar-item:hover) {
  background: #f8f9fa;
}
.markdown-editor :deep(.md-editor-content) {
  flex: 1;
  height: calc(100% - 42px);
}
/* 编辑区样式 */
.markdown-editor :deep(.md-editor-textarea) {
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
  line-height: 1.8;
  padding: 20px;
  background: #FFFFFF;
}
/* 隐藏预览区 */
.markdown-editor :deep(.md-editor-preview) {
  display: none !important;
}
/* 隐藏分割线 */
.markdown-editor :deep(.md-editor-resize) {
  display: none !important;
}
/* 滚动条美化 - 完全隐藏 */
.markdown-editor :deep(.md-editor-textarea)::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  display: none !important;
}
.markdown-editor :deep(.md-editor-content)::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  display: none !important;
}
.markdown-editor :deep(.md-editor-textarea) {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}
.markdown-editor :deep(.md-editor-content) {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}
</style>
