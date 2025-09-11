
import React, { useState } from "react";

interface KarmaClubLogoProps {
  className?: string;
}

const KarmaClubLogo: React.FC<KarmaClubLogoProps> = ({ className = "" }) => {
  const [imageError, setImageError] = useState(false);

  // Fallback SVG logo if image fails to load
  const FallbackLogo = () => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {/* Outer yellow ring */}
        <circle cx="100" cy="100" r="98" fill="#FFD700" stroke="#000" strokeWidth="2"/>
        
        {/* Colorful inner ring segments */}
        <g>
          {/* Blue segment */}
          <path d="M 100 20 A 80 80 0 0 1 156.57 43.43 L 143.43 56.57 A 60 60 0 0 0 100 40 Z" fill="#4A90E2"/>
          {/* Red segment */}
          <path d="M 156.57 43.43 A 80 80 0 0 1 180 100 L 160 100 A 60 60 0 0 0 143.43 56.57 Z" fill="#E74C3C"/>
          {/* Green segment */}
          <path d="M 180 100 A 80 80 0 0 1 156.57 156.57 L 143.43 143.43 A 60 60 0 0 0 160 100 Z" fill="#27AE60"/>
          {/* Orange segment */}
          <path d="M 156.57 156.57 A 80 80 0 0 1 100 180 L 100 160 A 60 60 0 0 0 143.43 143.43 Z" fill="#F39C12"/>
          {/* Purple segment */}
          <path d="M 100 180 A 80 80 0 0 1 43.43 156.57 L 56.57 143.43 A 60 60 0 0 0 100 160 Z" fill="#9B59B6"/>
          {/* Teal segment */}
          <path d="M 43.43 156.57 A 80 80 0 0 1 20 100 L 40 100 A 60 60 0 0 0 56.57 143.43 Z" fill="#1ABC9C"/>
          {/* Pink segment */}
          <path d="M 20 100 A 80 80 0 0 1 43.43 43.43 L 56.57 56.57 A 60 60 0 0 0 40 100 Z" fill="#E91E63"/>
          {/* Yellow-green segment */}
          <path d="M 43.43 43.43 A 80 80 0 0 1 100 20 L 100 40 A 60 60 0 0 0 56.57 56.57 Z" fill="#8BC34A"/>
        </g>
        
        {/* White separators between segments */}
        <g stroke="white" strokeWidth="2" fill="none">
          <line x1="100" y1="20" x2="100" y2="40"/>
          <line x1="156.57" y1="43.43" x2="143.43" y2="56.57"/>
          <line x1="180" y1="100" x2="160" y2="100"/>
          <line x1="156.57" y1="156.57" x2="143.43" y2="143.43"/>
          <line x1="100" y1="180" x2="100" y2="160"/>
          <line x1="43.43" y1="156.57" x2="56.57" y2="143.43"/>
          <line x1="20" y1="100" x2="40" y2="100"/>
          <line x1="43.43" y1="43.43" x2="56.57" y2="56.57"/>
        </g>
        
        {/* Inner white circle for yin-yang */}
        <circle cx="100" cy="100" r="60" fill="white" stroke="#ccc" strokeWidth="1"/>
        
        {/* Yin-Yang symbol */}
        <g>
          {/* Blue half */}
          <path d="M 100 40 A 60 60 0 0 1 100 160 A 30 30 0 0 1 100 100 A 30 30 0 0 0 100 40 Z" fill="#5DADE2"/>
          
          {/* White dot in blue half */}
          <circle cx="100" cy="70" r="10" fill="white"/>
          
          {/* Blue dot in white half */}
          <circle cx="100" cy="130" r="10" fill="#5DADE2"/>
        </g>
        
        {/* Text around the outer ring */}
        <defs>
          <path id="textCircle" d="M 100,100 m -85,0 a 85,85 0 1,1 170,0 a 85,85 0 1,1 -170,0"/>
        </defs>
        <text fontSize="8" fontWeight="bold" fill="black" fontFamily="Arial, sans-serif">
          <textPath href="#textCircle" startOffset="0%">
            THE KARMA CLUB • THE MORE YOU DO THE GREATER YOUR REWARDS • PLANNEDACTS.ORG •
          </textPath>
        </text>
      </svg>
    </div>
  );

  if (imageError) {
    return <FallbackLogo />;
  }

  // For now, let's use the SVG version directly since we know it works
  // You can replace this with the image version once you upload the actual logo file
  return <FallbackLogo />;
};

export default KarmaClubLogo;
