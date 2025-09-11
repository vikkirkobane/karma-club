import React, { useState } from 'react';
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import KarmaClubLogo from "@/components/KarmaClubLogo";

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <KarmaClubLogo className="w-32 h-32" />
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Planned Acts of Kindness
            </h1>
            <p className="text-gray-300">
              Creating a kinder world, one act at a time
            </p>
          </div>
        </div>
        
        {isLogin ? (
          <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
        ) : (
          <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};