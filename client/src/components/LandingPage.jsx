import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Save your uploaded logo as logo.png in public/assets

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center font-serif">
      <img src={logo} alt="BioSecurePay" className="h-32 mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 mb-6">BioSecurePay</h1>
      <div className="space-y-4">
        <button
          onClick={() => navigate("/login")}
          className="bg-pink-400 text-white py-2 px-6 rounded-lg shadow-md hover:bg-pink-500"
        >
          Log In
        </button>
        <button
          onClick={() => navigate("/register")}
          className="border border-pink-400 text-pink-400 py-2 px-6 rounded-lg hover:bg-pink-100"
        >
          Register
        </button>
      </div>
    </div>
  );
}
