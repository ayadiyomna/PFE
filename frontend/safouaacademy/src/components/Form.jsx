import React, { useState } from "react";

const Form = () => {
 const [email, setEmail] = useState("");

 const handleSubmit = (e) => {
   e.preventDefault();
   alert("Email envoyé : " + email);
 };

 return (
   <form onSubmit={handleSubmit} className="flex flex-col gap-2">
     <input
       type="email"
       value={email}
       onChange={(e) => setEmail(e.target.value)}
       placeholder="Votre email"
       className="px-2 py-1 border rounded"
     />
     <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
       Envoyer
     </button>
   </form>
 );
};

export default Form;
