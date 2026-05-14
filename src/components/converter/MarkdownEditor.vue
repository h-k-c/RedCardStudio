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
      placeholder="# 标题&#10;> 副标题&#10;&#10;#标签1 #标签2&#10;&#10;## 步骤一&#10;支持 **加粗** *斜体* `代码`&#10;> 💡 小提示&#10;&#10;粘贴图片: Ctrl+V / 拖入&#10;封面图: ![cover](img-001)&#10;内容图: ![](img-002)"
      @on-upload-img="handleUploadImg"
    />
    
    <!-- 分页提示 Toast -->
    <Transition name="toast">
      <div v-if="showPageToast" class="page-toast">
        <svg class="page-toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { MdEditor, type ToolbarNames } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'page-break', beforeContent: string, afterContent: string): void
}>()

const editorRef = ref<InstanceType<typeof MdEditor>>()
const showPageToast = ref(false)
const toastMessage = ref('')

// 监听分页标记

const editorValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value)
})

// 工具栏配置
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

/**
 * 禁用 HTML 过滤
 */
const sanitizeHtml = (html: string) => html

/**
 * 将图片文件压缩并转换为 Base64 Data URL
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const maxSize = 2 * 1024 * 1024 // 2MB
    
    if (file.size > maxSize) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // 计算缩放比例
          const maxDimension = 1920
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension
              width = maxDimension
            } else {
              width = (width / height) * maxDimension
              height = maxDimension
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('无法获取 canvas 上下文'))
            return
          }
          
          ctx.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const blobReader = new FileReader()
                blobReader.onload = () => resolve(blobReader.result as string)
                blobReader.onerror = reject
                blobReader.readAsDataURL(blob)
              } else {
                reject(new Error('图片压缩失败'))
              }
            },
            'image/jpeg',
            0.7
          )
        }
        img.onerror = () => reject(new Error('图片加载失败'))
        img.src = e.target?.result as string
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    } else {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    }
  })
}

/**
 * 处理图片上传
 */
async function handleUploadImg(files: File[], callback: (urls: string[]) => void) {
  const urls: string[] = []
  
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      try {
        const base64Url = await fileToBase64(file)
        urls.push(base64Url)
      } catch (error) {
        console.error('图片转换失败:', error)
      }
    }
  }
  
  callback(urls)
}

/**
 * 监听内容变化，检测分页标记
 */
watch(
  () => props.modelValue,
  (newContent, oldContent) => {
    if (!newContent) return
    
    // 只有当内容增加时才检测（说明是用户新输入）
    if (oldContent && newContent.length <= oldContent.length) {
      return // 内容没有增加，可能是删除或修改，不触发分页
    }
    
    const lines = newContent.split('\n')
    let pageIndex = -1
    let _pageMarker = ''
    
    // 查找分页标记（只检测最后一行，说明是刚输入的）
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim()
      if (trimmed === '===' || trimmed === '---page---' || trimmed === '<!-- page -->') {
        pageIndex = i
        _pageMarker = trimmed
      }
    }
    
    // 找到分页标记，立即触发分页
    if (pageIndex >= 0) {
      const beforeContent = lines.slice(0, pageIndex).join('\n').trim()
      const afterContent = lines.slice(pageIndex + 1).join('\n').trim()
      
      // 只有后面有内容才分页
      if (afterContent) {
        // 更新当前页（删除分页标记）
        emit('update:modelValue', beforeContent)
        
        // 触发分页事件
        emit('page-break', beforeContent, afterContent)
        showToast('已分页')
      } else {
        // 后面没有内容，删除标记并提示
        emit('update:modelValue', beforeContent)
        showToast('后面没有内容了')
      }
    }
  },
  { deep: true }
)

/**
 * 显示提示
 */
function showToast(message: string) {
  toastMessage.value = message
  showPageToast.value = true
  setTimeout(() => {
    showPageToast.value = false
  }, 2000)
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
  position: relative;
}

/* MdEditor 样式 */
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

.markdown-editor :deep(.md-editor-textarea) {
  font-family: "JetBrains Mono", monospace;
  font-size: 13px;
  line-height: 1.8;
  padding: 20px;
  background: #FFFFFF;
}

.markdown-editor :deep(.md-editor-preview) {
  display: none !important;
}

.markdown-editor :deep(.md-editor-resize) {
  display: none !important;
}

/* 隐藏滚动条 */
.markdown-editor :deep(.md-editor-textarea)::-webkit-scrollbar,
.markdown-editor :deep(.md-editor-content)::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  display: none !important;
}

.markdown-editor :deep(.md-editor-textarea),
.markdown-editor :deep(.md-editor-content) {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}

/* Toast 提示 */
.page-toast {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  font-size: 14px;
  font-weight: 500;
  z-index: 9999;
  pointer-events: none;
}

.page-toast__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Toast 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
