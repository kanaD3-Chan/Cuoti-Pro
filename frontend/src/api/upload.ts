/* ==========================================================================
 * 附件上传 API（预留，后端就绪后实现）
 * ========================================================================== */

export const uploadApi = {
  upload(file: File, onProgress?: (percent: number) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      const form = new FormData()
      form.append('file', file)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/agent/upload')

      const token = localStorage.getItem('cuoti_token')
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText)
            resolve(data.url || data.file_url || data.id)
          } catch {
            reject(new Error('上传响应解析失败'))
          }
        } else {
          reject(new Error(`上传失败 [${xhr.status}]`))
        }
      }

      xhr.onerror = () => reject(new Error('网络异常，上传失败'))
      xhr.send(form)
    })
  }
}
