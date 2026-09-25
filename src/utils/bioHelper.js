// Helper functions for Multi-Link Bio page data handling, compression, and encoding

export const compressImage = (file, maxSize = 72, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

// Uploads image to tmpfiles.org to get a short URL (<50 chars) for QR code
export const uploadImageToCloud = async (file) => {
  if (!file) return null;
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) return null;
    const result = await response.json();
    if (result.status === 'success' && result.data?.url) {
      return result.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
    }
  } catch {
    // If offline or upload fails, return null
  }
  return null;
};

const stripProtocol = (url) => {
  if (!url) return '';
  return url.replace(/^https?:\/\//i, '');
};

const restoreProtocol = (url) => {
  if (!url) return '';
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) return url;
  return `https://${url}`;
};

export const encodeBioData = (data) => {
  if (!data) return '';
  try {
    const compact = {};
    if (data.title && data.title.trim()) {
      compact.t = data.title.trim();
    }
    if (data.subtitle && data.subtitle.trim()) {
      compact.s = data.subtitle.trim();
    }
    if (data.bannerColor && data.bannerColor.toLowerCase() !== '#3866d1') {
      compact.b = data.bannerColor;
    }
    // Only keep avatar if it's an external short URL (not massive base64)
    if (data.avatar && !data.avatar.startsWith('data:')) {
      compact.a = data.avatar.trim();
    }

    const rawLinks = Array.isArray(data.links) ? data.links : [];
    // Only encode links that have a URL or title
    const validLinks = rawLinks.filter(l => (l.url && l.url.trim()) || (l.title && l.title.trim()));
    
    if (validLinks.length > 0) {
      compact.l = validLinks.map(l => {
        const item = {
          u: stripProtocol(l.url ? l.url.trim() : '')
        };
        if (l.icon && l.icon !== 'web') {
          item.i = l.icon;
        }
        // Only include title if it differs from the icon default label
        if (l.title && l.title.trim().toLowerCase() !== (l.icon || 'web').toLowerCase()) {
          item.t = l.title.trim();
        }
        if (l.customIcon && !l.customIcon.startsWith('data:')) {
          item.c = l.customIcon.trim();
        }
        return item;
      });
    }

    const jsonStr = JSON.stringify(compact);
    // Standard UTF-8 base64 encoding without inflating characters
    const utf8Bytes = unescape(encodeURIComponent(jsonStr));
    const base64 = btoa(utf8Bytes)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64;
  } catch (err) {
    console.error('Error encoding bio data:', err);
    return '';
  }
};

export const decodeBioData = (encodedStr) => {
  if (!encodedStr) return null;
  try {
    let base64 = encodedStr.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    let jsonStr = '';
    try {
      const binaryStr = atob(base64);
      try {
        jsonStr = decodeURIComponent(escape(binaryStr));
      } catch {
        jsonStr = decodeURIComponent(binaryStr);
      }
    } catch {
      // Fallback for legacy decodeURIComponent(atob(...))
      jsonStr = decodeURIComponent(atob(encodedStr));
    }

    const compact = JSON.parse(jsonStr);

    if (compact.t !== undefined || compact.l !== undefined || compact.b !== undefined || compact.s !== undefined) {
      return {
        title: compact.t || '',
        subtitle: compact.s || '',
        bannerColor: compact.b || '#3866d1',
        avatar: compact.a || '',
        links: (compact.l || []).map((link, idx) => {
          const icon = link.i || 'web';
          const title = link.t || (icon.charAt(0).toUpperCase() + icon.slice(1));
          return {
            id: `link_${idx}_${Date.now()}`,
            icon,
            title,
            url: restoreProtocol(link.u || ''),
            customIcon: link.c || ''
          };
        })
      };
    }

    return compact;
  } catch (err) {
    console.error('Error decoding bio data:', err);
    return null;
  }
};

// Generates the full shareable URL to view the landing page
// If customBaseUrl is provided or running on localhost, uses the live public domain so mobile scanners work worldwide
export const generateBioUrl = (bioData, customBaseUrl) => {
  const encoded = encodeBioData(bioData);
  if (!encoded) return '';
  let base = customBaseUrl;
  if (!base) {
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      base = isLocal ? 'https://qr-generator0782.vercel.app' : window.location.origin;
    } else {
      base = 'https://qr-generator0782.vercel.app';
    }
  }
  base = base.replace(/\/+$/, '');
  return `${base}/?bio=${encoded}`;
};
