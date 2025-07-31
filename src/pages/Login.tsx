import React from "react";
import { useNavigate } from "react-router-dom";
import "/src/assets/css/global.css";
import CompanyLogo from "/src/assets/images/canda_logo_stacked_light.png";
import DataTextureWallpaper from "../components/LoginWallpaper";

export default function Login() {
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Perform authentication logic here
    navigate("/dashboard"); // Redirect to dashboard after login
  };

  return (
    <div className="flex h-screen">
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <div className="absolute inset-0 z-0">
          <DataTextureWallpaper />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-full p-4">
          <form
            onSubmit={handleSignIn}
            className="max-w-[525px] w-full mx-auto rounded-3xl bg-oxford-blue-900 backdrop-blur-sm p-8 px-8 shadow-2xl"
          >
            <img
              className="justify-self-center w-33 h-26 mb-9"
              src={CompanyLogo}
              width="32"
              height="32"
              alt="Canda"
            />
            <div className="flex flex-col text-frost-gray-300 py-2">
              <label>Username</label>
              <input
                className="rounded-lg bg-oxford-blue-600 text-frost-gray-100 mt-2 p-2.5 focus:border-blueberry-500 focus:bg-frost-gray-800 focus:outline-none"
                type="text"
                placeholder="Enter your username"
              />
            </div>
            <div className="flex flex-col text-frost-gray-300 py-2">
              <label>Password</label>
              <input
                className="p-2.5 rounded-lg bg-oxford-blue-600 text-frost-gray-100 mt-2 focus:border-blueberry-500 focus:bg-frost-gray-800 focus:outline-none"
                type="password"
                placeholder="Enter your password"
              />
            </div>
            <div className="flex justify-end text-frost-gray-300 -mt-1 py-2">
              <p className="fplink flex items-center">Forgot Password?</p>
            </div>
            <button
              type="submit"
              className="loginbtn w-full my-5 py-2.5 mt-9 tracking-wide rounded-lg"
            >
              LOGIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
