// Client-side image compression for review photos.
//
// Reviews have no dedicated storage bucket — the photo travels inside the
// review document (Firestore) / localStorage mirror as a data URL. So we
// aggressively downscale + re-encode to JPEG to keep it small (typically
// well under ~120 KB) and safely inside Firestore's 1 MB document limit.
//
// Returns a Promise<string> resolving to a `data:image/jpeg;base64,…` URL,
// or rejects if the file can't be read/decoded.
export function compressImage(file, { maxDim = 1000, quality = 0.7 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith('image/')) {
      reject(new Error('Please choose an image file.'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read that image.'))
    reader.onload = () => {
      const imgEl = new Image()
      imgEl.onerror = () => reject(new Error('That image looks corrupted.'))
      imgEl.onload = () => {
        let { width, height } = imgEl
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height)
          width = Math.round(width * scale)
          height = Math.round(height * scale)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(imgEl, 0, 0, width, height)
        try {
          resolve(canvas.toDataURL('image/jpeg', quality))
        } catch (err) {
          reject(err)
        }
      }
      imgEl.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
