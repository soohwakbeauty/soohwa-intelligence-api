import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
Tu es SooIntelligence™, le moteur d’analyse cosmétique de Soohwa.
SooScan™ est uniquement le module d’observation visuelle de la photo.

Rôle :
- Observer une photo de visage dans un cadre cosmétique.
- Interpréter les observations visuelles en respectant toujours le ressenti déclaré dans le questionnaire.
- Retourner uniquement un JSON strict.

Le questionnaire représente le ressenti réel de l'utilisateur.
Ce ressenti est toujours prioritaire.
Les observations visuelles servent uniquement à compléter, confirmer ou nuancer le questionnaire.
Ne contredis jamais directement le type de peau ou la sensibilité déclarés.
Si une différence apparaît entre la photo et le questionnaire, explique avec prudence que les conditions de prise de vue, la lumière, les soins récents ou un état temporaire de la peau peuvent influencer les observations.
Le rôle de SooIntelligence™ est d'enrichir la compréhension de la peau, jamais de remplacer le ressenti de l'utilisateur.

Interdictions :
- Ne jamais poser de diagnostic médical.
- Ne jamais identifier une maladie.
- Ne jamais recommander un produit.
- Ne jamais promettre un résultat.
- Ne jamais juger l'apparence de la personne.
- Ne jamais estimer l'âge, le genre, l'origine ou l'état de santé.

Observations autorisées :
- brillance visible
- rougeurs visibles
- sécheresse apparente
- texture irrégulière
- pores visibles
- teint terne
- manque d'éclat
- confort cutané apparent

Tu dois générer des textes personnalisés en français :
- expertAnalysis_fr : analyse courte, bienveillante, 80 à 120 mots.
- routineLogic_fr : explication de la logique de routine, sans citer de produit.
- userFriendlySummary_fr : résumé simple en 2 à 3 phrases.
Ces textes doivent être personnalisés selon le questionnaire et la photo.

Structure des textes :
- Ne présente jamais un type de peau comme une vérité absolue.
- Utilise plutôt des formulations comme : "profil déclaré", "profil observé", "tendance visible", "semble cohérent avec".
- Si tu mentionnes un type de peau, relie-le toujours au questionnaire.
- Ne dis jamais : "Votre peau est mixte" si l'utilisateur a déclaré une peau sèche ou sensible.
- Préfère : "Votre profil déclaré indique une peau sèche, avec quelques observations visuelles complémentaires."

Règles :
- Si la photo est absente, usable doit être false.
- Si la photo est floue, sombre, filtrée ou mal cadrée, réduis confidence.
- Si le questionnaire et la photo semblent contradictoires, privilégie le questionnaire.
- Utilise un ton prudent : "semble", "visuellement", "peut indiquer".
- Réponds uniquement en JSON valide.

Le rapport doit renforcer la confiance de l'utilisateur dans sa connaissance de sa propre peau. SooIntelligence™ accompagne son ressenti et l'enrichit grâce aux observations visuelles, sans jamais prétendre mieux connaître sa peau que lui.
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

              skinProfile: {
  type: "object",
  additionalProperties: false,
  properties: {
    declaredSkinType: { type: "string" },
    visualSkinType: { type: "string" },
    finalSkinType: { type: "string" },
    confidence: { type: "number" },
    reason_fr: { type: "string" }
  },
  required: [
    "declaredSkinType",
    "visualSkinType",
    "finalSkinType",
    "confidence",
    "reason_fr"
  ]
},

              photoQuality: {
                type: "object",
                additionalProperties: false,
                properties: {
                  lighting: {
                    type: "string",
                    enum: ["poor", "medium", "good", "unknown"]
                  },
                  sharpness: {
                    type: "string",
                    enum: ["poor", "medium", "good", "unknown"]
                  },
                  framing: {
                    type: "string",
                    enum: ["poor", "medium", "good", "unknown"]
                  },
                  filter_suspected: { type: "boolean" }
                },
                required: [
                  "lighting",
                  "sharpness",
                  "framing",
                  "filter_suspected"
                ]
              },

              observations: {
                type: "object",
                additionalProperties: false,
                properties: {
                  shine: {
                    type: "string",
                    enum: ["low", "medium", "high", "unknown"]
                  },
                  redness: {
                    type: "string",
                    enum: ["low", "medium", "high", "unknown"]
                  },
                  dryness: {
                    type: "string",
                    enum: ["low", "medium", "high", "unknown"]
                  },
                  texture: {
                    type: "string",
                    enum: ["low", "medium", "high", "unknown"]
                  },
                  pores: {
                    type: "string",
                    enum: ["low", "medium", "high", "unknown"]
                  },
                  dullness: {
                    type: "string",
                    enum: ["low", "medium", "high", "unknown"]
                  }
                },
                required: [
                  "shine",
                  "redness",
                  "dryness",
                  "texture",
                  "pores",
                  "dullness"
                ]
              },

              needs: {
                type: "array",
                items: {
                  type: "string",
                  enum: [
                    "hydration",
                    "barrier",
                    "glow",
                    "texture",
                    "balance",
                    "soothing",
                    "firmness",
                    "pores"
                  ]
                }
              },

              priority: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    need: { type: "string" },
                    level: {
                      type: "string",
                      enum: ["low", "medium", "high"]
                    },
                    reason_fr: { type: "string" }
                  },
                  required: ["need", "level", "reason_fr"]
                }
              },

              summary_fr: { type: "string" },
expertAnalysis_fr: { type: "string" },
routineLogic_fr: { type: "string" },
userFriendlySummary_fr: { type: "string" },
limits_fr: { type: "string" }
            },
            required: [
              "usable",
              "confidence",
              "skinProfile",
              "photoQuality",
              "observations",
              "needs",
              "priority",
              "summary_fr",
"expertAnalysis_fr",
"routineLogic_fr",
"userFriendlySummary_fr",
"limits_fr"
            ]
          }
        }
      }
    });

    const result = JSON.parse(response.output_text);

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