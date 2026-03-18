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
    
    console.log("📨 Message reçu:", message.substring(0, 50) + "...");

    if (!message) {
      return res.status(400).json({ 
        success: false,
        error: "Message requis" 
      });
    }

    // Configuration SSE (Server-Sent Events)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader("X-Accel-Buffering", "no"); // Désactiver le buffering pour Nginx
    res.flushHeaders();
    
    isStreaming = true;

    // Vérifier si Ollama est accessible
    try {
      await axios.get("http://localhost:11434/api/tags", { timeout: 2000 });
    } catch (ollamaError) {
      console.error("❌ Ollama non accessible:", ollamaError.message);
      
      const errorMessageFr = "❌ Ollama n'est pas lancé. Veuillez exécuter 'ollama run llama3' dans un terminal pour démarrer l'assistant.";
      const errorMessageAr = "❌ أولاما غير مشغلة. الرجاء تشغيل 'ollama run llama3' في الطرفية لبدء المساعد.";
      
      res.write(`data: ${JSON.stringify({ token: errorMessageFr + "\n\n───────────────\n\n" + errorMessageAr })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
      return;
    }

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

    // Construire le contexte de la conversation
    const recentHistory = history.slice(-8); // Garder les 8 derniers messages
    let conversationContext = "";
    
    if (recentHistory.length > 0) {
      conversationContext = recentHistory
        .map((m) => {
          if (m.role === "user") return `Utilisateur: ${m.text}`;
          if (m.role === "assistant") return `Assistant: ${m.text}`;
          return "";
        })
        .filter(Boolean)
        .join("\n") + "\n";
    }

    const fullPrompt = conversationContext
      ? `${conversationContext}Utilisateur: ${message}\nAssistant:`
      : `Utilisateur: ${message}\nAssistant:`;

    console.log("🤖 Appel à Ollama avec modèle: llama3");

    // Appel à Ollama avec streaming
    const ollamaRes = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3",
        system: config.systemPrompt,
        prompt: fullPrompt,
        stream: true,
        options: { 
          num_predict: config.maxTokens, 
          temperature: config.temperature 
        },
      },
      { 
        responseType: "stream", 
        timeout: 120000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    let buffer = "";
    let tokenCount = 0;

    ollamaRes.data.on("data", (chunk) => {
      buffer += chunk.toString();
      
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim() === "") continue;
        
        try {
          const json = JSON.parse(line);
          
          if (json.response) {
            tokenCount++;
            res.write(`data: ${JSON.stringify({ token: json.response })}\n\n`);
          }
          
          if (json.done) {
            console.log(`✅ Réponse complète envoyée (${tokenCount} tokens)`);
            res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
            res.end();
            isStreaming = false;
          }
        } catch (e) {
          console.error("❌ Erreur parsing JSON:", e.message);
        }
      }
    });

    ollamaRes.data.on("end", () => {
      console.log("📡 Stream terminé");
      if (!res.writableEnded) {
        res.end();
        isStreaming = false;
      }
    });

    ollamaRes.data.on("error", (err) => {
      console.error("❌ Erreur stream Ollama:", err.message);
      if (!res.writableEnded) {
        try {
          res.write(`data: ${JSON.stringify({ error: "Erreur de streaming" })}\n\n`);
          res.end();
        } catch (e) {
          console.error("Erreur lors de l'envoi de l'erreur:", e);
        }
        isStreaming = false;
      }
    });

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