const express = require("express");
const router = express.Router();
const axios = require("axios");
const AIModel = require('../models/aiModel');

// Prompt système amélioré
const SYSTEM_PROMPT = `Vous êtes l'assistant AI officiel de SafouaAcademy, une plateforme d'apprentissage en ligne spécialisée dans l'enseignement de l'Islam.
Votre rôle est strictement limité à :
- Répondre aux questions éducatives sur l'Islam (Tajwid, Arabe, Fiqh, Histoire islamique)
- Recommander des cours disponibles sur la plateforme
- Aider avec les exercices et devoirs
- Donner des conseils d'apprentissage

Règles importantes :
1. Si l'utilisateur demande quelque chose en dehors de ces sujets, refusez poliment
2. Structurez TOUJOURS chaque réponse dans ce format bilingue :
   - D'abord la réponse en français
   - Ensuite un séparateur : ───────────────
   - Ensuite la même réponse en arabe (de droite à gauche)
3. Gardez les réponses concises - 3 à 5 phrases par langue
4. Si vous recommandez un cours, mentionnez le titre exact et le niveau
5. Utilisez un ton chaleureux et respectueux
6. Incluez des versets ou hadiths quand approprié (en arabe avec traduction)

Exemple de réponse :
[Explication en français...]
───────────────
[نفس الشرح باللغة العربية...]`;

// Route de test - Vérifier que le routeur fonctionne
router.get("/test", (req, res) => {
  res.json({ 
    success: true,
    message: "✅ Route chat fonctionne correctement",
    timestamp: new Date().toISOString(),
    endpoints: {
      post: "/api/chat - Envoyer un message",
      status: "/api/chat/status - Vérifier statut Ollama",
      test: "/api/chat/test - Cette route de test"
    }
  });
});

