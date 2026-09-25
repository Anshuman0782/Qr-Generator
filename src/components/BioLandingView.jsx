import React, { useState } from 'react';
import { SocialIcon, SafeAvatar } from './SocialIcons';
import { ArrowRight, Share2, Check, QrCode, Sparkles } from 'lucide-react';

export const BioLandingView = ({ bioData, onBackToGenerator }) => {
  const [copied, setCopied] = useState(false);

  const {
    title = '',
    subtitle = '',
    bannerColor = '#3866d1',
    avatar = '',
    links = []
  } = bioData || {};

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Links',
          text: `Check out ${title}'s links!`,
          url: url
        });
        return;
      } catch {
        // Fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore
    }
  };

  return (
    <div className="bio-landing-page-root">
      {/* Top action bar */}
      <nav className="bio-landing-topbar">
        <button 
          onClick={onBackToGenerator} 
          className="bio-landing-back-btn"
          title="Open QR Generator Studio"
        >
          <QrCode size={18} />
          <span>QR Studio</span>
        </button>

        <button 
          onClick={handleShare} 
          className="bio-landing-share-btn"
          title="Share this page"
        >
          {copied ? (
            <>
              <Check size={16} className="text-green-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Share2 size={16} />
              <span>Share</span>
            </>
          )}
        </button>
      </nav>

      {/* Main Centered Mobile-Format Card Container */}
      <div className="bio-landing-card-container">
        {/* Banner with customizable color */}
        <div 
          className="bio-landing-banner"
          style={{ 
            backgroundColor: bannerColor || '#3866d1',
            background: `linear-gradient(180deg, ${bannerColor} 0%, ${bannerColor} 85%, rgba(255,255,255,0) 100%)`
          }}
        ></div>

        {/* Card Body */}
        <div className="bio-landing-body">
          {/* Avatar / Badge */}
          <div className="bio-landing-avatar-wrapper">
            <div className="bio-landing-avatar-container">
              <SafeAvatar src={avatar} size={74} className="bio-landing-avatar-img" />
            </div>
          </div>

          {/* Profile Name */}
          <h1 className="bio-landing-title">{title || 'My Links'}</h1>

          {/* Section heading / subtitle */}
          {subtitle && (
            <h2 className="bio-landing-subtitle">{subtitle}</h2>
          )}

          {/* Links List */}
          <div className="bio-landing-links">
            {links && links.length > 0 ? (
              links.map((link, index) => {
                const href = link.url ? (link.url.startsWith('http') || link.url.startsWith('mailto:') || link.url.startsWith('tel:') ? link.url : `https://${link.url}`) : '#';
                return (
                  <a
                    key={link.id || index}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bio-landing-link-card"
                  >
                    <div className="bio-landing-link-icon">
                      <SocialIcon 
                        type={link.icon} 
                        customUrl={link.customIcon} 
                        size={40} 
                      />
                    </div>
                    <span className="bio-landing-link-text">
                      {link.title || link.icon || 'Link'}
                    </span>
                    <div className="bio-landing-link-arrow">
                      <ArrowRight size={20} strokeWidth={2} />
                    </div>
                  </a>
                );
              })
            ) : (
              <p className="bio-landing-empty">No links available</p>
            )}
          </div>

          {/* Bottom Call to Action for visitors */}
          <div className="bio-landing-cta">
            <div className="bio-landing-cta-content">
              <Sparkles size={16} className="bio-cta-icon" />
              <span>Want your own Multi-Link QR Code?</span>
            </div>
            <button onClick={onBackToGenerator} className="bio-landing-cta-btn">
              Create Free QR Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
