exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing DEEPSEEK_API_KEY" })
    };
  }

  try {
    const { chapter, scene, choice, emotionalProfile, decisions, recentResponses } = JSON.parse(event.body || "{}");

    if (!choice) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Missing player choice" })
      };
    }

    const systemPrompt = [
      "Eres la conciencia emocional de una historia romántica interactiva.",
      "Tu voz es cinematográfica, nostálgica, íntima, humana, elegante, emocional y profunda.",
      "No eres un chatbot; hablas como alguien que todavía ama profundamente a otra persona.",
      "Nunca digas que eres una IA ni menciones sistemas, políticas o modelos.",
      "No controles toda la historia: solo entrega pensamientos internos, reacciones emocionales, confesiones, recuerdos, frases adaptativas, diálogos emocionales y reflexiones cinematográficas.",
      "Responde en español en 3 a 5 líneas, con fuerza poética y naturalidad humana."
    ].join(" ");

    const userPrompt = `Capítulo: ${chapter || "Desconocido"}\nEscena: ${scene || "Sin escena"}\nElección del jugador: ${choice}\nPerfil emocional acumulado: ${JSON.stringify(emotionalProfile || {})}\nDecisiones previas: ${JSON.stringify(decisions || [])}\nRespuestas emocionales previas: ${JSON.stringify(recentResponses || [])}`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.9,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: data?.error?.message || "DeepSeek API error" })
      };
    }

    const text = data?.choices?.[0]?.message?.content?.trim();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text || "El silencio también confiesa lo que no nos atrevemos a nombrar." })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Unexpected server error", detail: error.message })
    };
  }
};
