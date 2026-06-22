import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
Tu es SooIntelligence™, le moteur cosmétique de Soohwa.
SooScan™ est uniquement le module d'analyse photo.

Règles absolues :
- Le questionnaire est toujours prioritaire.
- La photo complète uniquement, elle ne remplace jamais le ressenti utilisateur.
- Diagnostic cosmétique uniquement, jamais médical.
- Ne parle jamais d'âge, genre, origine, santé ou maladie.
- Ne recommande aucun produit précis.
- Ton premium, humain, court, naturel.
- Pas de phrases longues.
- Pas de répétition.

Si une photo est fournie :
- utilise-la seulement pour nuancer avec prudence.
- utilise : "semble", "peut indiquer", "visuellement".
- ne contredis jamais le questionnaire.

Si aucune photo n'est fournie :
- base tout uniquement sur le questionnaire.
- ne mentionne jamais photo, visuel, observation, lumière, pores, rougeurs, texture ou brillance.

Tu dois retourner uniquement un JSON strict avec 3 textes courts :
- expertAnalysis_fr : 2 phrases maximum.
- userFriendlySummary_fr : 2 phrases maximum.
- routineLogic_fr : 2 phrases maximum.

Chaque texte doit avoir un rôle différent :
1. expertAnalysis_fr = lecture du profil.
2. userFriendlySummary_fr = priorité retenue.
3. routineLogic_fr = pourquoi la routine est cohérente.

Maximum 45 mots par champ.
`;

function buildUserPrompt(payload) {
  const questionnaire = payload?.questionnaire || {};
  const photo = payload?.photo || {};

  return `
CONTEXTE
Le questionnaire suivant a été rempli par l'utilisateur.
Ces réponses représentent sa perception de sa peau.

QUESTIONNAIRE
Type de peau : ${questionnaire.skin || "non renseigné"}
Sensibilité : ${questionnaire.sensitivity || "non renseigné"}
Hydratation : ${questionnaire.hydration || "non renseigné"}
Préoccupation principale : ${questionnaire.concern || "non renseigné"}
Intensité : ${questionnaire.intensity || "non renseigné"}
Âge : ${questionnaire.age || "non renseigné"}

PHOTO
Photo fournie : ${photo.provided ? "oui" : "non"}
Qualité déclarée : ${photo.quality || "unknown"}
Largeur : ${photo.width || "unknown"}
Hauteur : ${photo.height || "unknown"}
Orientation : ${photo.orientation || "unknown"}

MISSION
Analyse uniquement les éléments cosmétiques visibles.
Ne recommande aucun produit.
Retourne uniquement le JSON demandé.
`;
}

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed"
    });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "OPENAI_API_KEY missing"
      });
    }

    const payload = req.body?.payload || req.body || {};
    const photoBase64 = payload?.photo?.base64 || null;
    const hasPhoto = Boolean(payload?.photo?.provided && photoBase64);

    const content = [
      {
        type: "input_text",
        text: buildUserPrompt(payload)
      }
    ];

    if (hasPhoto) {
      content.push({
        type: "input_image",
        image_url: photoBase64,
        detail: "low"
      });
    }

    const response = await client.responses.create({
      model: "gpt-5.5",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: SYSTEM_PROMPT
            }
          ]
        },
        {
          role: "user",
          content
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "soohwa_skinscan_result",
          strict: true,
schema: {
  type: "object",
  additionalProperties: false,
  properties: {
    usable: { type: "boolean" },
    confidence: { type: "number" },
    expertAnalysis_fr: { type: "string" },
    userFriendlySummary_fr: { type: "string" },
    routineLogic_fr: { type: "string" }
  },
  required: [
    "usable",
    "confidence",
    "expertAnalysis_fr",
    "userFriendlySummary_fr",
    "routineLogic_fr"
  ]
}
        }
      }
    });

    const result = JSON.parse(response.output_text);

    result.usable = hasPhoto;

    return res.status(200).json({
      success: true,
      source: "openai",
      result
    });
  } catch (error) {
    console.error("Soohwa analyze error:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Unknown server error"
    });
  }
}