import { SOOHWA_KNOWLEDGE } from "./knowledge.js";

function createEmptyScores() {
  return {
    barrier: 0,
    hydration: 0,
    sensitivity: 0,
    redness: 0,
    sebum: 0,
    pores: 0,
    texture: 0,
    glow: 0,
    firmness: 0,
    comfort: 0,
    imperfections: 0
  };
}

function addScores(target, scores = {}) {
  Object.keys(scores).forEach(key => {
    target[key] = (target[key] || 0) + scores[key];
  });
}

function getTopScores(scores, limit = 5) {
  return Object.entries(scores)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, value]) => ({ key, value }));
}

export function buildSoohwaProfile(questionnaire = {}) {
  const scores = createEmptyScores();
  const notes = [];

  const skin = SOOHWA_KNOWLEDGE.skin[questionnaire.skin];
  const sensitivity = SOOHWA_KNOWLEDGE.sensitivity[questionnaire.sensitivity];
  const hydration = SOOHWA_KNOWLEDGE.hydration[questionnaire.hydration];
  const concern = SOOHWA_KNOWLEDGE.concern[questionnaire.concern];

  [skin, sensitivity, hydration, concern].forEach(item => {
    if (!item) return;
    addScores(scores, item.scores);
    if (item.note) notes.push(item.note);
  });

  const priorities = getTopScores(scores, 5);

  return {
    profileLabels: {
      skin: skin?.label || "non renseigné",
      sensitivity: sensitivity?.label || "non renseigné",
      hydration: hydration?.label || "non renseigné",
      concern: concern?.label || "non renseigné"
    },
    scores,
    priorities,
    mainPriority: priorities[0] || null,
    strategy: concern?.priority || "équilibre",
    notes
  };
}