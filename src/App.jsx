import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { 
  Link2, FileText, FileUp, Wifi, Contact, MessageSquare, 
  Download, Copy, Trash2, CheckCircle2, QrCode, Sun, Moon, 
  Smartphone, Plus, Sparkles, ExternalLink, Image as ImageIcon,
  RotateCcw, Layers, ArrowUp, ArrowDown
} from 'lucide-react';
import { SOCIAL_PRESETS, SocialIcon, SafeAvatar } from './components/SocialIcons';
import { BioMobilePreview } from './components/BioMobilePreview';
import { BioLandingView } from './components/BioLandingView';
import { compressImage, decodeBioData, generateBioUrl } from './utils/bioHelper';

// Banner Color Theme Presets
const BANNER_COLOR_PRESETS = [
  { name: 'Royal Blue', color: '#3866d1' },
  { name: 'Ocean Cyan', color: '#0284c7' },
  { name: 'Emerald', color: '#059669' },
  { name: 'Purple', color: '#7c3aed' },
  { name: 'Rose', color: '#db2777' },
  { name: 'Sunset', color: '#ea580c' },
  { name: 'Midnight', color: '#0f172a' }
];

// Initial generic default links
const DEFAULT_BIO_LINKS = [
  { id: 'link_1', icon: 'web', title: 'Website', url: '', customIcon: '' },
  { id: 'link_2', icon: 'facebook', title: 'Facebook', url: '', customIcon: '' },
  { id: 'link_3', icon: 'instagram', title: 'Instagram', url: '', customIcon: '' }
];

