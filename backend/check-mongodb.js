const { exec } = require('child_process');

console.log("🔍 Vérification de MongoDB...");

// Vérifier si MongoDB est installé
exec('mongod --version', (error, stdout, stderr) => {
  if (error) {
    console.log("❌ MongoDB n'est pas installé ou pas dans le PATH");
    console.log("📥 Téléchargez MongoDB depuis: https://www.mongodb.com/try/download/community");
    return;
  }
  console.log("✅ MongoDB est installé:");
  console.log(stdout.split('\n')[0]);
});

// Vérifier si le service MongoDB tourne
exec('net start | find "MongoDB"', (error, stdout, stderr) => {
  if (error || !stdout) {
    console.log("❌ Le service MongoDB n'est pas démarré");
    console.log("▶️ Pour démarrer MongoDB:");
    console.log("   net start MongoDB");
    console.log("   ou");
    console.log('   "C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe" --dbpath="C:\\data\\db"');
  } else {
    console.log("✅ Service MongoDB:", stdout.trim());
  }
});