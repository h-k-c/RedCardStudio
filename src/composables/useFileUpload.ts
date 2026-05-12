import { ref } from 'vue'

export function useFileUpload() {
  const imageSrc = ref<string | null>(null)
  const fileName = ref('')
  const imageLoaded = ref(false)

  function loadFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Not an image file'))
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        const src = e.target?.result as string
        imageSrc.value = src
        fileName.value = file.name
        imageLoaded.value = true
        resolve(src)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  function reset() {
    imageSrc.value = null
    fileName.value = ''
    imageLoaded.value = false
  }

  return { imageSrc, fileName, imageLoaded, loadFile, reset }
}
