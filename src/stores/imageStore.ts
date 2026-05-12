import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useImageStore = defineStore('image', () => {
  const images = ref(new Map<string, string>())
  let counter = 0

  function addImage(file: File): string {
    const id = `img-${String(++counter).padStart(3, '0')}`
    const url = URL.createObjectURL(file)
    images.value.set(id, url)
    return id
  }

  function getUrl(id: string): string | undefined {
    return images.value.get(id)
  }

  function cleanup() {
    images.value.forEach(url => URL.revokeObjectURL(url))
    images.value.clear()
  }

  return { images, addImage, getUrl, cleanup }
})
