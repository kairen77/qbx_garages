import React from 'react';

export default function FlagIcon({ code, width = 20, height = 14, className = '' }) {
  const normCode = (code || '').toLowerCase();

  switch (normCode) {
    case 'en':
    case 'us':
      return (
        <svg viewBox="0 0 60 40" width={width} height={height} className={`flag-svg ${className}`}>
          <defs>
            <clipPath id="us-clip">
              <rect width="60" height="40" rx="2" />
            </clipPath>
          </defs>
          <g clipPath="url(#us-clip)">
            
            <rect width="60" height="40" fill="#FFFFFF" />
            
            <rect y="0" width="60" height="3.08" fill="#B22234" />
            <rect y="6.15" width="60" height="3.08" fill="#B22234" />
            <rect y="12.31" width="60" height="3.08" fill="#B22234" />
            <rect y="18.46" width="60" height="3.08" fill="#B22234" />
            <rect y="24.62" width="60" height="3.08" fill="#B22234" />
            <rect y="30.77" width="60" height="3.08" fill="#B22234" />
            <rect y="36.92" width="60" height="3.08" fill="#B22234" />

            <rect width="25" height="21.54" fill="#3C3B6E" />

            <g fill="#FFFFFF" transform="scale(0.8) translate(1.5, 1.2)">
              <circle cx="4" cy="4" r="1.1" />
              <circle cx="10" cy="4" r="1.1" />
              <circle cx="16" cy="4" r="1.1" />
              <circle cx="22" cy="4" r="1.1" />
              <circle cx="28" cy="4" r="1.1" />

              <circle cx="7" cy="9" r="1.1" />
              <circle cx="13" cy="9" r="1.1" />
              <circle cx="19" cy="9" r="1.1" />
              <circle cx="25" cy="9" r="1.1" />

              <circle cx="4" cy="14" r="1.1" />
              <circle cx="10" cy="14" r="1.1" />
              <circle cx="16" cy="14" r="1.1" />
              <circle cx="22" cy="14" r="1.1" />
              <circle cx="28" cy="14" r="1.1" />

              <circle cx="7" cy="19" r="1.1" />
              <circle cx="13" cy="19" r="1.1" />
              <circle cx="19" cy="19" r="1.1" />
              <circle cx="25" cy="19" r="1.1" />
            </g>
          </g>
        </svg>
      );

    case 'id':
      return (
        <svg viewBox="0 0 60 40" width={width} height={height} className={`flag-svg ${className}`}>
          <rect width="60" height="20" fill="#E70011" />
          <rect y="20" width="60" height="20" fill="#FFFFFF" />
        </svg>
      );

    case 'es':
      return (
        <svg viewBox="0 0 60 40" width={width} height={height} className={`flag-svg ${className}`}>
          <rect width="60" height="10" fill="#AA151B" />
          <rect y="10" width="60" height="20" fill="#F1BF00" />
          <rect y="30" width="60" height="10" fill="#AA151B" />
          <circle cx="18" cy="20" r="4.5" fill="#AA151B" opacity="0.85" />
        </svg>
      );

    case 'de':
      return (
        <svg viewBox="0 0 60 40" width={width} height={height} className={`flag-svg ${className}`}>
          <rect width="60" height="13.3" fill="#000000" />
          <rect y="13.3" width="60" height="13.4" fill="#DD0000" />
          <rect y="26.7" width="60" height="13.3" fill="#FFCE00" />
        </svg>
      );

    case 'fr':
      return (
        <svg viewBox="0 0 60 40" width={width} height={height} className={`flag-svg ${className}`}>
          <rect width="20" height="40" fill="#002395" />
          <rect x="20" width="20" height="40" fill="#FFFFFF" />
          <rect x="40" width="20" height="40" fill="#ED2939" />
        </svg>
      );

    case 'it':
      return (
        <svg viewBox="0 0 60 40" width={width} height={height} className={`flag-svg ${className}`}>
          <rect width="20" height="40" fill="#009246" />
          <rect x="20" width="20" height="40" fill="#FFFFFF" />
          <rect x="40" width="20" height="40" fill="#CE2B37" />
        </svg>
      );

    case 'pt-br':
    case 'pt':
      return (
        <svg viewBox="0 0 60 40" width={width} height={height} className={`flag-svg ${className}`}>
          <rect width="60" height="40" fill="#009739" />
          <polygon points="30,6 54,20 30,34 6,20" fill="#FEDD00" />
          <circle cx="30" cy="20" r="7" fill="#012169" />
        </svg>
      );

    case 'nl':
      return (
        <svg viewBox="0 0 60 40" width={width} height={height} className={`flag-svg ${className}`}>
          <rect width="60" height="13.3" fill="#AE1C28" />
          <rect y="13.3" width="60" height="13.4" fill="#FFFFFF" />
          <rect y="26.7" width="60" height="13.3" fill="#21468B" />
        </svg>
      );

    case 'pl':
      return (
        <svg viewBox="0 0 60 40" width={width} height={height} className={`flag-svg ${className}`}>
          <rect width="60" height="20" fill="#FFFFFF" />
          <rect y="20" width="60" height="20" fill="#DC143C" />
        </svg>
      );

    case 'tr':
      return (
        <svg viewBox="0 0 60 40" width={width} height={height} className={`flag-svg ${className}`}>
          <rect width="60" height="40" fill="#E30A17" />
          <circle cx="26" cy="20" r="9" fill="#FFFFFF" />
          <circle cx="28.5" cy="20" r="7.2" fill="#E30A17" />
          <polygon points="36,17 39,20 36,23 36.5,20" fill="#FFFFFF" />
        </svg>
      );

    case 'cs':
      return (
        <svg viewBox="0 0 60 40" width={width} height={height} className={`flag-svg ${className}`}>
          <rect width="60" height="20" fill="#FFFFFF" />
          <rect y="20" width="60" height="20" fill="#D7141A" />
          <polygon points="0,0 28,20 0,40" fill="#11457E" />
        </svg>
      );

    case 'da':
      return (
        <svg viewBox="0 0 60 40" width={width} height={height} className={`flag-svg ${className}`}>
          <rect width="60" height="40" fill="#C60C30" />
          <rect x="18" width="6" height="40" fill="#FFFFFF" />
          <rect y="17" width="60" height="6" fill="#FFFFFF" />
        </svg>
      );

    case 'sv':
      return (
        <svg viewBox="0 0 60 40" width={width} height={height} className={`flag-svg ${className}`}>
          <rect width="60" height="40" fill="#006AA7" />
          <rect x="18" width="6" height="40" fill="#FECC00" />
          <rect y="17" width="60" height="6" fill="#FECC00" />
        </svg>
      );

    case 'ja':
      return (
        <svg viewBox="0 0 60 40" width={width} height={height} className={`flag-svg ${className}`}>
          <rect width="60" height="40" fill="#FFFFFF" />
          <circle cx="30" cy="20" r="10" fill="#BC002D" />
        </svg>
      );

    case 'ar':
      return (
        <svg viewBox="0 0 60 40" width={width} height={height} className={`flag-svg ${className}`}>
          <rect width="60" height="40" fill="#006C35" />
          <text x="30" y="21" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">عربي</text>
          <rect x="16" y="26" width="28" height="2.5" fill="#FFFFFF" rx="1" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 60 40" width={width} height={height} className={`flag-svg ${className}`}>
          <rect width="60" height="40" fill="#27272a" />
          <text x="30" y="24" fill="#a1a1aa" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            {normCode.toUpperCase().slice(0, 2)}
          </text>
        </svg>
      );
  }
}