// Route pour vérifier le statut d'Ollama
router.get("/status", async (req, res) => {
  try {
    console.log("🔍 Vérification du statut Ollama...");
    
    // Vérifier si Ollama est accessible
    const response = await axios.get("http://localhost:11434/api/tags", {
      timeout: 5000
    });
    
    const models = response.data.models || [];
    const hasLlama3 = models.some(m => m.name.includes("llama3"));
    
    console.log("✅ Ollama est accessible");
    
    res.json({
      success: true,
      ollamaRunning: true,
      models: models.map(m => m.name),
      llama3Available: hasLlama3,
      message: hasLlama3 
        ? "✅ Ollama est prêt avec le modèle llama3"
        : "⚠️ Ollama est lancé mais le modèle llama3 n'est pas trouvé. Exécutez: ollama pull llama3",
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Erreur connexion Ollama:", error.message);
    
    res.json({
      success: false,
      ollamaRunning: false,
      error: error.message,
      message: "❌ Ollama n'est pas accessible. Vérifiez qu'il est lancé.",
      instructions: [
        "1. Ouvrez un nouveau terminal",
        "2. Exécutez: ollama run llama3",
        "3. Laissez le terminal ouvert",
        "4. Rafraîchissez cette page"
      ],
      timestamp: new Date().toISOString()
    });
  }
});

// Route principale pour envoyer un message
router.post("/", async (req, res) => {
  let isStreaming = false;

  try {
    const { message, history = [] } = req.body;

    console.log("📨 Message reçu:", (message || '').substring(0, 50) + "...");

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false,
        error: "Message requis" 
      });
    }

    // Configuration SSE (Server-Sent Events)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no"); // Désactiver le buffering pour Nginx
    res.flushHeaders();

    // Envoyer un premier chunk vide pour forcer le flush (évite buffering intermédiaire)
    try {
      res.write(`data: ${JSON.stringify({ token: '' })}\n\n`);
    } catch (e) {
      console.error('Erreur en écrivant le chunk initial SSE:', e.message);
    }

    // DEBUG: indicate whether global fetch is available
    try { res.write(`data: ${JSON.stringify({ token: `DEBUG: typeof fetch = ${typeof fetch}` })}\n\n`); } catch (e) {}

    req.on("close", () => {
      if (!res.writableEnded) {
        console.log("⚠️ Client déconnecté (ignorer, laisser le traitement continuer).");
      }
    });
    
    isStreaming = true;

    // Vérifier si Ollama est accessible (utilise fetch pour la compatibilité)
    try {
      const tagRes = await fetch("http://localhost:11434/api/tags");
      if (!tagRes.ok) throw new Error(`Status ${tagRes.status}`);
    } catch (ollamaError) {
      console.error("❌ Ollama non accessible:", ollamaError.message);
      
      const errorMessageFr = "❌ Ollama n'est pas lancé. Veuillez exécuter 'ollama run llama3' dans un terminal pour démarrer l'assistant.";
      const errorMessageAr = "❌ أولاما غير مشغلة. الرجاء تشغيل 'ollama run llama3' في الطرفية لبدء المساعد.";
      
      try { res.write(`data: ${JSON.stringify({ token: errorMessageFr + "\n\n───────────────\n\n" + errorMessageAr })}\n\n`); } catch (e) {}
      try { res.write(`data: ${JSON.stringify({ done: true })}\n\n`); } catch (e) {}
      try { res.end(); } catch (e) {}
      return;
    }

      // Debug: informer le client qu'Ollama est reachable
      try { res.write(`data: ${JSON.stringify({ token: 'DEBUG: Ollama reachable' })}\n\n`); } catch(e){}

    // Récupérer la configuration active ou utiliser les valeurs par défaut
    let aiConfig;
    try {
      aiConfig = await AIModel.findOne({ isActive: true });
    } catch (dbError) {
      console.error("⚠️ Erreur base de données:", dbError.message);
      aiConfig = null;
    }

    const config = aiConfig || {
      systemPrompt: SYSTEM_PROMPT,
      temperature: 0.7,
      maxTokens: 512
    };

      // Debug: config loaded
      try { res.write(`data: ${JSON.stringify({ token: 'DEBUG: aiConfig loaded' })}\n\n`); } catch(e){}

    // Construire le contexte de la conversation
    const recentHistory = history.slice(-4); // Garder les 4 derniers messages
    const conversationContext = recentHistory
      .map((m) => {
        if (m.role === "user") return `User: ${m.text}`;
        if (m.role === "assistant") return `Assistant: ${m.text}`;
        return "";
      })
      .filter(Boolean)
      .join("\n");

    const fullPrompt = conversationContext
      ? `${conversationContext}\nUser: ${message}\nAssistant:`
      : `User: ${message}\nAssistant:`;

    console.log("🤖 Appel à Ollama avec modèle: llama3");
    try { res.write(`data: ${JSON.stringify({ token: 'DEBUG: calling Ollama' })}\n\n`); } catch(e){}

    // Appel à Ollama avec streaming via fetch (plus fiable pour les ReadableStreams)
    const fetchBody = JSON.stringify({
      model: "llama3",
      system: config.systemPrompt,
      prompt: fullPrompt,
      stream: true,
      options: {
        num_predict: config.maxTokens,
        temperature: config.temperature
      }
    });

    // Fallback: call Ollama in non-stream mode and return full response (ensures client gets output)
    try {
      const nonStreamBody = JSON.stringify({
        model: 'llama3',
        system: config.systemPrompt,
        prompt: fullPrompt,
        stream: false,
        options: { num_predict: config.maxTokens, temperature: config.temperature }
      });

      const resp = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: nonStreamBody,
      });

      if (!resp.ok) {
        const t = await resp.text().catch(() => '');
        console.error('Ollama non-stream error:', resp.status, t.substring(0, 200));
        res.write(`data: ${JSON.stringify({ token: '❌ Erreur Ollama' })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
        return;
      }

      const data = await resp.json().catch(() => null);
      const answer = data?.response || (typeof data === 'string' ? data : JSON.stringify(data).substring(0, 1000));
      res.write(`data: ${JSON.stringify({ token: answer })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      isStreaming = false;
      return;
    } catch (e) {
      console.error('Erreur fallback non-streaming Ollama:', e.message);
      if (!res.writableEnded) {
        try {
          res.write(`data: ${JSON.stringify({ token: '❌ Erreur interne lors de l appel à Ollama' })}\n\n`);
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          res.end();
        } catch (ee) {
          console.error('Erreur en renvoyant l erreur au client:', ee.message);
        }
      }
      return;
    }

  } catch (err) {
    console.error("🔥 Erreur chat:", err.message);

    if (!res.writableEnded) {
      try {
        const errorMessage = `❌ Erreur: ${err.message}\n\nVérifiez que le serveur Ollama est bien lancé.`;
        res.write(`data: ${JSON.stringify({ token: errorMessage })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } catch (e) {
        console.error("Erreur fatale:", e);
      }
    }
  }
});

// Route pour obtenir l'historique (optionnel)
router.get("/history/:sessionId", async (req, res) => {
  // Implémentez si vous voulez sauvegarder l'historique
  res.json({ 
    message: "Route non implémentée",
    history: [] 
  });
});

module.exports = router;