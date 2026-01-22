'use client'

import { useMemo } from 'react'

interface VideoPlayerProps {
  url: string
  title?: string
  className?: string
}

/**
 * Converts various video sharing URLs to embeddable URLs
 * Supports: Google Drive, YouTube, Loom, Vimeo
 */
function convertToEmbedUrl(url: string): string | null {
  if (!url) return null

  try {
    // Google Drive - file/d/FILE_ID/view format
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/d\/([^/]+)/)
      if (match?.[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`
      }
    }

    // Google Drive - open?id=FILE_ID format
    if (url.includes('drive.google.com/open?id=')) {
      const urlObj = new URL(url)
      const fileId = urlObj.searchParams.get('id')
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`
      }
    }

    // YouTube - watch?v=VIDEO_ID format
    if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url)
      const videoId = urlObj.searchParams.get('v')
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`
      }
    }

    // YouTube - youtu.be/VIDEO_ID format
    if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([^?&]+)/)
      if (match?.[1]) {
        return `https://www.youtube.com/embed/${match[1]}`
      }
    }

    // YouTube - already embed format
    if (url.includes('youtube.com/embed/')) {
      return url
    }

    // Loom - share URL
    if (url.includes('loom.com/share/')) {
      return url.replace('/share/', '/embed/')
    }

    // Loom - already embed format
    if (url.includes('loom.com/embed/')) {
      return url
    }

    // Vimeo - regular URL
    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
      const match = url.match(/vimeo\.com\/(\d+)/)
      if (match?.[1]) {
        return `https://player.vimeo.com/video/${match[1]}`
      }
    }

    // Vimeo - already player format
    if (url.includes('player.vimeo.com')) {
      return url
    }

    return null
  } catch {
    return null
  }
}

/**
 * Converts Google Forms URLs to embeddable URLs
 * Supports: forms.gle short links, docs.google.com/forms full URLs
 */
function convertFormToEmbedUrl(url: string): string | null {
  if (!url) return null

  try {
    // Short form URL: https://forms.gle/ABC123
    if (url.includes('forms.gle/')) {
      // Short URLs need to be kept as-is but with embedded parameter
      // Actually, forms.gle redirects to the full URL, so we need to handle differently
      // For now, we'll use the full URL format after redirect
      return url
    }

    // Full form URL: https://docs.google.com/forms/d/e/FORM_ID/viewform
    if (url.includes('docs.google.com/forms/d/')) {
      // Extract the form ID and construct embed URL
      const match = url.match(/forms\/d\/e\/([^/]+)/)
      if (match?.[1]) {
        return `https://docs.google.com/forms/d/e/${match[1]}/viewform?embedded=true`
      }
      // Also handle non-published forms: /forms/d/FORM_ID/
      const match2 = url.match(/forms\/d\/([^/]+)/)
      if (match2?.[1]) {
        return `https://docs.google.com/forms/d/${match2[1]}/viewform?embedded=true`
      }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Detects if a URL is a Google Form
 */
export function isGoogleFormUrl(url: string): boolean {
  if (!url) return false
  return (
    url.includes('forms.gle/') ||
    url.includes('docs.google.com/forms/')
  )
}

/**
 * Detects if a URL is a supported video URL
 */
export function isVideoUrl(url: string): boolean {
  if (!url) return false
  return (
    url.includes('drive.google.com/file/') ||
    url.includes('drive.google.com/open?id=') ||
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('loom.com') ||
    url.includes('vimeo.com')
  )
}

/**
 * Detects if a URL is embeddable (video or form)
 */
export function isEmbeddableUrl(url: string): boolean {
  return isVideoUrl(url) || isGoogleFormUrl(url)
}

/**
 * Gets the platform name from a URL
 */
export function getVideoPlatform(url: string): string | null {
  if (!url) return null
  if (isGoogleFormUrl(url)) return 'Google Form'
  if (url.includes('drive.google.com')) return 'Google Drive'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube'
  if (url.includes('loom.com')) return 'Loom'
  if (url.includes('vimeo.com')) return 'Vimeo'
  return null
}

export function VideoPlayer({ url, title, className = '' }: VideoPlayerProps) {
  const isForm = useMemo(() => isGoogleFormUrl(url), [url])
  const embedUrl = useMemo(() => {
    if (isForm) return convertFormToEmbedUrl(url)
    return convertToEmbedUrl(url)
  }, [url, isForm])
  const platform = useMemo(() => getVideoPlatform(url), [url])

  if (!embedUrl) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">
          Unsupported media URL
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-orange-500 hover:text-orange-600 text-sm mt-2 inline-block"
        >
          Open in new tab →
        </a>
      </div>
    )
  }

  // Google Form - taller iframe
  if (isForm) {
    return (
      <div className={`relative ${className}`}>
        {/* Platform badge */}
        {platform && (
          <div className="absolute top-2 right-2 z-10 bg-purple-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8 17v-2h8v2H8zm0-4v-2h8v2H8z"/>
            </svg>
            {platform}
          </div>
        )}

        {/* Form iframe - taller for forms */}
        <iframe
          src={embedUrl}
          title={title || 'Assessment Form'}
          className="w-full rounded-lg border border-gray-200"
          style={{ height: '70vh', minHeight: '500px', maxHeight: '800px' }}
          frameBorder="0"
          marginHeight={0}
          marginWidth={0}
        >
          Loading form...
        </iframe>
      </div>
    )
  }

  // Video - 16:9 aspect ratio
  return (
    <div className={`relative ${className}`}>
      {/* Platform badge */}
      {platform && (
        <div className="absolute top-2 right-2 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {platform}
        </div>
      )}

      {/* Video iframe */}
      <iframe
        src={embedUrl}
        title={title || 'Video'}
        className="w-full aspect-video rounded-lg border border-gray-200"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
    </div>
  )
}

export default VideoPlayer
