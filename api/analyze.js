import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY missing" });
    }

    const payload = req.body?.payload || req.body;

    const response = await client.responses.create({
      model: "gpt-5.5",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `Tu es SkinScan™, le module d’observation visuelle de Soohwa Intelligence™.
Tu fais uniquement des observations cosmétiques visibles.
Tu ne poses jamais de diagnostic médical.
Tu ne recommandes jamais de produits.
Réponds uniquement en JSON valide.`
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Analyse ce payload Soohwa. Si une photo est fournie, utilise-la comme observation visuelle. Payload : ${JSON.stringify(payload)}`
            },
            ...(payload?.photo?.provided && payload?.photo?.base64
              ? [
                  {
                    type: "input_image",
                    image_url: payload.photo.base64,
                    detail: "low"
                  }
                ]
              : [])
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "skinscan_result",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              usable: { type: "boolean" },
              confidence: { type: "number" },
              photoQuality: {
                type: "object",
                additionalProperties: false,
                properties: {
                  lighting: { type: "string" },
                  sharpness: { type: "string" },
                  framing: { type: "string" },
                  filter_suspected: { type: "boolean" }
                },
                required: ["lighting", "sharpness", "framing", "filter_suspected"]
              },
              observations: {
                type: "object",
                additionalProperties: false,
                properties: {
                  shine: { type: "string" },
                  redness: { type: "string" },
                  dryness: { type: "string" },
                  texture: { type: "string" },
                  pores: { type: "string" },
                  dullness: { type: "string" }
                },
                required: ["shine", "redness", "dryness", "texture", "pores", "dullness"]
              },
              needs: {
                type: "array",
                items: { type: "string" }
              },
              summary_fr: { type: "string" },
              limits_fr: { type: "string" }
            },
            required: [
              "usable",
              "confidence",
              "photoQuality",
              "observations",
              "needs",
              "summary_fr",
              "limits_fr"
            ]
          },
          strict: true
        }
      }
    });

    const result = JSON.parse(response.output_text);

    return res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}