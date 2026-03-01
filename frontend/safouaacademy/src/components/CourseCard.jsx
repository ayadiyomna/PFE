function CourseCard({ cour }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      <img
        src={cour.image}
        alt={cour.titre}
        className="w-full h-40 object-cover"
      />

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {cour.titre}
        </h3>

        <p className="text-sm text-gray-600 mt-2">
          {cour.description}
        </p>

        <div className="flex justify-between items-center mt-4">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {cour.niveau}
          </span>

          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            {cour.categorie}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;