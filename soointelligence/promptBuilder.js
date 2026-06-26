const PRIORITY_LABELS = {
  barrier: "barrière cutanée",
  hydration: "hydratation",
  sensitivity: "sensibilité",
  redness: "rougeurs",
  sebum: "équilibre du sébum",
  pores: "pores visibles",
  texture: "grain de peau",
  glow: "éclat",
  firmness: "fermeté",
  comfort: "confort cutané",
  imperfections: "imperfections"
};

export function buildSoohwaPrompt(profile, payload = {}) {
  const questionnaire = payload?.questionnaire || {};
  const photo = payload?.photo || {};

  const prioritiesText = profile.priorities
    .map((item, index) => `${index + 1}. ${PRIORITY_LABELS[item.key] || item.key} — niveau ${item.value}`)
    .join("\n");

  const notesText = profile.notes.length
    ? profile.notes.map(note => `- ${note}`).join("\n")
    : "- Aucun contexte cosmétique spécifique disponible.";

  return `
CONSULTATION SOOHWA

Le client vient de compléter un diagnostic cutané.
Le questionnaire constitue la source principale de l'analyse.
La photo, lorsqu'elle est disponible, sert uniquement à confirmer, nuancer ou compléter certains éléments visibles.

PROFIL DÉCLARÉ

Type de peau : ${profile.profileLabels.skin}
Sensibilité : ${profile.profileLabels.sensitivity}
Hydratation : ${profile.profileLabels.hydration}
Préoccupation principale : ${profile.profileLabels.concern}

RÉPONSES TECHNIQUES

Type de peau : ${questionnaire.skin || "non renseigné"}
Sensibilité : ${questionnaire.sensitivity || "non renseigné"}
Hydratation : ${questionnaire.hydration || "non renseigné"}
Préoccupation principale : ${questionnaire.concern || "non renseigné"}
Intensité : ${questionnaire.intensity || "non renseigné"}

ANALYSE COSMÉTIQUE SOOHWA

${notesText}

PRIORITÉS CALCULÉES PAR SOOHWA

${prioritiesText || "Aucune priorité calculée."}

STRATÉGIE DE ROUTINE

Stratégie principale : ${profile.strategy}
Objectif : traiter d'abord la priorité principale, puis accompagner les besoins secondaires sans surcharger la peau.

PHOTO

Photo fournie : ${photo.provided ? "oui" : "non"}
Qualité déclarée : ${photo.quality || "unknown"}
Largeur : ${photo.width || "unknown"}
Hauteur : ${photo.height || "unknown"}

MISSION

Rédige le rapport comme une conseillère skincare Soohwa.
Ne décris pas le fonctionnement du questionnaire.
Ne recommande aucun produit précis.
Retourne uniquement le JSON demandé.
`;
}