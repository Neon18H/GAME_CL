# GAME_CL

Experiencia narrativa romántica interactiva con memoria emocional y generación dinámica de texto vía **DeepSeek Official API**.

## Integración oficial de IA

- **Proveedor:** DeepSeek Official API
- **Endpoint:** `https://api.deepseek.com/chat/completions`
- **Modelo:** `deepseek-chat`
- **Backend seguro:** Netlify Functions (`/netlify/functions/chat.js`)

## Seguridad

La API key **nunca** se expone en frontend.

Configura la variable de entorno en Netlify:

```bash
DEEPSEEK_API_KEY=tu_api_key
```

La función lee la credencial desde:

```js
process.env.DEEPSEEK_API_KEY
```

## Memoria emocional (localStorage)

Se guarda el perfil narrativo del jugador en localStorage:

- decisiones
- respuestas emocionales
- comportamiento del jugador

Estructura base:

```js
let emotionalProfile = {
  nostalgic: 0,
  distant: 0,
  affectionate: 0,
  avoidant: 0,
  hopeful: 0
};
```

## Flujo

1. Frontend envía capítulo + elección + memoria emocional a `/.netlify/functions/chat`.
2. Netlify Function construye prompt emocional narrativo.
3. Backend llama a DeepSeek oficial.
4. Se retorna una respuesta íntima/cinematográfica sin exponer credenciales.
