export const SOOHWA_KNOWLEDGE = {
  skin: {
    seche: {
      label: "peau sèche",
      scores: {
        barrier: 3,
        hydration: 3,
        sensitivity: 1,
        sebum: 0
      },
      note: "La peau sèche présente souvent un manque de lipides, une barrière cutanée plus fragile et un besoin accru de confort."
    },

    normale: {
      label: "peau normale",
      scores: {
        barrier: 1,
        hydration: 1,
        sensitivity: 0,
        sebum: 0
      },
      note: "La peau normale présente généralement un équilibre cutané stable, avec des besoins principalement liés à l'entretien et à la prévention."
    },

    mixte: {
      label: "peau mixte",
      scores: {
        barrier: 1,
        hydration: 1,
        sensitivity: 0,
        sebum: 2,
        pores: 1
      },
      note: "La peau mixte présente souvent des besoins différents selon les zones du visage, avec une zone centrale plus sujette à la brillance."
    },

    grasse: {
      label: "peau grasse",
      scores: {
        barrier: 0,
        hydration: 1,
        sensitivity: 0,
        sebum: 3,
        pores: 2
      },
      note: "La peau grasse produit davantage de sébum et peut présenter des brillances, des pores visibles ou un grain de peau moins régulier."
    }
  },

  sensitivity: {
    high: {
      label: "très sensible",
      scores: {
        sensitivity: 4,
        barrier: 2,
        redness: 2
      },
      note: "Une sensibilité élevée évoque une peau facilement réactive, qui doit être accompagnée avec douceur."
    },

    medium: {
      label: "légèrement sensible",
      scores: {
        sensitivity: 2,
        barrier: 1,
        redness: 1
      },
      note: "Une sensibilité modérée peut traduire une peau parfois réactive selon les soins, la météo ou les agressions extérieures."
    },

    low: {
      label: "peu sensible",
      scores: {
        sensitivity: 0
      },
      note: "Une peau peu sensible tolère généralement mieux les soins et nécessite surtout une routine cohérente et équilibrée."
    }
  },

  hydration: {
    often: {
      label: "déshydratée",
      scores: {
        hydration: 4,
        barrier: 1,
        comfort: 2
      },
      note: "Une déshydratation fréquente traduit un manque d'eau et peut accentuer l'inconfort, les tiraillements ou le manque de souplesse."
    },

    sometimes: {
      label: "légèrement déshydratée",
      scores: {
        hydration: 2,
        comfort: 1
      },
      note: "Une déshydratation occasionnelle peut créer des variations de confort au cours de la journée."
    },

    rarely: {
      label: "confortable",
      scores: {
        hydration: 0
      },
      note: "Une peau confortable indique que le besoin d'hydratation reste présent mais n'est pas prioritaire."
    }
  },

  concern: {
    rougeurs: {
      label: "rougeurs",
      scores: {
        redness: 4,
        sensitivity: 2,
        barrier: 2
      },
      priority: "apaisement",
      note: "Les rougeurs orientent la routine vers l'apaisement, la réduction de la réactivité et le renforcement de la barrière cutanée."
    },

    imperfections: {
      label: "imperfections",
      scores: {
        imperfections: 4,
        sebum: 2,
        barrier: 1
      },
      priority: "équilibre",
      note: "Les imperfections orientent la routine vers un meilleur équilibre cutané, sans agresser ni fragiliser la peau."
    },

    pores: {
      label: "pores visibles",
      scores: {
        pores: 4,
        sebum: 2,
        texture: 2
      },
      priority: "grain de peau",
      note: "Les pores visibles orientent la routine vers l'équilibre du sébum et l'amélioration visuelle du grain de peau."
    },

    eclat: {
      label: "manque d'éclat",
      scores: {
        glow: 4,
        hydration: 1,
        texture: 1
      },
      priority: "éclat",
      note: "Le manque d'éclat oriente la routine vers l'hydratation, la fraîcheur du teint et l'homogénéité de la peau."
    },

    antiage: {
      label: "rides et perte de fermeté",
      scores: {
        firmness: 4,
        hydration: 2,
        barrier: 1
      },
      priority: "fermeté",
      note: "Les signes de l'âge orientent la routine vers l'hydratation, la fermeté et la qualité globale de la peau."
    }
  }
};