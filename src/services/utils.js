export function getDriveEmbedUrl(url) {
    if (!url) return null
  
    const match = url.match(/\/d\/([^/]+)/)
    if (!match) return null
  
    return `https://drive.google.com/file/d/${match[1]}/preview`
  }
  