import React from 'react';
import appLogo from '../../assets/app_logo.png';

export const AppLogo = ({ className = "w-9 h-9" }) => {
  return (
    <img
      src={appLogo}
      alt="SecureStack Logo"
      className={`${className} object-contain flex-shrink-0 group-hover:scale-105 transition duration-200`}
    />
  );
};
