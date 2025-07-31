import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import CandaIcon from "../assets/images/canda_icon.png";

function Header() {
  const [isRainbow, setIsRainbow] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
    // Store current path to restore after refresh
    sessionStorage.setItem("currentPath", location.pathname);
    // Refresh the page
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 py-3 gap-3 sm:gap-0">
        <div className="flex items-center gap-3">
          <img
            className={`w-10 h-9 sm:w-13 sm:h-12 cursor-pointer transition-all duration-1000 ease-in-out ${
              isRainbow
                ? "animate-pulse ring-2 ring-teal-400 ring-opacity-50 rounded-full"
                : ""
            }`}
            style={rainbowStyle}
            src={CandaIcon}
            alt="Canda"
            onClick={handleIconClick}
          />
          <h1 className="text-lg sm:text-xl font-semibold text-oxford-blue-900 min-w-[150px] sm:min-w-[200px]">
            {location.pathname === "/dashboard"
              ? "Brand Analysis"
              : location.pathname === "/dashboard/competitive"
              ? "Competitive Analysis"
              : location.pathname === "/dashboard/category"
              ? "Category Analysis"
              : "Brand Analysis"}
          </h1>
        </div>

        {/* View toggle buttons */}
        <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-[160px] justify-center">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `flex items-center justify-center w-9 h-8 sm:w-11 sm:h-10 rounded-lg border transition-colors ${
                isActive
                  ? "bg-teal-600 border-teal-100 text-frost-gray-50"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-teal-50 hover:text-teal-800"
              }`
            }
            title="Brand Analysis"
          >
            <span className="material-symbols-outlined msolarge text-base sm:text-lg">
              person
            </span>
          </NavLink>

          <NavLink
            to="/dashboard/competitive"
            className={({ isActive }) =>
              `flex items-center justify-center w-9 h-8 sm:w-11 sm:h-10 rounded-lg border transition-colors ${
                isActive
                  ? "bg-teal-600 border-teal-100 text-frost-gray-50"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-teal-50 hover:text-teal-800"
              }`
            }
            title="Competitive Dashboard"
          >
            <span className="material-symbols-outlined msolarge text-base sm:text-lg">
              group
            </span>
          </NavLink>

          <NavLink
            to="/dashboard/category"
            className={({ isActive }) =>
              `flex items-center justify-center w-9 h-8 sm:w-11 sm:h-10 rounded-lg border transition-colors ${
                isActive
                  ? "bg-teal-600 border-teal-100 text-frost-gray-50"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-teal-50 hover:text-teal-800"
              }`
            }
            title="Category Dashboard"
          >
            <span className="material-symbols-outlined msolarge text-base sm:text-lg">
              category
            </span>
          </NavLink>
        </div>

        <div className="flex headerbtn items-center px-2 gap-1 bg-white border border-frost-gray-200 text-frost-gray-900 hover:text-teal-800 hover:bg-teal-50 rounded-md h-8 sm:h-9 cursor-pointer w-full sm:w-[235px] justify-center text-xs sm:text-sm">
          <span className="material-symbols-outlined text-sm sm:text-base leading-none">
            calendar_month
          </span>
          <span className="font-medium leading-none hidden xs:block">
            Jan 01, 2025 – Jun 30,2025
          </span>
          <span className="font-medium leading-none xs:hidden">
            Jan 01, 2025 – Jun 30,2025
          </span>
        </div>
      </div>
      <div className="mb-6 border-b border-frost-gray-300"></div>
    </header>
  );
}

export default Header;
