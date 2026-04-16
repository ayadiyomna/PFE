import { Link } from "react-router-dom";

function Cancel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Paiement annulé
        </h1>
        <p className="text-gray-600 mb-6">
          Votre paiement a été annulé. Vous pouvez réessayer quand vous voulez.
        </p>
        <Link
          to="/cours"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg font-medium"
        >
          Retour aux cours
        </Link>
      </div>
    </div>
  );
}

export default Cancel;