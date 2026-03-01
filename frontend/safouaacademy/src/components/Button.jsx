import React from "react";

const Button = ({ text, onClick }) => {
 return (
   <button
     onClick={onClick}
     className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
   >
     {text}
   </button>
 );
};

export default Button;
