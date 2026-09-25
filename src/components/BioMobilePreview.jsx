import React from 'react';
import { SocialIcon, SafeAvatar } from './SocialIcons';
import { ArrowRight, Wifi, Battery } from 'lucide-react';

export const BioMobilePreview = ({ bioData, isInteractive = false }) => {
  const {
    title = '',
    subtitle = '',
    bannerColor = '#3866d1',
    avatar = '',
    links = []
  } = bioData || {};

  const handleLinkClick = (e, url) => {
    if (!isInteractive) {
      // In editor preview, clicking will just alert or open if valid
      if (!url) {
        e.preventDefault();
      }
    }
  };

  return (
    <div className="phone-mockup-wrapper">
      {/* Smartphone Outer Chassis */}
      <div className="phone-mockup">
        {/* Dynamic Island / Notch */}
        <div className="phone-notch-container">
          <div className="phone-notch">
            <div className="notch-camera"></div>
            <div className="notch-sensor"></div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="phone-status-bar">
          <span className="status-time">9:41</span>
          <div className="status-icons">
            <Wifi size={13} strokeWidth={2.5} />
            <div className="signal-bars">
              <span></span><span></span><span></span><span></span>
            </div>
            <Battery size={15} strokeWidth={2.5} />
          </div>
        </div>

        {/* Screen Scrollable Viewport */}
        <div className="phone-screen-content">
          {/* Top Banner */}
          <div 
            className="bio-banner"
            style={{ 
              backgroundColor: bannerColor || '#3866d1',
              background: `linear-gradient(180deg, ${bannerColor} 0%, ${bannerColor} 85%, rgba(255,255,255,0) 100%)`
            }}
          ></div>

          {/* White Content Container Overlapping the Banner with Smooth Curve */}
          <div className="bio-card-body">
            {/* Center Profile Badge overlapping */}
            <div className="bio-avatar-wrapper">
              <div className="bio-avatar-container">
                <SafeAvatar src={avatar} size={66} className="bio-avatar-img" />
              </div>
            </div>

            {/* Profile Title */}
            <h1 className="bio-title">{title || 'My Links'}</h1>

            {/* Subtitle / Section Heading */}
            {subtitle && <p className="bio-subtitle">{subtitle}</p>}

            {/* List of Links */}
            <div className="bio-links-list">
              {links && links.length > 0 ? (
                links.map((link, index) => {
                  const href = link.url ? (link.url.startsWith('http') || link.url.startsWith('mailto:') || link.url.startsWith('tel:') ? link.url : `https://${link.url}`) : '#';
                  return (
                    <a
                      key={link.id || index}
                      href={href}
                      target={isInteractive ? '_blank' : '_blank'}
                      rel="noopener noreferrer"
                      className="bio-link-card"
                      onClick={(e) => handleLinkClick(e, link.url)}
                      title={link.url || 'Empty link'}
                    >
                      <div className="bio-link-icon-wrapper">
                        <SocialIcon 
                          type={link.icon} 
                          customUrl={link.customIcon} 
                          size={38} 
                        />
                      </div>
                      <span className="bio-link-label">
                        {link.title || link.icon || 'Link'}
                      </span>
                      <div className="bio-link-arrow">
                        <ArrowRight size={18} strokeWidth={2} />
                      </div>
                    </a>
                  );
                })
              ) : (
                <div className="bio-empty-links">
                  <p>No links added yet.</p>
                  <span>Add multiple links using the editor on the left!</span>
                </div>
              )}
            </div>

            {/* Clean subtle footer in mobile preview */}
            <div className="bio-mockup-footer">
              <span className="bio-footer-badge">
                Powered by <strong>Qr Generator</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
