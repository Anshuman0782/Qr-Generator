import React from 'react';
export { SOCIAL_PRESETS } from '../constants/socialPresets';

export const SocialIcon = ({ type, customUrl, size = 38, className = '' }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [customUrl]);

  if (type === 'custom' && customUrl && !hasError) {
    return (
      <img 
        src={customUrl} 
        alt="" 
        onError={() => setHasError(true)}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          objectFit: 'contain',
          borderRadius: '8px'
        }}
        className={className}
      />
    );
  }

  if (type === 'custom') {
    return (
      <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="2" y="2" width="40" height="40" rx="10" fill="#6366F1"/>
        <path d="M22 14V30M14 22H30" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    );
  }

  const s = size;

  switch (type) {
    case 'web':
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Outer Globe Circle */}
          <circle cx="21" cy="21" r="18" stroke="#111827" strokeWidth="2.8"/>
          {/* Horizontal equator */}
          <line x1="3" y1="21" x2="39" y2="21" stroke="#111827" strokeWidth="2.4"/>
          {/* Vertical meridian */}
          <line x1="21" y1="3" x2="21" y2="39" stroke="#111827" strokeWidth="2.4"/>
          {/* Longitude Ellipse */}
          <ellipse cx="21" cy="21" rx="9" ry="18" stroke="#111827" strokeWidth="2.4"/>
          {/* Mouse pointer cursor overlapping at bottom-right */}
          <path d="M28 24L38 34L33 35L36 41L33 42.5L30 36.5L26 40L28 24Z" fill="#111827" stroke="#ffffff" strokeWidth="1.5"/>
        </svg>
      );

    case 'facebook':
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="22" cy="22" r="21" fill="#1877F2"/>
          <path d="M25.5 22.8H22.3V34H17.8V22.8H15.6V18.9H17.8V16.3C17.8 13.8 19.3 12 22.8 12C24.2 12 25.4 12.3 25.4 12.3L25 15.8C25 15.8 24 15.7 23 15.7C22 15.7 21.6 16.2 21.6 17.1V18.9H25.8L25.5 22.8Z" fill="white"/>
        </svg>
      );

    case 'instagram':
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <defs>
            <linearGradient id="igGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f09433"/>
              <stop offset="25%" stopColor="#e6683c"/>
              <stop offset="50%" stopColor="#dc2743"/>
              <stop offset="75%" stopColor="#cc2366"/>
              <stop offset="100%" stopColor="#bc1888"/>
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="40" height="40" rx="11" fill="url(#igGradient)"/>
          <rect x="10.5" y="10.5" width="23" height="23" rx="7" stroke="white" strokeWidth="2.8"/>
          <circle cx="22" cy="22" r="5.6" stroke="white" strokeWidth="2.8"/>
          <circle cx="28.8" cy="15.2" r="1.6" fill="white"/>
        </svg>
      );

    case 'youtube':
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="2" y="7" width="40" height="30" rx="8" fill="#FF0000"/>
          <polygon points="18,15 30,22 18,29" fill="white"/>
        </svg>
      );

    case 'x':
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="2" y="2" width="40" height="40" rx="10" fill="#000000"/>
          <path d="M12 12L20 23.5L12 32H14.5L21.2 24.8L26.5 32H32L23.5 19.8L31 12H28.5L22.2 18.6L17.5 12H12ZM15.5 14H18.2L28.5 30H25.8L15.5 14Z" fill="white"/>
        </svg>
      );

    case 'whatsapp':
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="22" cy="22" r="21" fill="#25D366"/>
          <path d="M29.5 25.8C29 25.5 26.6 24.3 26.2 24.1C25.8 23.9 25.5 23.8 25.2 24.3C24.9 24.8 24.1 25.8 23.8 26.1C23.5 26.4 23.2 26.5 22.7 26.2C22.2 26 20.6 25.4 18.7 23.7C17.2 22.4 16.2 20.7 15.9 20.2C15.6 19.7 15.9 19.4 16.1 19.2C16.3 19 16.6 18.6 16.8 18.3C17 18 17.1 17.8 17.2 17.5C17.3 17.2 17.2 16.9 17.1 16.7C17 16.5 16.2 14.5 15.8 13.6C15.5 12.7 15.1 12.8 14.8 12.8C14.5 12.8 14.2 12.8 13.9 12.8C13.6 12.8 13 12.9 12.6 13.4C12.1 13.9 11 15 11 17.2C11 19.4 12.6 21.6 12.8 21.9C13 22.2 16 26.8 20.5 28.7C24.2 30.3 25.2 30 26.3 29.8C27.5 29.6 29.9 28.3 30.4 27C30.9 25.7 30.9 24.6 30.7 24.3C30.5 24.1 30 26 29.5 25.8Z" fill="white"/>
        </svg>
      );

    case 'linkedin':
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="2" y="2" width="40" height="40" rx="9" fill="#0A66C2"/>
          <path d="M12 18H17V33H12V18ZM14.5 10C16.1 10 17.4 11.3 17.4 12.9C17.4 14.5 16.1 15.8 14.5 15.8C12.9 15.8 11.6 14.5 11.6 12.9C11.6 11.3 12.9 10 14.5 10ZM20 18H24.8V20.1H24.9C25.6 18.8 27.2 17.5 29.7 17.5C34.8 17.5 35.8 20.9 35.8 25.2V33H30.8V25.9C30.8 24.2 30.8 22 28.4 22C26 22 25.6 23.9 25.6 25.8V33H20.6V18H20Z" fill="white"/>
        </svg>
      );

    case 'tiktok':
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="22" cy="22" r="21" fill="#010101"/>
          <path d="M26.5 13C25.5 14.2 24 15.3 22 15.6V25.8C22 28 20.2 29.8 18 29.8C15.8 29.8 14 28 14 25.8C14 23.6 15.8 21.8 18 21.8C18.4 21.8 18.8 21.9 19.2 22V18.2C18.8 18.1 18.4 18.1 18 18.1C13.8 18.1 10.3 21.5 10.3 25.8C10.3 30 13.7 33.5 18 33.5C22.2 33.5 25.7 30.1 25.7 25.8V19.4C27.5 20.7 29.6 21.5 32 21.5V17.8C29.4 17.8 27.2 15.8 26.5 13Z" fill="white"/>
        </svg>
      );

    case 'github':
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="22" cy="22" r="21" fill="#24292E"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M22 10C15.4 10 10 15.4 10 22.1C10 27.4 13.5 31.9 18.3 33.5C18.9 33.6 19.1 33.2 19.1 32.9C19.1 32.6 19.1 31.8 19.1 30.7C15.7 31.4 15 29.2 15 29.2C14.4 27.8 13.6 27.4 13.6 27.4C12.5 26.7 13.7 26.7 13.7 26.7C14.9 26.8 15.5 28 15.5 28C16.6 29.8 18.3 29.3 19 29C19.1 28.2 19.4 27.7 19.8 27.4C17.1 27.1 14.3 26 14.3 21.3C14.3 20 14.8 18.9 15.6 18C15.5 17.7 15.1 16.4 15.7 14.8C15.7 14.8 16.7 14.5 19 16.1C20 15.8 21 15.7 22 15.7C23 15.7 24 15.8 25 16.1C27.3 14.5 28.3 14.8 28.3 14.8C28.9 16.4 28.5 17.7 28.4 18C29.2 18.9 29.7 20 29.7 21.3C29.7 26.1 26.9 27.1 24.2 27.4C24.7 27.8 25.1 28.6 25.1 29.8C25.1 31.5 25.1 32.6 25.1 32.9C25.1 33.2 25.3 33.6 25.9 33.5C30.6 31.9 34 27.4 34 22.1C34 15.4 28.6 10 22 10Z" fill="white"/>
        </svg>
      );

    case 'telegram':
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="22" cy="22" r="21" fill="#229ED9"/>
          <path d="M12 21.6L29.5 14.8C30.3 14.5 31 15 30.7 15.9L27.7 30C27.5 30.9 26.9 31.1 26.2 30.7L21.7 27.4L19.5 29.5C19.3 29.7 19.1 29.9 18.7 29.9L19 25.5L27 18.2C27.3 17.9 27 17.7 26.5 18L16.6 24.2L12.3 22.9C11.4 22.6 11.4 22 12 21.6Z" fill="white"/>
        </svg>
      );

    case 'spotify':
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="22" cy="22" r="21" fill="#1DB954"/>
          <path d="M29.8 28.2C29.4 28.8 28.6 29 28 28.6C23.8 26 18.8 25.5 14.2 26.6C13.5 26.8 12.8 26.3 12.6 25.6C12.4 24.9 12.9 24.2 13.6 24C18.8 22.8 24.3 23.4 29 26.3C29.6 26.7 29.8 27.5 29.8 28.2ZM31.4 23.4C30.9 24.2 29.9 24.4 29.1 23.9C24.4 21 17.6 20.2 12.4 21.8C11.5 22.1 10.5 21.6 10.2 20.7C9.9 19.8 10.4 18.8 11.3 18.5C17.3 16.7 24.8 17.6 30.2 20.9C31 21.4 31.2 22.5 31.4 23.4ZM31.7 18.5C26 15.1 16.6 14.8 11.1 16.5C10 16.8 8.8 16.2 8.5 15.1C8.2 14 8.8 12.8 9.9 12.5C16.3 10.5 26.8 10.9 33.4 14.8C34.4 15.4 34.7 16.7 34.1 17.7C33.5 18.6 32.2 18.9 31.7 18.5Z" fill="#121212"/>
        </svg>
      );

    case 'discord':
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="2" y="2" width="40" height="40" rx="10" fill="#5865F2"/>
          <path d="M29.5 14C27.8 13.2 26 12.6 24.1 12.3C23.9 12.7 23.6 13.3 23.4 13.7C21.4 13.4 19.4 13.4 17.4 13.7C17.2 13.3 16.9 12.7 16.6 12.3C14.7 12.6 12.9 13.2 11.2 14C7.7 19.2 6.8 24.3 7.2 29.3C9.5 31 11.7 32 13.9 32.7C14.4 32 14.9 31.2 15.3 30.4C14.5 30.1 13.8 29.7 13.1 29.2C13.3 29.1 13.5 28.9 13.7 28.7C18.1 30.7 22.9 30.7 27.2 28.7C27.4 28.9 27.6 29.1 27.8 29.2C27.1 29.7 26.3 30.1 25.5 30.4C25.9 31.2 26.4 32 26.9 32.7C29.1 32 31.3 31 33.6 29.3C34.1 23.6 32.6 18.6 29.5 14ZM16.2 25.9C14.9 25.9 13.8 24.7 13.8 23.2C13.8 21.7 14.9 20.5 16.2 20.5C17.6 20.5 18.7 21.7 18.6 23.2C18.6 24.7 17.5 25.9 16.2 25.9ZM24.6 25.9C23.3 25.9 22.2 24.7 22.2 23.2C22.2 21.7 23.3 20.5 24.6 20.5C26 20.5 27.1 21.7 27 23.2C27 24.7 26 25.9 24.6 25.9Z" fill="white"/>
        </svg>
      );

    case 'email':
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="22" cy="22" r="21" fill="#EA4335"/>
          <path d="M12 15C10.9 15 10 15.9 10 17V27C10 28.1 10.9 29 12 29H32C33.1 29 34 28.1 34 27V17C34 15.9 33.1 15 32 15H12ZM12 17H32L22 23.2L12 17ZM12 19.3L21.5 25.1C21.8 25.3 22.2 25.3 22.5 25.1L32 19.3V27H12V19.3Z" fill="white"/>
        </svg>
      );

    case 'phone':
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="22" cy="22" r="21" fill="#10B981"/>
          <path d="M15 13C14.4 13 13.9 13.5 13.9 14.1C13.9 21.8 20.2 28.1 27.9 28.1C28.5 28.1 29 27.6 29 27V23.9C29 23.4 28.6 22.9 28.1 22.8L24.5 22C24 21.9 23.5 22.1 23.2 22.4L21.7 23.9C19 22.5 16.5 20 15.1 17.3L16.6 15.8C16.9 15.5 17.1 15 17 14.5L16.2 10.9C16.1 10.4 15.6 10 15.1 10H15V13Z" fill="white"/>
        </svg>
      );

    default:
      return (
        <svg width={s} height={s} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <rect x="2" y="2" width="40" height="40" rx="10" fill="#6366F1"/>
          <path d="M18 22H26M22 18V26" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      );
  }
};

// Clean generic user profile avatar
export const DefaultAvatar = ({ size = 64, className = '' }) => {
  return (
    <div 
      className={`bio-default-avatar ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        border: '3px solid #ffffff',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
      }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
};

// Resilient Avatar with automatic fallback to DefaultAvatar if image is empty or fails to load
export const SafeAvatar = ({ src, size = 64, alt = "Profile", className = "" }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return <DefaultAvatar size={size} className={className} />;
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setHasError(true)} 
    />
  );
};

