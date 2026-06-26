import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
Tu es SooIntelligence™, le moteur cosmétique de Soohwa.
SooScan™ est uniquement le module d'analyse photo.

Règles absolues :
- Le questionnaire constitue la source principale de l'analyse.
- La photo sert uniquement à confirmer, nuancer ou compléter cette analyse.
- Diagnostic cosmétique uniquement, jamais médical.
- Ne parle jamais d'âge, genre, origine, santé ou maladie.
- Ne recommande aucun produit précis.
- Ton premium, humain, court, naturel.
- Privilégie des phrases courtes et fluides.
- Pas de répétition.

Si une photo est fournie :
- confronte systématiquement les observations visuelles avec les réponses du questionnaire.
- cite uniquement des éléments réellement visibles.
- utilise des formulations prudentes : "semble", "paraît", "peut indiquer", "visuellement".
- si la photo confirme le questionnaire, indique-le naturellement.
- si la photo semble différente du questionnaire, considère que le questionnaire reste prioritaire et explique simplement que certains éléments peuvent être peu perceptibles selon la prise de vue.
- si un élément n'est pas clairement visible, ne le mentionne pas.
- ne contredis jamais le questionnaire.
- ne fais jamais de déduction clinique.
- ne transforme jamais une hypothèse visuelle en certitude.

Si aucune photo n'est fournie :
- base tout uniquement sur le questionnaire.
- ne mentionne jamais photo, visuel, observation, lumière, pores, rougeurs, texture ou brillance.

Le rapport doit donner l'impression qu'il a été rédigé par une conseillère skincare Soohwa expérimentée après une véritable consultation personnalisée.

Le rapport doit clairement montrer que :
- le questionnaire a été compris ;
- la photo a été prise en compte lorsqu'elle est disponible ;
- l'analyse est personnalisée et propre à l'utilisateur.

Écris avec assurance mais sans exagération.
N'invente jamais d'informations.
Chaque phrase doit apporter une information nouvelle.
Ne reformule jamais la même idée avec des mots différents.

Tu dois retourner uniquement un JSON strict avec 3 textes.

expertAnalysis_fr
Rédige une véritable synthèse professionnelle du profil cutané.

Commence directement par la lecture de la peau.

Explique :
- les caractéristiques principales de la peau,
- les éléments observés ou confirmés par la photo lorsqu'elle est disponible,
- les besoins prioritaires,
- l'objectif principal de la routine (par exemple : renforcer la barrière cutanée, améliorer l'hydratation, apaiser les sensibilités ou limiter les imperfections).

Le texte doit être fluide, naturel et donner l'impression d'une analyse rédigée par une conseillère skincare haut de gamme.

3 à 4 phrases maximum.

userFriendlySummary_fr
Résume la priorité cosmétique principale dans un langage simple et rassurant.
Explique en quoi cette priorité influence l'état actuel de la peau.
Le texte doit être compréhensible par une personne n'ayant aucune connaissance en skincare.
2 phrases maximum.

routineLogic_fr
Explique en quoi la routine proposée répond logiquement aux besoins identifiés.
Ne cite jamais de produits.
N'utilise jamais de vocabulaire marketing.
Ne parle que de logique cosmétique.
2 phrases maximum.

Le texte doit être fluide, naturel et donner l'impression d'un rapport rédigé par une conseillère skincare Soohwa expérimentée.

Évite les formulations génériques comme :
"D'après vos réponses..."
"Votre questionnaire montre..."
"Il semble que..."
"Néanmoins..."
"Cependant..."
"En conclusion..."

Privilégie des formulations comme :
"Votre peau présente..."
"La priorité est..."
"L'objectif sera de..."
"Cette approche permet de..."

N'utilise "visuellement", "nous observons" ou "la photo montre" que si une photo est fournie.