// Pre-packaged logos that users can embed in the center of their QR code
const PRESET_LOGOS = [
  { name: 'none', label: 'No Logo', url: '' },
  { name: 'link', label: 'Link', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2300f2fe" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>' },
  { name: 'wifi', label: 'WiFi', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2300f2fe" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>' },
  { name: 'contact', label: 'Card', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2300f2fe" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>' },
  { name: 'mail', label: 'Email', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2300f2fe" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>' }
];

// Helper to retrieve saved state from localStorage with safety sanitization
const loadSavedState = () => {
  try {
    const saved = localStorage.getItem('qrcadia_state');
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    // Sanitize any oversized payload from previous crashes
    if (parsed.data && parsed.data.length > 2500) parsed.data = '';
    if (parsed.customLogoUrl && parsed.customLogoUrl.length > 5000) {
      parsed.customLogoUrl = '';
      parsed.logoPreset = 'none';
    }
    // Clear any broken/expired tmpfiles.org URLs or corrupted avatar data
    if (parsed.bioAvatar && (parsed.bioAvatar.includes('tmpfiles.org') || parsed.bioAvatar.length > 50000)) {
      parsed.bioAvatar = '';
    }
    // Default to 'L' so QR code has fewest, cleanest dots
    if (!parsed.errorCorrectionLevel || parsed.errorCorrectionLevel === 'Q') {
      parsed.errorCorrectionLevel = 'L';
    }
    // Sanitize scanBaseUrl
    if (parsed.scanBaseUrl && typeof parsed.scanBaseUrl === 'string') {
      if (parsed.scanBaseUrl.includes('localhost') || parsed.scanBaseUrl.includes('127.0.0.1')) {
        parsed.scanBaseUrl = 'https://qr-generator0782.vercel.app';
      }
    }
    // Clear any reference to Baldwin
    if (parsed.bioTitle === 'Baldwinsociety') parsed.bioTitle = '';
    if (parsed.bioSubtitle === 'Find me on') parsed.bioSubtitle = '';
    if (Array.isArray(parsed.bioLinks)) {
      parsed.bioLinks = parsed.bioLinks.map(l => ({
        ...l,
        url: (l.url && (l.url.includes('baldwinsociety') || l.url.includes('tmpfiles.org'))) ? '' : l.url,
        customIcon: (l.customIcon && (l.customIcon.includes('tmpfiles.org') || l.customIcon.length > 50000)) ? '' : l.customIcon
      }));
    }
    return parsed;
  } catch (e) {
    console.error('Failed to parse saved state:', e);
    return {};
  }
};

const getSystemTheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
};

const savedState = loadSavedState();

function App() {
  // Check if opened via QR scan or direct link (?bio=...)
  const [standaloneBio, setStandaloneBio] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const bioParam = urlParams.get('bio');
      if (bioParam) {
        return decodeBioData(bioParam);
      }
    }
    return null;
  });

  const [theme, setTheme] = useState(savedState.theme || getSystemTheme());
  const [activeTab, setActiveTab] = useState(savedState.activeTab || 'multi-link');
  const [toast, setToast] = useState({ show: false, message: '' });

  // PWA Installation states
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Main QR code content state
  const [data, setData] = useState(savedState.data || '');

  // Multi-Link (Bio Links) States - clean generic defaults
  const [bioTitle, setBioTitle] = useState(savedState.bioTitle !== undefined ? savedState.bioTitle : '');
  const [bioSubtitle, setBioSubtitle] = useState(savedState.bioSubtitle !== undefined ? savedState.bioSubtitle : '');
  const [bioBannerColor, setBioBannerColor] = useState(savedState.bioBannerColor || '#3866d1');
  const [bioAvatar, setBioAvatar] = useState(savedState.bioAvatar || '');
  const [bioLinks, setBioLinks] = useState(savedState.bioLinks || DEFAULT_BIO_LINKS);
  const [previewMode, setPreviewMode] = useState(savedState.previewMode || 'mockup');
  const [scanBaseUrl, setScanBaseUrl] = useState(() => {
    if (savedState.scanBaseUrl && typeof savedState.scanBaseUrl === 'string' && !savedState.scanBaseUrl.includes('localhost') && !savedState.scanBaseUrl.includes('127.0.0.1')) {
      return savedState.scanBaseUrl;
    }
    if (typeof window !== 'undefined') {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      return isLocal ? 'https://qr-generator0782.vercel.app' : window.location.origin;
    }
    return 'https://qr-generator0782.vercel.app';
  });

  // Input States
  // URL Input
  const [url, setUrl] = useState(savedState.url !== undefined ? savedState.url : '');
  // Text Input
  const [text, setText] = useState(savedState.text || '');
  // File Upload Input
  const [file, setFile] = useState(null); // File objects cannot be saved, so always null on reload
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(savedState.uploadedUrl || '');
  const [fileUrlType, setFileUrlType] = useState(savedState.fileUrlType || 'direct');
  // WiFi Input
  const [wifiSsid, setWifiSsid] = useState(savedState.wifiSsid || '');
  const [wifiPassword, setWifiPassword] = useState(savedState.wifiPassword || '');
  const [wifiSecurity, setWifiSecurity] = useState(savedState.wifiSecurity || 'WPA');
  const [wifiHidden, setWifiHidden] = useState(savedState.wifiHidden !== undefined ? savedState.wifiHidden : false);
  // vCard Input
  const [contactName, setContactName] = useState(savedState.contactName || '');
  const [contactPhone, setContactPhone] = useState(savedState.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(savedState.contactEmail || '');
  const [contactOrg, setContactOrg] = useState(savedState.contactOrg || '');
  const [contactTitle, setContactTitle] = useState(savedState.contactTitle || '');
  const [contactUrl, setContactUrl] = useState(savedState.contactUrl || '');
  // Comm (Email/SMS/WhatsApp) Input
  const [commType, setCommType] = useState(savedState.commType || 'email');
  // Email fields
  const [emailTo, setEmailTo] = useState(savedState.emailTo || '');
  const [emailSubject, setEmailSubject] = useState(savedState.emailSubject || '');
  const [emailBody, setEmailBody] = useState(savedState.emailBody || '');
  // SMS fields
  const [smsPhone, setSmsPhone] = useState(savedState.smsPhone || '');
  const [smsMessage, setSmsMessage] = useState(savedState.smsMessage || '');
  // WhatsApp fields
  const [waPhone, setWaPhone] = useState(savedState.waPhone || '');
  const [waMessage, setWaMessage] = useState(savedState.waMessage || '');

  // Styling States - Default to black and normal
  const [dotsType, setDotsType] = useState(savedState.dotsType !== undefined ? savedState.dotsType : 'square');
  const [dotsColor, setDotsColor] = useState(savedState.dotsColor !== undefined ? savedState.dotsColor : '#000000');
  const [dotsColor2, setDotsColor2] = useState(savedState.dotsColor2 !== undefined ? savedState.dotsColor2 : '#000000');
  const [dotsGradient, setDotsGradient] = useState(savedState.dotsGradient !== undefined ? savedState.dotsGradient : false);
  const [gradientAngle, setGradientAngle] = useState(savedState.gradientAngle !== undefined ? savedState.gradientAngle : 45);
  const [bgColor, setBgColor] = useState(savedState.bgColor !== undefined ? savedState.bgColor : '#ffffff');

  // Corner Square Options - Default to black and normal
  const [eyeSquareType, setEyeSquareType] = useState(savedState.eyeSquareType !== undefined ? savedState.eyeSquareType : 'square');
  const [eyeSquareColor, setEyeSquareColor] = useState(savedState.eyeSquareColor !== undefined ? savedState.eyeSquareColor : '#000000');
  const [eyeDotType, setEyeDotType] = useState(savedState.eyeDotType !== undefined ? savedState.eyeDotType : 'square');
  const [eyeDotColor, setEyeDotColor] = useState(savedState.eyeDotColor !== undefined ? savedState.eyeDotColor : '#000000');

  // Logo Customization
  const [logoPreset, setLogoPreset] = useState(savedState.logoPreset || 'none');
  const [customLogoUrl, setCustomLogoUrl] = useState(savedState.customLogoUrl || '');
  const [logoSize, setLogoSize] = useState(savedState.logoSize !== undefined ? savedState.logoSize : 0.25);
  const [logoMargin, setLogoMargin] = useState(savedState.logoMargin !== undefined ? savedState.logoMargin : 4);

  // Settings
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState(savedState.errorCorrectionLevel === 'Q' || !savedState.errorCorrectionLevel ? 'L' : savedState.errorCorrectionLevel); // L, M, Q, H
  const [downloadFormat, setDownloadFormat] = useState(savedState.downloadFormat || 'png');

  // New QR name/label state
  const [qrName, setQrName] = useState(savedState.qrName || '');

  // References
  const qrRef = useRef(null);
  const qrInstanceRef = useRef(null);

  // Toast notifier helper
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3500);
  };

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // Multi-Link management functions
  const handleAddLink = (presetId = 'web') => {
    const preset = SOCIAL_PRESETS.find(p => p.id === presetId) || SOCIAL_PRESETS[0];
    const newLink = {
      id: `link_${Date.now()}`,
      icon: preset.id,
      title: preset.defaultTitle,
      url: preset.placeholderUrl,
      customIcon: ''
    };
    setBioLinks(prev => [...prev, newLink]);
    showToast(`Added ${preset.defaultTitle} link!`);
  };

  const handleUpdateLink = (index, field, value) => {
    setBioLinks(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSelectPresetForLink = (index, presetId) => {
    const preset = SOCIAL_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setBioLinks(prev => {
      const updated = [...prev];
      const current = updated[index];
      const isDefaultTitle = SOCIAL_PRESETS.some(p => p.defaultTitle === current.title) || !current.title;
      updated[index] = {
        ...current,
        icon: preset.id,
        title: isDefaultTitle ? preset.defaultTitle : current.title,
        url: (!current.url || current.url.startsWith('https://')) && preset.placeholderUrl ? preset.placeholderUrl : current.url
      };
      return updated;
    });
  };

  const handleCustomLogoForLink = async (index, file) => {
    if (!file) return;
    try {
      const compressed = await compressImage(file, 64, 0.7);
      if (compressed) {
        setBioLinks(prev => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            icon: 'custom',
            customIcon: compressed
          };
          return updated;
        });
        showToast('Custom logo applied to link!');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load image.');
    }
  };

  const handleRemoveLink = (index) => {
    setBioLinks(prev => prev.filter((_, i) => i !== index));
    showToast('Link removed.');
  };

  const handleMoveLink = (index, direction) => {
    setBioLinks(prev => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 80, 0.7);
      if (compressed) {
        setBioAvatar(compressed);
        showToast('Profile image updated!');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to upload image.');
    }
  };

  const handleResetAvatar = () => {
    setBioAvatar('');
    showToast('Profile photo removed.');
  };

  // Restart / Reset state to defaults
  const handleReset = () => {
    if (window.confirm("Are you sure you want to restart? This will clear all inputs and reset styles.")) {
      try {
        localStorage.removeItem('qrcadia_state');
      } catch (e) {
        console.error(e);
      }

      setUrl('https://qr-generator0782.vercel.app/');
      setText('');
      setFile(null);
      setUploadedUrl('');
      setFileUrlType('direct');
      setWifiSsid('');
      setWifiPassword('');
      setWifiSecurity('WPA');
      setWifiHidden(false);
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setContactOrg('');
      setContactTitle('');
      setContactUrl('');
      setCommType('email');
      setEmailTo('');
      setEmailSubject('');
      setEmailBody('');
      setSmsPhone('');
      setSmsMessage('');
      setWaPhone('');
      setWaMessage('');

      setBioTitle('');
      setBioSubtitle('');
      setBioBannerColor('#3866d1');
      setBioAvatar('');
      setBioLinks(DEFAULT_BIO_LINKS);
      setPreviewMode('mockup');

      setDotsType('square');
      setDotsColor('#000000');
      setDotsColor2('#000000');
      setDotsGradient(false);
      setGradientAngle(0);
      setBgColor('#ffffff');
      setEyeSquareType('square');
      setEyeSquareColor('#000000');
      setEyeDotType('square');
      setEyeDotColor('#000000');
      setLogoPreset('none');
      setCustomLogoUrl('');
      setLogoSize(0.4);
      setLogoMargin(4);
      setErrorCorrectionLevel('L');
      setScanBaseUrl('https://qr-generator0782.vercel.app');
      setDownloadFormat('png');
      setQrName('');
      setActiveTab('multi-link');

      showToast('Cleared all inputs and settings!');
    }
  };

  // Sync theme with HTML document attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Save State to localStorage on state changes
  useEffect(() => {
    const stateToSave = {
      theme, activeTab, data, url, text, uploadedUrl, fileUrlType,
      wifiSsid, wifiPassword, wifiSecurity, wifiHidden,
      contactName, contactPhone, contactEmail, contactOrg, contactTitle, contactUrl,
      commType, emailTo, emailSubject, emailBody, smsPhone, smsMessage, waPhone, waMessage,
      dotsType, dotsColor, dotsColor2, dotsGradient, gradientAngle, bgColor,
      eyeSquareType, eyeSquareColor, eyeDotType, eyeDotColor,
      logoPreset, customLogoUrl, logoSize, logoMargin,
      errorCorrectionLevel, downloadFormat, qrName,
      bioTitle, bioSubtitle, bioBannerColor, bioAvatar, bioLinks, previewMode, scanBaseUrl
    };
    try {
      localStorage.setItem('qrcadia_state', JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [
    theme, activeTab, data, url, text, uploadedUrl, fileUrlType,
    wifiSsid, wifiPassword, wifiSecurity, wifiHidden,
    contactName, contactPhone, contactEmail, contactOrg, contactTitle, contactUrl,
    commType, emailTo, emailSubject, emailBody, smsPhone, smsMessage, waPhone, waMessage,
    dotsType, dotsColor, dotsColor2, dotsGradient, gradientAngle, bgColor,
    eyeSquareType, eyeSquareColor, eyeDotType, eyeDotColor,
    logoPreset, customLogoUrl, logoSize, logoMargin,
    errorCorrectionLevel, downloadFormat, qrName,
    bioTitle, bioSubtitle, bioBannerColor, bioAvatar, bioLinks, previewMode, scanBaseUrl
  ]);

  // Handle PWA Installation prompting
  useEffect(() => {
    // Hide download button if app is already running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      setIsInstallable(false);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      showToast('App installed successfully! You can now run it locally.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  // Initialize and update QR Code Styling instance dynamically
  useEffect(() => {
    // Get current logo URL based on preset or custom upload
    let logoUrl = '';
    if (logoPreset === 'custom') {
      logoUrl = customLogoUrl;
    } else {
      const preset = PRESET_LOGOS.find(l => l.name === logoPreset);
      logoUrl = preset ? preset.url : '';
    }

    // Configure Dots Gradient or Single Color
    const dotsOptions = {
      type: dotsType,
    };

    if (dotsGradient) {
      dotsOptions.gradient = {
        type: 'linear',
        rotation: (gradientAngle * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: dotsColor },
          { offset: 1, color: dotsColor2 }
        ]
      };
    } else {
      dotsOptions.color = dotsColor;
    }

    try {
      let qrData = (data && data.trim() !== '') ? data : ' ';
      // Guard against QRCode overflow limit (~2200 chars in binary mode)
      if (qrData.length > 2000) {
        console.warn('QR code payload length is too large:', qrData.length);
        qrData = qrData.substring(0, 2000);
      }

      qrInstanceRef.current = new QRCodeStyling({
        width: 280,
        height: 280,
        type: 'svg',
        data: qrData,
        dotsOptions,
        backgroundOptions: {
          color: bgColor,
        },
        cornersSquareOptions: {
          type: eyeSquareType,
          color: eyeSquareColor,
        },
        cornersDotOptions: {
          type: eyeDotType,
          color: eyeDotColor,
        },
        image: logoUrl,
        qrOptions: {
          errorCorrectionLevel: errorCorrectionLevel,
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: logoMargin,
          imageSizeFactor: logoSize,
        }
      });

      if (qrRef.current) {
        qrRef.current.innerHTML = '';
        qrInstanceRef.current.append(qrRef.current);
      }
    } catch (err) {
      console.error('Safe catch: QRCodeStyling generation error:', err);
    }
  }, [
    data, dotsType, dotsColor, dotsColor2, dotsGradient, gradientAngle,
    bgColor, eyeSquareType, eyeSquareColor, eyeDotType, eyeDotColor,
    logoPreset, customLogoUrl, logoSize, logoMargin, errorCorrectionLevel,
    previewMode, activeTab
  ]);

  // Sync Input changes with main Data state depending on Active Tab
  useEffect(() => {
    switch (activeTab) {
      case 'multi-link': {
        const fullBioUrl = generateBioUrl({
          title: bioTitle,
          subtitle: bioSubtitle,
          bannerColor: bioBannerColor,
          avatar: bioAvatar,
          links: bioLinks
        }, scanBaseUrl);
        setData(fullBioUrl);
        break;
      }
      case 'link':
        setData(url || '');  // <-- Default to homepage if URL is empty
        break;
      case 'text':
        setData(text || ' ');
        break;
      case 'file':
        if (uploadedUrl) {
          // URL-encode the filename to prevent QR scanners from truncating on special characters like ( )
          const urlParts = uploadedUrl.split('/');
          const filename = urlParts.pop();
          const encodedFilename = encodeURIComponent(filename);
          const cleanUploadedUrl = [...urlParts, encodedFilename].join('/');
          
          const directUrl = cleanUploadedUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
          setData(fileUrlType === 'direct' ? directUrl : cleanUploadedUrl);
        } else {
          setData(' ');
        }
        break;
      case 'wifi':
        if (wifiSsid) {
          // WiFi format: WIFI:S:SSID;T:WPA;P:Password;H:true;;
          const security = wifiSecurity === 'None' ? 'nopass' : wifiSecurity;
          const wifiString = `WIFI:S:${wifiSsid};T:${security};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
          setData(wifiString);
        } else {
          setData(' ');
        }
        break;
      case 'contact':
        if (contactName || contactPhone || contactEmail) {
          const vcardString = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${contactName}`,
            contactOrg ? `ORG:${contactOrg}` : '',
            contactTitle ? `TITLE:${contactTitle}` : '',
            contactPhone ? `TEL;TYPE=CELL:${contactPhone}` : '',
            contactEmail ? `EMAIL;TYPE=PREF,INTERNET:${contactEmail}` : '',
            contactUrl ? `URL:${contactUrl}` : '',
            'END:VCARD'
          ].filter(Boolean).join('\n');
          setData(vcardString);
        } else {
          setData(' ');
        }
        break;
      case 'comm':
        if (commType === 'email' && emailTo) {
          const emailString = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
          setData(emailString);
        } else if (commType === 'sms' && smsPhone) {
          const smsString = `sms:${smsPhone}?body=${encodeURIComponent(smsMessage)}`;
          setData(smsString);
        } else if (commType === 'whatsapp' && waPhone) {
          // Clean phone numbers
          const cleanPhone = waPhone.replace(/[^0-9]/g, '');
          const waString = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;
          setData(waString);
        } else {
          setData(' ');
        }
        break;
      default:
        setData(' ');
    }
  }, [
    activeTab, url, text, uploadedUrl, fileUrlType, wifiSsid, wifiPassword,
    wifiSecurity, wifiHidden, contactName, contactPhone, contactEmail,
    contactOrg, contactTitle, contactUrl, commType, emailTo, emailSubject,
    emailBody, smsPhone, smsMessage, waPhone, waMessage,
    bioTitle, bioSubtitle, bioBannerColor, bioAvatar, bioLinks, scanBaseUrl
  ]);

  // File Upload to tmpfiles.org
  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // File limit check (10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      showToast('File size exceeds the 10MB limit.');
      return;
    }

    setFile(selectedFile);
    setIsUploading(true);
    setUploadProgress(15);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Simple upload progress emulation
      const progressTimer = setInterval(() => {
        setUploadProgress(prev => (prev < 90 ? prev + 12 : prev));
      }, 200);

      const response = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressTimer);
      setUploadProgress(95);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setUploadProgress(100);
      setIsUploading(false);

      if (result.status === 'success') {
        const fileUrl = result.data.url;
        setUploadedUrl(fileUrl);
        showToast('File uploaded successfully! QR code generated.');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      setUploadProgress(0);
      setFile(null);
      showToast('Upload failed. Please check your internet and try again.');
    }
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setFile(null);
    setUploadedUrl('');
    setUploadProgress(0);
    showToast('File removed.');
  };

  // Custom Logo Upload
  const handleLogoUpload = (e) => {
    const selectedLogo = e.target.files?.[0];
    if (!selectedLogo) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomLogoUrl(event.target.result.toString());
        setLogoPreset('custom');
        showToast('Custom logo applied!');
      }
    };
    reader.readAsDataURL(selectedLogo);
  };

  // Download QR Code
  const handleDownload = async () => {
    if (!qrInstanceRef.current) return;
    
    // If format is SVG, we can serialize and download the SVG from the DOM directly
    if (downloadFormat === 'svg') {
      const qrSvg = qrRef.current.querySelector('svg');
      if (qrSvg) {
        try {
          const svgClone = qrSvg.cloneNode(true);
          const currentWidth = parseInt(svgClone.getAttribute('width')) || 280;
          const currentHeight = parseInt(svgClone.getAttribute('height')) || 280;
          
          if (qrName.trim()) {
            const padding = 16;
            const textHeight = 32;
            
            svgClone.setAttribute('width', (currentWidth + padding * 2).toString());
            svgClone.setAttribute('height', (currentHeight + padding * 2 + textHeight).toString());
            
            // Add white background rect
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('width', '100%');
            rect.setAttribute('height', '100%');
            rect.setAttribute('fill', '#ffffff');
            svgClone.insertBefore(rect, svgClone.firstChild);
            
            // Wrap original content in a <g> translated by padding
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('transform', `translate(${padding}, ${padding})`);
            
            // Move other children (except the background rect we just added) to the group
            const children = Array.from(svgClone.childNodes).slice(1);
            children.forEach(child => group.appendChild(child));
            svgClone.appendChild(group);
            
            // Add text node
            const textNode = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textNode.setAttribute('x', ((currentWidth + padding * 2) / 2).toString());
            textNode.setAttribute('y', (currentHeight + padding + 24).toString());
            textNode.setAttribute('fill', '#111827');
            textNode.setAttribute('font-family', 'Outfit, Inter, sans-serif');
            textNode.setAttribute('font-weight', 'bold');
            textNode.setAttribute('font-size', '18');
            textNode.setAttribute('text-anchor', 'middle');
            textNode.textContent = qrName.trim();
            svgClone.appendChild(textNode);
          }
          
          const svgString = new XMLSerializer().serializeToString(svgClone);
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const blobURL = (window.URL || window.webkitURL || window).createObjectURL(svgBlob);
          const link = document.createElement('a');
          link.download = `qrcadia-qr-${activeTab}.svg`;
          link.href = blobURL;
          link.click();
          (window.URL || window.webkitURL || window).revokeObjectURL(blobURL);
          showToast('QR Code downloaded as SVG!');
          return;
        } catch (err) {
          console.error('Failed composite SVG download, falling back:', err);
        }
      }
    }

    // For raster formats (PNG/JPG/WebP), we always construct a canvas from the DOM elements directly
    try {
      const qrSvgOrCanvas = qrRef.current.querySelector('svg') || qrRef.current.querySelector('canvas');
      if (!qrSvgOrCanvas) {
        showToast('QR Code is generating, please wait.');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const qrWidth = 280;
      const qrHeight = 280;
      const padding = qrName.trim() ? 16 : 0;
      const textHeight = qrName.trim() ? 32 : 0;
      
      canvas.width = qrWidth + padding * 2;
      canvas.height = qrHeight + padding * 2 + textHeight;
      
      // Draw white card background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Helper function to draw the QR image onto our canvas
      const drawQR = () => {
        return new Promise((resolve, reject) => {
          if (qrSvgOrCanvas.tagName.toLowerCase() === 'svg') {
            const svgString = new XMLSerializer().serializeToString(qrSvgOrCanvas);
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const URL = window.URL || window.webkitURL || window;
            const blobURL = URL.createObjectURL(svgBlob);
            const image = new Image();
            image.onload = () => {
              ctx.drawImage(image, padding, padding, qrWidth, qrHeight);
              URL.revokeObjectURL(blobURL);
              resolve();
            };
            image.onerror = (err) => reject(err);
            image.src = blobURL;
          } else {
            ctx.drawImage(qrSvgOrCanvas, padding, padding, qrWidth, qrHeight);
            resolve();
          }
        });
      };
      
      await drawQR();
      
      // Draw name label centered at the bottom
      if (qrName.trim()) {
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 18px Outfit, Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(qrName.trim(), canvas.width / 2, qrHeight + padding + 24);
      }
      
      // Download
      const link = document.createElement('a');
      const mimeType = downloadFormat === 'jpg' || downloadFormat === 'jpeg' ? 'image/jpeg' : 
                       downloadFormat === 'webp' ? 'image/webp' : 'image/png';
      const fileExt = downloadFormat === 'jpg' || downloadFormat === 'jpeg' ? 'jpg' : 
                      downloadFormat === 'webp' ? 'webp' : 'png';
                      
      link.download = `qrcadia-qr-${activeTab}.${fileExt}`;
      link.href = canvas.toDataURL(mimeType, 0.9);
      link.click();
      showToast(`QR Code downloaded as ${downloadFormat.toUpperCase()}!`);
    } catch (err) {
      console.error('Failed canvas download, falling back:', err);
      qrInstanceRef.current.download({
        name: `qrcadia-qr-${activeTab}`,
        extension: downloadFormat,
      });
    }
  };

  // Copy QR Image to Clipboard
  const handleCopy = async () => {
    if (!qrRef.current) return;
    
    try {
      const qrSvgOrCanvas = qrRef.current.querySelector('svg') || qrRef.current.querySelector('canvas');
      if (!qrSvgOrCanvas) {
        showToast('No preview found to copy.');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const qrWidth = 280;
      const qrHeight = 280;
      const padding = 16;
      const textHeight = qrName.trim() ? 32 : 0;
      
      canvas.width = qrWidth + padding * 2;
      canvas.height = qrHeight + padding * 2 + textHeight;
      
      // Draw white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Helper function to draw the QR image
      const drawQR = () => {
        return new Promise((resolve, reject) => {
          if (qrSvgOrCanvas.tagName.toLowerCase() === 'svg') {
            const svgString = new XMLSerializer().serializeToString(qrSvgOrCanvas);
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const URL = window.URL || window.webkitURL || window;
            const blobURL = URL.createObjectURL(svgBlob);
            const image = new Image();
            image.onload = () => {
              ctx.drawImage(image, padding, padding, qrWidth, qrHeight);
              URL.revokeObjectURL(blobURL);
              resolve();
            };
            image.onerror = (err) => reject(err);
            image.src = blobURL;
          } else {
            ctx.drawImage(qrSvgOrCanvas, padding, padding, qrWidth, qrHeight);
            resolve();
          }
        });
      };
      
      await drawQR();
      
      if (qrName.trim()) {
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 18px Outfit, Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(qrName.trim(), canvas.width / 2, qrHeight + padding + 24);
      }
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          showToast('QR Code image copied to clipboard!');
        } catch (err) {
          console.error(err);
          showToast('Direct image copy not supported in this browser.');
        }
      }, 'image/png');
    } catch (err) {
      console.error(err);
      showToast('Failed to copy QR code image.');
    }
  };

  // If opened directly from QR scan (?bio=...), render full-screen landing page view
  if (standaloneBio) {
    return (
      <BioLandingView 
        bioData={standaloneBio}
        onBackToGenerator={() => {
          window.history.pushState({}, '', window.location.pathname);
          setStandaloneBio(null);
        }}
      />
    );
  }

  return (
    <>
      {/* Background Neon Blobs */}
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      {/* Header Section */}
      <header>
        <div className="logo-container">
          <div className="logo-icon">
            <QrCode size={32} />
          </div>
          <div>
            <h1 className="logo-text">Qr Generator</h1>
          </div>
        </div>
        <p>Convert any link, image, text, document or contact info into a custom-designed QR code instantly.</p>

        {/* Header Actions: PWA Download & Theme Toggle */}
        <div className="header-actions">
          {isInstallable && (
            <button onClick={handleInstallApp} className="install-app-btn" aria-label="Download Software / App">
              <Download size={20} />
            </button>
          )}

          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Main App Layout */}
      <main>
        {/* Left Column: Input Fields & Customization */}
        <div className="left-column">
          {/* Card 1: Select Content Type */}
          <div className="dashboard-card">
            <h2 className="card-title">
              <Smartphone size={24} /> Select Content Type
            </h2>

            {/* Navigation Tabs */}
            <nav className="tabs-nav">
              <button 
                className={`tab-btn ${activeTab === 'multi-link' ? 'active' : ''}`}
                onClick={() => setActiveTab('multi-link')}
              >
                <Layers size={16} /> Multi-Link
              </button>
              <button 
                className={`tab-btn ${activeTab === 'link' ? 'active' : ''}`}
                onClick={() => setActiveTab('link')}
              >
                <Link2 size={16} /> Link
              </button>
              <button 
                className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
                onClick={() => setActiveTab('text')}
              >
                <FileText size={16} /> Text
              </button>
              <button 
                className={`tab-btn ${activeTab === 'file' ? 'active' : ''}`}
                onClick={() => setActiveTab('file')}
              >
                <FileUp size={16} /> File / Image
              </button>
              <button 
                className={`tab-btn ${activeTab === 'wifi' ? 'active' : ''}`}
                onClick={() => setActiveTab('wifi')}
              >
                <Wifi size={16} /> WiFi
              </button>
              <button 
                className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
                onClick={() => setActiveTab('contact')}
              >
                <Contact size={16} /> Contact
              </button>
              <button 
                className={`tab-btn ${activeTab === 'comm' ? 'active' : ''}`}
                onClick={() => setActiveTab('comm')}
              >
                <MessageSquare size={16} /> Messaging
              </button>
            </nav>

            {/* Tab Contents */}
            <div className="tab-content">
              {/* Multi-Link / Bio Links Tab */}
              {activeTab === 'multi-link' && (
                <div className="bio-editor-section">
                  {/* Profile Basic Info */}
                  <div className="customizer-grid">
                    <div className="input-group">
                      <label className="input-label" htmlFor="bio-title-input">Profile Title / Name</label>
                      <input 
                        id="bio-title-input"
                        type="text" 
                        className="input-control" 
                        placeholder="e.g. My Brand / Alex Morgan"
                        value={bioTitle}
                        onChange={(e) => setBioTitle(e.target.value)}
                      />
                    </div>

                    <div className="input-group">
                      <label className="input-label" htmlFor="bio-subtitle-input">Section Heading / Subtitle</label>
                      <input 
                        id="bio-subtitle-input"
                        type="text" 
                        className="input-control" 
                        placeholder="e.g. Connect with me"
                        value={bioSubtitle}
                        onChange={(e) => setBioSubtitle(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Public Target Domain for Mobile QR Scanners */}
                  <div className="input-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <label className="input-label" htmlFor="scan-domain-input" style={{ margin: 0 }}>
                        Live Mobile Scan Target URL
                      </label>
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                        🟢 Public Mobile Live
                      </span>
                    </div>
                    <input 
                      id="scan-domain-input"
                      type="url" 
                      className="input-control" 
                      value={scanBaseUrl}
                      onChange={(e) => setScanBaseUrl(e.target.value)}
                      placeholder="https://qr-generator0782.vercel.app"
                    />
                    <span className="upload-hint">
                      Phones scanning this QR code will open this live web link to display your collection of links (no localhost errors!).
                    </span>
                  </div>

                  {/* Banner Theme Color */}
                  <div className="input-group">
                    <label className="input-label">Header Banner Theme Color</label>
                    <div className="color-presets-row">
                      {BANNER_COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          className={`color-swatch-btn ${bioBannerColor === preset.color ? 'active' : ''}`}
                          style={{ backgroundColor: preset.color }}
                          title={preset.name}
                          onClick={() => setBioBannerColor(preset.color)}
                        />
                      ))}
                      <div className="color-picker-row" style={{ marginLeft: '0.5rem' }}>
                        <div className="color-input-wrapper" style={{ width: '32px', height: '32px' }}>
                          <input 
                            type="color" 
                            className="color-picker-input"
                            value={bioBannerColor}
                            onChange={(e) => setBioBannerColor(e.target.value)}
                            title="Custom Color"
                          />
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          {bioBannerColor}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Avatar / Photo */}
                  <div className="input-group">
                    <label className="input-label">Profile Avatar / Logo</label>
                    <div className="bio-avatar-uploader">
                      <div className="avatar-preview-box">
                        <SafeAvatar src={bioAvatar} size={44} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <label className="logo-upload-btn" style={{ margin: 0, padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                            <input 
                              type="file" 
                              style={{ display: 'none' }} 
                              onChange={handleAvatarUpload} 
                              accept="image/*"
                            />
                            <Plus size={14} /> Upload Profile Image
                          </label>
                          {bioAvatar && (
                            <button 
                              type="button" 
                              onClick={handleResetAvatar}
                              className="btn-icon-sm"
                              title="Remove custom profile image"
                              style={{ width: 'auto', padding: '0 0.6rem', fontSize: '0.78rem' }}
                            >
                              Remove Image
                            </button>
                          )}
                        </div>
                        <span className="upload-hint">Upload any profile photo or logo. Auto-optimized for QR codes.</span>
                      </div>
                    </div>
                  </div>

                  {/* Links List Header & Quick Add */}
                  <div className="input-group" style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <label className="input-label" style={{ margin: 0 }}>
                        Your Links ({bioLinks.length})
                      </label>
                      <button 
                        type="button" 
                        onClick={() => handleAddLink('web')}
                        className="tab-btn active"
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', margin: 0 }}
                      >
                        <Plus size={14} /> Add Link
                      </button>
                    </div>

                    {/* Quick Add Presets */}
                    <div className="quick-add-row">
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Add:</span>
                      <button type="button" className="quick-add-pill" onClick={() => handleAddLink('web')}>
                        <SocialIcon type="web" size={14} /> Web
                      </button>
                      <button type="button" className="quick-add-pill" onClick={() => handleAddLink('facebook')}>
                        <SocialIcon type="facebook" size={14} /> Facebook
                      </button>
                      <button type="button" className="quick-add-pill" onClick={() => handleAddLink('instagram')}>
                        <SocialIcon type="instagram" size={14} /> Instagram
                      </button>
                      <button type="button" className="quick-add-pill" onClick={() => handleAddLink('youtube')}>
                        <SocialIcon type="youtube" size={14} /> YouTube
                      </button>
                      <button type="button" className="quick-add-pill" onClick={() => handleAddLink('whatsapp')}>
                        <SocialIcon type="whatsapp" size={14} /> WhatsApp
                      </button>
                      <button type="button" className="quick-add-pill" onClick={() => handleAddLink('custom')}>
                        <Plus size={14} /> Custom
                      </button>
                    </div>

                    {/* Links List Cards */}
                    <div className="link-items-list">
                      {bioLinks.map((link, index) => (
                        <div key={link.id || index} className="link-editor-item">
                          <div className="link-item-header">
                            <div className="link-item-badge">
                              <SocialIcon type={link.icon} customUrl={link.customIcon} size={22} />
                              <span>Link #{index + 1} — {link.title || 'Untitled'}</span>
                            </div>
                            <div className="link-item-actions">
                              <button 
                                type="button" 
                                onClick={() => handleMoveLink(index, -1)} 
                                disabled={index === 0}
                                className="btn-icon-sm"
                                title="Move Up"
                              >
                                <ArrowUp size={14} />
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleMoveLink(index, 1)} 
                                disabled={index === bioLinks.length - 1}
                                className="btn-icon-sm"
                                title="Move Down"
                              >
                                <ArrowDown size={14} />
                              </button>
                              <button 
                                type="button" 
                                onClick={() => handleRemoveLink(index)} 
                                className="btn-icon-sm delete"
                                title="Delete Link"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          {/* Famous Logo Presets Selector */}
                          <div>
                            <span className="input-label" style={{ fontSize: '0.72rem', display: 'block', marginBottom: '0.35rem' }}>
                              Select Logo Preset or Upload Custom Logo:
                            </span>
                            <div className="preset-icons-grid">
                              {SOCIAL_PRESETS.map((preset) => (
                                <button
                                  key={preset.id}
                                  type="button"
                                  className={`preset-icon-chip ${link.icon === preset.id ? 'active' : ''}`}
                                  onClick={() => handleSelectPresetForLink(index, preset.id)}
                                >
                                  <SocialIcon type={preset.id} size={15} />
                                  <span>{preset.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Custom Logo Upload if chosen or desired */}
                          {link.icon === 'custom' && (
                            <div className="custom-logo-upload-box">
                              {link.customIcon ? (
                                <img src={link.customIcon} alt="Custom logo preview" className="custom-logo-thumb" />
                              ) : (
                                <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Plus size={16} />
                                </div>
                              )}
                              <div style={{ flex: 1 }}>
                                <label className="logo-upload-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', width: 'fit-content' }}>
                                  <input 
                                    type="file" 
                                    style={{ display: 'none' }} 
                                    onChange={(e) => handleCustomLogoForLink(index, e.target.files?.[0])} 
                                    accept="image/*"
                                  />
                                  <Plus size={14} /> {link.customIcon ? 'Change Logo Image' : 'Import Any Logo Image'}
                                </label>
                                <span className="upload-hint" style={{ display: 'block', marginTop: '0.2rem' }}>
                                  Supports PNG, JPG, SVG, WebP
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Link Label & Destination URL */}
                          <div className="customizer-grid" style={{ gap: '0.75rem' }}>
                            <div className="input-group" style={{ margin: 0 }}>
                              <label className="input-label" style={{ fontSize: '0.75rem' }}>Link Label / Text</label>
                              <input 
                                type="text" 
                                className="input-control" 
                                placeholder="e.g. Facebook, Web, Instagram"
                                value={link.title}
                                onChange={(e) => handleUpdateLink(index, 'title', e.target.value)}
                              />
                            </div>
                            <div className="input-group" style={{ margin: 0 }}>
                              <label className="input-label" style={{ fontSize: '0.75rem' }}>Target URL Address</label>
                              <input 
                                type="text" 
                                className="input-control" 
                                placeholder="https://example.com/..."
                                value={link.url}
                                onChange={(e) => handleUpdateLink(index, 'url', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      type="button" 
                      onClick={() => handleAddLink('web')}
                      className="btn-add-link"
                    >
                      <Plus size={18} /> Add Another Link
                    </button>

                    <div className="upload-hint mt-2" style={{ 
                      padding: '0.75rem', 
                      borderRadius: 'var(--radius-md)', 
                      background: 'rgba(0, 242, 254, 0.05)', 
                      border: '1px dashed rgba(0, 242, 254, 0.25)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8rem',
                      lineHeight: '1.4'
                    }}>
                      🟢 <strong>Single QR Code For Multiple Links:</strong> All your links and logos are stored in a universal mobile landing page. Anyone scanning the QR code with their camera instantly sees your customized link page!
                    </div>
                  </div>
                </div>
              )}

              {/* URL Link Tab */}
              {activeTab === 'link' && (
                <div className="input-group">
                  <label className="input-label" htmlFor="url-input">Target URL Link</label>
                  <input 
                    id="url-input"
                    type="url" 
                    className="input-control" 
                    placeholder="https://example.com/some-page"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <span className="upload-hint">Ensure links start with http:// or https://</span>

                  <div className="upload-hint mt-2" style={{ 
                    padding: '0.75rem', 
                    borderRadius: 'var(--radius-md)', 
                    background: 'rgba(0, 242, 254, 0.05)', 
                    border: '1px dashed rgba(0, 242, 254, 0.25)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    lineHeight: '1.4'
                  }}>
                    🟢 <strong>Lifetime Validity:</strong> Direct link QR codes are static. They never expire and will work forever!
                  </div>
                </div>
              )}

              {/* Plain Text Tab */}
              {activeTab === 'text' && (
                <div className="input-group">
                  <label className="input-label" htmlFor="text-input">Plain Text / Message</label>
                  <textarea 
                    id="text-input"
                    className="input-control" 
                    placeholder="Type anything here... Standard notes, instructions, text snippets, etc."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>
              )}

              {/* File & Image Upload Tab */}
              {activeTab === 'file' && (
                <div className="flex-col gap-4">
                  {!file ? (
                    <label className="file-upload-zone">
                      <input 
                        type="file" 
                        style={{ display: 'none' }} 
                        onChange={handleFileUpload} 
                        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,audio/*"
                      />
                      <div className="upload-icon-wrapper">
                        <FileUp size={36} />
                      </div>
                      <span className="upload-text">Upload Image, PDF, Excel or Document</span>
                      <span className="upload-hint">Drag & drop or click to upload. Max size: 10MB</span>
                    </label>
                  ) : (
                    <div className="file-info-box">
                      <div className="file-info-details">
                        <ImageIcon size={20} className="text-accent-cyan" />
                        <div>
                          <div className="file-name" title={file.name}>{file.name}</div>
                          <div className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                      </div>
                      {!isUploading && (
                        <button onClick={handleRemoveFile} className="file-remove-btn" aria-label="Remove uploaded file">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Progress bar */}
                  {isUploading && (
                    <div className="flex-col gap-2 mt-4">
                      <div className="upload-hint text-center">Uploading and generating QR code ({uploadProgress}%)</div>
                      <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  {uploadedUrl && (
                    <div className="input-group mt-4">
                      <label className="input-label" htmlFor="file-link-type">QR Scanning Access Mode</label>
                      <select 
                        id="file-link-type"
                        className="input-control" 
                        value={fileUrlType}
                        onChange={(e) => setFileUrlType(e.target.value)}
                      >
                        <option value="direct">Direct File (Opens original file immediately when scanned)</option>
                        <option value="landing">Download Page (Shows a beautiful Web page to download the file)</option>
                      </select>
                      <div className="flex gap-2 mt-4" style={{ alignItems: 'center' }}>
                        <span className="upload-hint" style={{ color: 'var(--accent-cyan)' }}>
                          <ExternalLink size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          Hosted link: 
                        </span>
                        <a href={uploadedUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                          {uploadedUrl.substring(0, 45)}...
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="upload-hint mt-4" style={{ 
                    padding: '0.75rem', 
                    borderRadius: 'var(--radius-md)', 
                    background: 'rgba(239, 68, 68, 0.08)', 
                    border: '1px dashed rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    fontSize: '0.8rem',
                    lineHeight: '1.4'
                  }}>
                    ⚠️ <strong>Lifetime Validity Note:</strong> Files uploaded here anonymously expire after 60 minutes. For permanent lifetime QR codes, upload your document to Google Drive, Dropbox, or OneDrive and paste the sharing link into the <strong>Link</strong> tab instead!
                  </div>
                </div>
              )}

              {/* WiFi Credentials Tab */}
              {activeTab === 'wifi' && (
                <div className="flex-col gap-4">
                  <div className="input-group">
                    <label className="input-label" htmlFor="wifi-ssid">Network Name (SSID)</label>
                    <input 
                      id="wifi-ssid"
                      type="text" 
                      className="input-control" 
                      placeholder="My WiFi Network"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                    />
                  </div>
                  <div className="customizer-grid">
                    <div className="input-group">
                      <label className="input-label" htmlFor="wifi-password">Security Password</label>
                      <input 
                        id="wifi-password"
                        type="password" 
                        className="input-control" 
                        placeholder="WPA Password"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        disabled={wifiSecurity === 'None'}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label" htmlFor="wifi-security">Security Type</label>
                      <select 
                        id="wifi-security"
                        className="input-control" 
                        value={wifiSecurity}
                        onChange={(e) => setWifiSecurity(e.target.value)}
                      >
                        <option value="WPA">WPA / WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="None">None (Unsecured)</option>
                      </select>
                    </div>
                  </div>
                  <label className="flex gap-2" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input 
                      type="checkbox" 
                      checked={wifiHidden} 
                      onChange={(e) => setWifiHidden(e.target.checked)} 
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <span>This is a hidden network</span>
                  </label>
                </div>
              )}

              {/* Contact vCard Tab */}
              {activeTab === 'contact' && (
                <div className="flex-col gap-4">
                  <div className="customizer-grid">
                    <div className="input-group">
                      <label className="input-label" htmlFor="contact-name">Full Name</label>
                      <input 
                        id="contact-name"
                        type="text" 
                        className="input-control" 
                        placeholder="Jane Doe"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label" htmlFor="contact-phone">Phone Number</label>
                      <input 
                        id="contact-phone"
                        type="tel" 
                        className="input-control" 
                        placeholder="+1 (555) 000-0000"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="customizer-grid">
                    <div className="input-group">
                      <label className="input-label" htmlFor="contact-email">Email Address</label>
                      <input 
                        id="contact-email"
                        type="email" 
                        className="input-control" 
                        placeholder="jane@company.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label" htmlFor="contact-url">Website URL</label>
                      <input 
                        id="contact-url"
                        type="url" 
                        className="input-control" 
                        placeholder="https://company.com"
                        value={contactUrl}
                        onChange={(e) => setContactUrl(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="customizer-grid">
                    <div className="input-group">
                      <label className="input-label" htmlFor="contact-org">Organization</label>
                      <input 
                        id="contact-org"
                        type="text" 
                        className="input-control" 
                        placeholder="Company Inc."
                        value={contactOrg}
                        onChange={(e) => setContactOrg(e.target.value)}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label" htmlFor="contact-title">Job Title</label>
                      <input 
                        id="contact-title"
                        type="text" 
                        className="input-control" 
                        placeholder="Product Manager"
                        value={contactTitle}
                        onChange={(e) => setContactTitle(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Communication Tab */}
              {activeTab === 'comm' && (
                <div className="flex-col gap-4">
                  <div className="input-group">
                    <label className="input-label" htmlFor="comm-type">Message Channel</label>
                    <select 
                      id="comm-type"
                      className="input-control"
                      value={commType}
                      onChange={(e) => setCommType(e.target.value)}
                    >
                      <option value="email">Email Template</option>
                      <option value="sms">SMS Text Message</option>
                      <option value="whatsapp">WhatsApp Direct Link</option>
                    </select>
                  </div>

                  {commType === 'email' && (
                    <div className="flex-col gap-4">
                      <div className="input-group">
                        <label className="input-label" htmlFor="email-to">Recipient Email Address</label>
                        <input 
                          id="email-to"
                          type="email" 
                          className="input-control" 
                          placeholder="hello@company.com"
                          value={emailTo}
                          onChange={(e) => setEmailTo(e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label" htmlFor="email-subject">Subject Line</label>
                        <input 
                          id="email-subject"
                          type="text" 
                          className="input-control" 
                          placeholder="Inquiry about services"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label" htmlFor="email-body">Email Message Body</label>
                        <textarea 
                          id="email-body"
                          className="input-control" 
                          placeholder="Hi, I would like to get more information..."
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {commType === 'sms' && (
                    <div className="flex-col gap-4">
                      <div className="input-group">
                        <label className="input-label" htmlFor="sms-phone">Phone Number (with Country Code)</label>
                        <input 
                          id="sms-phone"
                          type="tel" 
                          className="input-control" 
                          placeholder="+15551234567"
                          value={smsPhone}
                          onChange={(e) => setSmsPhone(e.target.value)}
                        />
                      </div>
                      <div className="input-group">
                        <label className="input-label" htmlFor="sms-message">Predefined Text Message</label>
                        <textarea 
                          id="sms-message"
                          className="input-control" 
                          placeholder="Send this text..."
                          value={smsMessage}
                          onChange={(e) => setSmsMessage(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {commType === 'whatsapp' && (
                    <div className="flex-col gap-4">
                      <div className="input-group">
                        <label className="input-label" htmlFor="wa-phone">WhatsApp Number (with Country Code, digits only)</label>
                        <input 
                          id="wa-phone"
                          type="tel" 
                          className="input-control" 
                          placeholder="15551234567"
                          value={waPhone}
                          onChange={(e) => setWaPhone(e.target.value)}
                        />
                        <span className="upload-hint">Do not include +, spaces or hyphens. Example: 919876543210</span>
                      </div>
                      <div className="input-group">
                        <label className="input-label" htmlFor="wa-message">WhatsApp Message Text</label>
                        <textarea 
                          id="wa-message"
                          className="input-control" 
                          placeholder="Hello! I would like to chat."
                          value={waMessage}
                          onChange={(e) => setWaMessage(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Styling and Customization Options */}
          <div className="dashboard-card">
            <h2 className="card-title">
              <Sparkles size={24} /> QR Studio & Styling
            </h2>

            {/* Style Designer Settings */}
            <div className="customizer-section" style={{ borderTop: 'none', marginTop: 0, paddingTop: 0 }}>
              <h3 className="input-label mb-2">QR Visual Style</h3>
              <div className="customizer-grid">
                {/* Pattern options */}
                <div className="input-group">
                  <label className="input-label" htmlFor="dots-type">Pattern Shapes</label>
                  <select 
                    id="dots-type"
                    className="input-control"
                    value={dotsType}
                    onChange={(e) => setDotsType(e.target.value)}
                  >
                    <option value="rounded">Smooth Rounded</option>
                    <option value="extra-rounded">Extra Circular</option>
                    <option value="dots">Dotted Matrix</option>
                    <option value="classy">Refined Curved</option>
                    <option value="classy-rounded">Curved & Rounded</option>
                    <option value="square">Standard Square</option>
                  </select>
                </div>

                {/* Download format selector */}
                <div className="input-group">
                  <label className="input-label" htmlFor="download-format">Export Format</label>
                  <select 
                    id="download-format"
                    className="input-control"
                    value={downloadFormat}
                    onChange={(e) => setDownloadFormat(e.target.value)}
                  >
                    <option value="png">PNG (Bitmap)</option>
                    <option value="svg">SVG (Vector Code)</option>
                  </select>
                </div>
              </div>

              {/* Colors and Gradients */}
              <div className="customizer-grid mt-4">
                <div className="input-group">
                  <label className="input-label" htmlFor="dots-color">Pattern Gradient Start</label>
                  <div className="color-picker-row">
                    <div className="color-input-wrapper">
                      <input 
                        id="dots-color"
                        type="color" 
                        className="color-picker-input"
                        value={dotsColor}
                        onChange={(e) => setDotsColor(e.target.value)}
                      />
                    </div>
                    <input 
                      type="text" 
                      className="input-control" 
                      value={dotsColor} 
                      onChange={(e) => setDotsColor(e.target.value)}
                      aria-label="Gradient Start Hex"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="dots-color-2">Pattern Gradient End</label>
                  <div className="color-picker-row">
                    <div className="color-input-wrapper">
                      <input 
                        id="dots-color-2"
                        type="color" 
                        className="color-picker-input"
                        value={dotsColor2}
                        onChange={(e) => setDotsColor2(e.target.value)}
                        disabled={!dotsGradient}
                      />
                    </div>
                    <input 
                      type="text" 
                      className="input-control" 
                      value={dotsColor2} 
                      onChange={(e) => setDotsColor2(e.target.value)}
                      disabled={!dotsGradient}
                      aria-label="Gradient End Hex"
                    />
                  </div>
                </div>
              </div>

              <div className="customizer-grid mt-4">
                <label className="flex gap-2" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input 
                    type="checkbox" 
                    checked={dotsGradient} 
                    onChange={(e) => setDotsGradient(e.target.checked)} 
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <span>Enable Multi-Color Gradient</span>
                </label>

                {dotsGradient && (
                  <div className="input-group">
                    <label className="input-label" htmlFor="gradient-angle">Gradient Angle ({gradientAngle}°)</label>
                    <input 
                      id="gradient-angle"
                      type="range" 
                      min="0" 
                      max="360" 
                      className="input-control"
                      style={{ padding: '0', cursor: 'pointer' }}
                      value={gradientAngle}
                      onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                    />
                  </div>
                )}
              </div>

              {/* Background color */}
              <div className="customizer-grid mt-4">
                <div className="input-group">
                  <label className="input-label" htmlFor="bg-color">QR Background Color</label>
                  <div className="color-picker-row">
                    <div className="color-input-wrapper">
                      <input 
                        id="bg-color"
                        type="color" 
                        className="color-picker-input"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                      />
                    </div>
                    <input 
                      type="text" 
                      className="input-control" 
                      value={bgColor} 
                      onChange={(e) => setBgColor(e.target.value)}
                      aria-label="Background Color Hex"
                    />
                  </div>
                </div>

                {/* Error correction */}
                <div className="input-group">
                  <label className="input-label" htmlFor="error-correction">Error Correction Level</label>
                  <select 
                    id="error-correction"
                    className="input-control"
                    value={errorCorrectionLevel}
                    onChange={(e) => setErrorCorrectionLevel(e.target.value)}
                  >
                    <option value="L">L (7% recovery - cleanest look)</option>
                    <option value="M">M (15% recovery)</option>
                    <option value="Q">Q (25% recovery - recommended for logos)</option>
                    <option value="H">H (30% recovery - highest durability)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Corner Squares Customization */}
            <div className="customizer-section">
              <h3 className="input-label mb-2">Corner Eyes Customization</h3>
              <div className="customizer-grid">
                <div className="input-group">
                  <label className="input-label" htmlFor="eye-square-type">Outer Frame Shape</label>
                  <select 
                    id="eye-square-type"
                    className="input-control"
                    value={eyeSquareType}
                    onChange={(e) => setEyeSquareType(e.target.value)}
                  >
                    <option value="square">Standard Square</option>
                    <option value="dot">Rounded Ring</option>
                    <option value="extra-rounded">Sleek Circular Ring</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="eye-square-color">Outer Frame Color</label>
                  <div className="color-picker-row">
                    <div className="color-input-wrapper">
                      <input 
                        id="eye-square-color"
                        type="color" 
                        className="color-picker-input"
                        value={eyeSquareColor}
                        onChange={(e) => setEyeSquareColor(e.target.value)}
                      />
                    </div>
                    <input 
                      type="text" 
                      className="input-control" 
                      value={eyeSquareColor} 
                      onChange={(e) => setEyeSquareColor(e.target.value)}
                      aria-label="Outer Frame Color Hex"
                    />
                  </div>
                </div>
              </div>

              <div className="customizer-grid mt-4">
                <div className="input-group">
                  <label className="input-label" htmlFor="eye-dot-type">Inner Pupil Shape</label>
                  <select 
                    id="eye-dot-type"
                    className="input-control"
                    value={eyeDotType}
                    onChange={(e) => setEyeDotType(e.target.value)}
                  >
                    <option value="square">Square Pupil</option>
                    <option value="dot">Circular Pupil</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="eye-dot-color">Inner Pupil Color</label>
                  <div className="color-picker-row">
                    <div className="color-input-wrapper">
                      <input 
                        id="eye-dot-color"
                        type="color" 
                        className="color-picker-input"
                        value={eyeDotColor}
                        onChange={(e) => setEyeDotColor(e.target.value)}
                      />
                    </div>
                    <input 
                      type="text" 
                      className="input-control" 
                      value={eyeDotColor} 
                      onChange={(e) => setEyeDotColor(e.target.value)}
                      aria-label="Inner Pupil Color Hex"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Brand Overlay */}
            <div className="customizer-section">
              <h3 className="input-label mb-2">Branding Center Logo</h3>
              <div className="input-group">
                <label className="input-label">Select Brand Logo</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {PRESET_LOGOS.map((logo) => (
                    <button
                      key={logo.name}
                      type="button"
                      className={`tab-btn ${logoPreset === logo.name ? 'active' : ''}`}
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                      onClick={() => setLogoPreset(logo.name)}
                    >
                      {logo.label}
                    </button>
                  ))}
                  
                  <label className="logo-upload-btn" style={{ margin: 0, padding: '0.4rem 0.8rem', fontSize: '0.8rem', height: 'auto' }}>
                    <input 
                      type="file" 
                      style={{ display: 'none' }} 
                      onChange={handleLogoUpload} 
                      accept="image/*"
                    />
                    <Plus size={14} /> Custom Image
                  </label>
                </div>
              </div>

              {logoPreset !== 'none' && (
                <div className="customizer-grid mt-4">
                  <div className="input-group">
                    <label className="input-label" htmlFor="logo-size">Logo Scale Size ({Math.round(logoSize * 100)}%)</label>
                    <input 
                      id="logo-size"
                      type="range" 
                      min="0.1" 
                      max="0.4" 
                      step="0.05"
                      className="input-control"
                      style={{ padding: '0', cursor: 'pointer' }}
                      value={logoSize}
                      onChange={(e) => setLogoSize(parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="logo-margin">Logo Safety Margin ({logoMargin}px)</label>
                    <input 
                      id="logo-margin"
                      type="range" 
                      min="0" 
                      max="20" 
                      className="input-control"
                      style={{ padding: '0', cursor: 'pointer' }}
                      value={logoMargin}
                      onChange={(e) => setLogoMargin(parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky QR or Mobile Mockup Preview */}
        <div className="right-column">
          <div className="dashboard-card">
            <h2 className="card-title">
              {activeTab === 'multi-link' && previewMode === 'mockup' ? (
                <>
                  <Smartphone size={24} /> Mobile Live Preview
                </>
              ) : (
                <>
                  <QrCode size={24} /> QR Live Preview
                </>
              )}
            </h2>

            {/* If Multi-Link, show Preview Switcher */}
            {activeTab === 'multi-link' && (
              <div className="preview-tabs">
                <button 
                  type="button"
                  className={`preview-tab-btn ${previewMode === 'mockup' ? 'active' : ''}`}
                  onClick={() => setPreviewMode('mockup')}
                >
                  <Smartphone size={16} /> Mobile Preview
                </button>
                <button 
                  type="button"
                  className={`preview-tab-btn ${previewMode === 'qr' ? 'active' : ''}`}
                  onClick={() => setPreviewMode('qr')}
                >
                  <QrCode size={16} /> QR Code
                </button>
              </div>
            )}

            {/* Mobile Phone Mockup View */}
            <div 
              style={{ 
                display: (activeTab === 'multi-link' && previewMode === 'mockup') ? 'flex' : 'none', 
                flexDirection: 'column', 
                width: '100%', 
                gap: '0.75rem' 
              }}
            >
              <BioMobilePreview 
                bioData={{
                  title: bioTitle,
                  subtitle: bioSubtitle,
                  bannerColor: bioBannerColor,
                  avatar: bioAvatar,
                  links: bioLinks
                }} 
                isInteractive={true}
              />

              <button 
                type="button"
                className="btn-primary" 
                style={{ width: '100%', marginTop: '0.25rem' }}
                onClick={() => setPreviewMode('qr')}
              >
                <QrCode size={16} /> View & Download QR Code
              </button>
            </div>

            {/* QR Code Canvas Display View */}
            <div 
              style={{ 
                display: (activeTab !== 'multi-link' || previewMode === 'qr') ? 'block' : 'none', 
                width: '100%' 
              }}
            >
              <div className="preview-container">
                <div 
                  className="qr-canvas-wrapper" 
                  style={{ display: (data && data.trim() !== '') ? 'flex' : 'none' }}
                >
                  <div ref={qrRef} />
                  {qrName.trim() && (
                    <div className="qr-label-text">
                      {qrName.trim()}
                    </div>
                  )}
                </div>
                {(!data || data.trim() === '') && (
                  <div className="qr-placeholder">
                    <div className="qr-spinner"></div>
                    <p>Waiting for you to enter content above to generate the QR code...</p>
                  </div>
                )}
              </div>

              {/* Name Label Input */}
              <div className="input-group mt-4" style={{ width: '100%' }}>
                <label className="input-label" htmlFor="qr-label-input">QR Code Name / Label</label>
                <input 
                  id="qr-label-input"
                  type="text" 
                  className="input-control" 
                  placeholder="e.g. Scan Me, Wifi Network, Website"
                  value={qrName}
                  onChange={(e) => setQrName(e.target.value)}
                />
              </div>

              {/* Download Format Select */}
              <div className="input-group mt-4" style={{ width: '100%' }}>
                <label className="input-label" htmlFor="download-format-select">Download Format</label>
                <select 
                  id="download-format-select"
                  className="input-control" 
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value)}
                >
                  <option value="png">PNG (Portable Network Graphics)</option>
                  <option value="jpg">JPG (Joint Photographic Group)</option>
                  <option value="svg">SVG (Scalable Vector Graphics)</option>
                  <option value="webp">WebP (Modern Web Image)</option>
                </select>
              </div>

              {/* Copy and Download Buttons */}
              <div className="btn-row">
                <button className="btn-secondary" onClick={handleCopy} disabled={!data || data.trim() === ''}>
                  <Copy size={18} /> Copy Image
                </button>
                <button className="btn-primary" onClick={handleDownload} disabled={!data || data.trim() === ''}>
                  <Download size={18} /> Save / Download
                </button>
              </div>

              {activeTab === 'multi-link' && (
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ marginTop: '0.75rem', width: '100%' }}
                  onClick={() => setPreviewMode('mockup')}
                >
                  <Smartphone size={16} /> Switch to Phone Preview
                </button>
              )}
            </div>

            <button className="btn-reset" onClick={handleReset} style={{ marginTop: '1rem', width: '100%' }}>
              <RotateCcw size={18} /> Restart / Clear All
            </button>
          </div>
        </div>
      </main>

      {/* Toast popup alerts */}
      {toast.show && (
        <div className="toast">
          <CheckCircle2 size={18} className="text-accent-cyan" style={{ color: 'var(--accent-cyan)' }} />
          <span>{toast.message}</span>
        </div>
      )}
      

      {/* Footer Section */}
      <footer>
        <p>Developed by Anshuman Sarkar.</p>
      </footer>
    </>
  );
}

export default App;
