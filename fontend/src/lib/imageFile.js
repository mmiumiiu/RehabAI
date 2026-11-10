// Turn a picked image File into a downscaled data URL.
//
// Community posts are stored in localStorage (a few MB total), so a 4 MB phone
// photo has to be shrunk before it can be saved. Scaling to 1000px on the long
// edge at JPEG 0.7 keeps a post image around 100–250 KB, which still looks fine
// at the sizes the feed renders. When Firebase Storage replaces this, the same
// call site can upload the File directly instead.

export const MAX_IMAGES = 4
const MAX_EDGE = 1000
const QUALITY = 0.7

export function isImageFile(file) {
  return !!file && file.type.startsWith('image/')
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!isImageFile(file)) {
      reject(new Error('ไฟล์นี้ไม่ใช่รูปภาพ'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('อ่านไฟล์รูปไม่สำเร็จ'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('เปิดไฟล์รูปไม่สำเร็จ'))
      img.onload = () => {
        const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        try {
          resolve(canvas.toDataURL('image/jpeg', QUALITY))
        } catch {
          // Tainted canvas or unsupported type — fall back to the original bytes.
          resolve(reader.result)
        }
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
