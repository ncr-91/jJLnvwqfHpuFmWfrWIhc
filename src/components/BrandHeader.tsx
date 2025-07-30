import { useState, useEffect } from "react";
import CandaIcon from "../assets/images/canda_icon.png";

function Header() {
  const [isRainbow, setIsRainbow] = useState(false);

  // Check if we should start animation on page load
  useEffect(() => {
    const shouldAnimate = sessionStorage.getItem("rainbowAnimation");
    if (shouldAnimate) {
      setIsRainbow(true);
      sessionStorage.removeItem("rainbowAnimation");
      setTimeout(() => setIsRainbow(false), 3000);
    }
  }, []);

  const handleIconClick = () => {
    // Set flag for animation on next page load
    sessionStorage.setItem("rainbowAnimation", "true");
    // Refresh immediately
    window.location.reload();
  };

  const rainbowStyle = isRainbow
    ? {
        animation: "rainbow 3s linear infinite",
      }
    : {};

  return (
    <header>
      <style>
        {`
          @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
          }
        `}
      </style>
      <div className="flex items-center justify-between -mt-5 px-2 pb-3">
        <div className="flex items-center gap-3">
          <img
            className={`w-13 h-12 cursor-pointer transition-all duration-1000 ease-in-out ${
              isRainbow
                ? "animate-pulse ring-2 ring-teal-400 ring-opacity-50 rounded-full"
                : ""
            }`}
            style={rainbowStyle}
            src={CandaIcon}
            alt="Canda"
            onClick={handleIconClick}
          />
          <h1 className="text-xl font-semibold text-oxford-blue-900">
            Brand Dashboard
          </h1>
        </div>

        {/* View toggle buttons 
        <div className="flex items-center gap-2">
          <a
            href=""
            className="flex items-center justify-center w-10 h-10 rounded-lg border transition-colors bg-teal-100 border-teal-300 text-teal-700"
            title="Brand Dashboard"
          >
            <span className="material-symbols-outlined msolarge text-lg">
              person
            </span>
          </a>

          <a
            href=""
            className="flex items-center justify-center w-10 h-10 rounded-lg border transition-colors bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            title="Competitive Dashboard"
          >
            <span className="material-symbols-outlined msolarge text-lg">
              group
            </span>
          </a>

          <a
            href=""
            className="flex items-center justify-center w-10 h-10 rounded-lg border transition-colors bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            title="Category Dashboard"
          >
            <span className="material-symbols-outlined msolarge text-lg">
              category
            </span>
          </a>
        </div> */}

        <div className="flex headerbtn items-center px-2.5 gap-1 bg-white border border-frost-gray-200 text-frost-gray-900 hover:text-teal-800 hover:bg-teal-50 rounded-md h-9 cursor-pointer w-fit">
          <span className="material-symbols-outlined text-base leading-none">
            calendar_month
          </span>
          <span className="text-sm font-medium leading-none">
            Jan 01, 2025 – Jun 30,2025
          </span>
        </div>
      </div>
      <div className="mb-6 border-b border-frost-gray-300"></div>
    </header>
  );
}

export default Header;
