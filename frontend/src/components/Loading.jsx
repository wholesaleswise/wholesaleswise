import React from "react";
import { FiLoader } from "react-icons/fi";

const Loading = () => {
  return (
    <div>
      <div
        role="status"
        aria-label="loading"
        className="flex justify-center items-center min-h-screen"
      >
        <FiLoader className="animate-spin text-black w-16 h-16" />
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default Loading;