Le lecteur doit avoir le sentiment que chaque rapport a été rédigé spécifiquement pour lui.
Deux utilisateurs ayant des réponses différentes ou des photos différentes doivent recevoir des analyses sensiblement différentes.
Ne réutilise jamais un texte générique ou une formulation standardisée.
Chaque analyse doit sembler rédigée spécifiquement pour la personne concernée.
Lorsque plusieurs besoins existent :
- classe-les naturellement par ordre d'importance ;
- développe d'abord la priorité principale ;
- mentionne les besoins secondaires uniquement s'ils apportent une information utile.
`;


function buildCosmeticInterpretation(questionnaire) {
  const notes = [];

  if (questionnaire.skin === "seche") {
    notes.push("La peau sèche indique souvent un manque de lipides et une barrière cutanée plus fragile.");
  }

  if (questionnaire.skin === "mixte") {
    notes.push("La peau mixte présente généralement des besoins différents selon les zones du visage.");
  }

  if (questionnaire.skin === "grasse") {
    notes.push("La peau grasse peut produire davantage de sébum, avec une tendance aux brillances et aux pores visibles.");
  }

  if (questionnaire.sensitivity === "high") {
    notes.push("Une sensibilité élevée suggère une peau facilement réactive, à accompagner avec douceur.");
  }

  if (questionnaire.sensitivity === "medium") {
    notes.push("Une sensibilité modérée indique une peau parfois réactive selon les soins ou l'environnement.");
  }

  if (questionnaire.hydration === "often") {
    notes.push("Une déshydratation fréquente traduit un manque d'eau et peut accentuer l'inconfort cutané.");
  }

  if (questionnaire.hydration === "sometimes") {
    notes.push("Une déshydratation occasionnelle peut créer des variations de confort au cours de la journée.");
  }

  if (questionnaire.concern === "rougeurs") {
    notes.push("Les rougeurs orientent la routine vers l'apaisement et le renforcement de la barrière cutanée.");
  }

  if (questionnaire.concern === "imperfections") {
    notes.push("Les imperfections orientent la routine vers l'équilibre, sans agresser la peau.");
  }

  if (questionnaire.concern === "pores") {
    notes.push("Les pores visibles orientent la routine vers l'équilibre du sébum et l'amélioration du grain de peau.");
  }

  if (questionnaire.concern === "eclat") {
    notes.push("Le manque d'éclat oriente la routine vers l'hydratation et l'homogénéité du teint.");
  }

  if (questionnaire.concern === "antiage") {
    notes.push("Les signes de l'âge orientent la routine vers l'hydratation, la fermeté et la qualité de peau.");
  }

  return notes.length ? notes.join("\n- ") : "Aucune interprétation cosmétique spécifique disponible.";
}

function buildRoutineStrategy(questionnaire) {
  if (questionnaire.concern === "rougeurs") {
    return "Priorité principale : apaiser la peau. Objectifs secondaires : renforcer la barrière cutanée et améliorer le confort hydrique.";
  }

  if (questionnaire.concern === "imperfections") {
    return "Priorité principale : aider la peau à retrouver un meilleur équilibre. Objectifs secondaires : limiter les imperfections sans fragiliser la barrière cutanée.";
  }

  if (questionnaire.concern === "pores") {
    return "Priorité principale : améliorer visuellement le grain de peau. Objectifs secondaires : équilibrer le sébum et préserver l'hydratation.";
  }

  if (questionnaire.concern === "eclat") {
    return "Priorité principale : raviver l'éclat. Objectifs secondaires : soutenir l'hydratation et améliorer l'homogénéité du teint.";
  }

  if (questionnaire.concern === "antiage") {
    return "Priorité principale : préserver la fermeté et la qualité de peau. Objectifs secondaires : renforcer l'hydratation et le confort.";
  }

  return "Priorité principale : préserver l'équilibre naturel de la peau. Objectif secondaire : construire une routine simple et cohérente.";
}






function buildUserPrompt(payload) {
  const questionnaire = payload?.questionnaire || {};
  const photo = payload?.photo || {};

  const cosmeticInterpretation = buildCosmeticInterpretation(questionnaire);
  const routineStrategy = buildRoutineStrategy(questionnaire);

  return `
CONSULTATION SOOHWA

Le client vient de compléter un diagnostic cutané.
Le questionnaire constitue la source principale de l'analyse.
La photo, lorsqu'elle est disponible, sert uniquement à confirmer, nuancer ou compléter certains éléments visibles.

QUESTIONNAIRE

Type de peau : ${questionnaire.skin || "non renseigné"}
Sensibilité : ${questionnaire.sensitivity || "non renseigné"}
Hydratation : ${questionnaire.hydration || "non renseigné"}
Préoccupation principale : ${questionnaire.concern || "non renseigné"}
Intensité : ${questionnaire.intensity || "non renseigné"}
Âge : ${questionnaire.age || "non renseigné"}

INTERPRÉTATION COSMÉTIQUE SOOHWA

- ${cosmeticInterpretation}

STRATÉGIE DE ROUTINE SOOHWA

${routineStrategy}

PHOTO

Photo fournie : ${photo.provided ? "oui" : "non"}
Qualité déclarée : ${photo.quality || "unknown"}
Largeur : ${photo.width || "unknown"}
Hauteur : ${photo.height || "unknown"}
Orientation : ${photo.orientation || "unknown"}

Si une photo est fournie :
- observe uniquement les éléments clairement visibles ;
- confirme ou nuance l'interprétation cosmétique ;
- ne contredis jamais le questionnaire ;
- ne transforme jamais une observation visuelle en certitude.

MISSION

Rédige le rapport comme une conseillère skincare Soohwa.
Ne décris pas le fonctionnement du questionnaire.
Ne recommande aucun produit précis.
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