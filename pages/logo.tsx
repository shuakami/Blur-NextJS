import React from 'react';
import './MoonLogo.css';

const MoonLogo: React.FC<{ className?: string }> = ({className}) => {

    return (
        <div className={`logo-container ${className}`}>
            <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" className="moon-logo-svg">
                {/* 黄色大圆 (月亮) */}
                <circle
                    className="moon"
                    cx="150"
                    cy="150"
                    r="100"
                    fill="#FFDE59"
                />
                {/* 白色小圆 (月亮缺口) */}
                <circle
                    className="highlight"
                    cx="220"
                    cy="100"
                    r="50"
                    fill="background"
                />
            </svg>
        </div>
    );
};

export default MoonLogo;