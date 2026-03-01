import { useState, useEffect } from "react";
import { getCoursList } from "../services/coursService";
import CourseCard from "../components/CourseCard";

function AdminDashboard() {
  const [cours, setCours] = useState([]);

  useEffect(() => {
    getCoursList().then(res => setCours(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gestion des Cours</h1>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            + Nouveau cours
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cours.map((cour) => (
            <CourseCard key={cour._id} cour={cour} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
