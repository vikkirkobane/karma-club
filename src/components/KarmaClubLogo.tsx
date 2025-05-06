
import React from "react";

interface KarmaClubLogoProps {
  className?: string;
}

const KarmaClubLogo: React.FC<KarmaClubLogoProps> = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Outer ring with text */}
      <div className="absolute inset-0 rounded-full bg-yellow-400 flex items-center justify-center">
        <div className="w-[90%] h-[90%] rounded-full bg-black flex items-center justify-center">
          {/* Yin-yang symbol */}
          <div className="w-[95%] h-[95%] rounded-full bg-white relative overflow-hidden flex">
            <div className="w-1/2 h-full bg-[#56CCF2]"></div>
            <div className="w-1/2 h-full bg-white"></div>
            
            {/* Top circle (black dot in white area) */}
            <div className="absolute top-1/4 right-1/4 w-[20%] h-[20%] rounded-full bg-[#56CCF2] border-2 border-white"></div>
            
            {/* Bottom circle (white dot in black area) */}
            <div className="absolute bottom-1/4 left-1/4 w-[20%] h-[20%] rounded-full bg-white border-2 border-[#56CCF2]"></div>
          </div>
        </div>
      </div>
      
      {/* Text around the circle - simulated with positioning */}
      <svg className={`${className} w-full h-full`} viewBox="0 0 100 100">
        <path id="curve" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
        <text fontSize="4">
          <textPath xlinkHref="#curve" startOffset="0%">
            PLANNED ACTS.ORG • THE KARMA CLUB • THE MORE YOU DO THE GREATER YOUR REWARDS •
          </textPath>
        </text>
      </svg>
    </div>
  );
};

export default KarmaClubLogo;
