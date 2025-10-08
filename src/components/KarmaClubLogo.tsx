import React from "react";

interface KarmaClubLogoProps {
  className?: string;
}

const KarmaClubLogo: React.FC<KarmaClubLogoProps> = ({ className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <img 
        src="/karma-club-logo.png" 
        alt="The Karma Club Logo - The More You Do The Greater Your Rewards" 
        className="w-full h-full object-contain"
      />
    </div>
  );
};

export default KarmaClubLogo;
