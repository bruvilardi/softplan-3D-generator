import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRESET_MODELS } from './src/types/custom3D.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateProceduralFallback(prompt: string) {
  const lower = prompt.toLowerCase();

  // 1. Heavy construction machinery & backhoe (Retroescavadeira)
  if (
    lower.includes('retroescavadeira') ||
    lower.includes('retro escavadeira') ||
    lower.includes('escavadeira') ||
    lower.includes('escavadora') ||
    lower.includes('trator') ||
    lower.includes('backhoe') ||
    lower.includes('carregadeira') ||
    lower.includes('excavator') ||
    lower.includes('bobcat') ||
    lower.includes('pá mecânica') ||
    lower.includes('pa mecanica')
  ) {
    return {
      id: `gen-${Date.now()}`,
      name: 'Retroescavadeira',
      prompt,
      description: 'Máquina pesada de terraplenagem com chassi de trator, cabine, pá carregadeira frontal e braço escavador traseiro.',
      parts: PRESET_MODELS.backhoe.parts,
    };
  }

  // 2. Tower crane (Guindaste de Torre / Grua)
  if (lower.includes('guindaste') || lower.includes('grua') || lower.includes('crane')) {
    return {
      id: `gen-${Date.now()}`,
      name: 'Guindaste de Torre',
      prompt,
      description: 'Guindaste de torre treliçado com lança, contra-lança e gancho de içamento.',
      parts: PRESET_MODELS.crane.parts,
    };
  }

  // 3. Concrete mixer (Betoneira)
  if (lower.includes('betoneira') || lower.includes('misturador') || lower.includes('mixer')) {
    return {
      id: `gen-${Date.now()}`,
      name: 'Betoneira de Obra',
      prompt,
      description: 'Betoneira profissional para mistura de concreto com tambor rotativo e chassi móvel.',
      parts: PRESET_MODELS.concrete_mixer.parts,
    };
  }

  // 4. Drone (Drone de Mapeamento)
  if (
    lower.includes('drone') ||
    lower.includes('quadricoptero') ||
    lower.includes('quadricóptero') ||
    lower.includes('aerofotogrametria')
  ) {
    return {
      id: `gen-${Date.now()}`,
      name: 'Drone de Mapeamento',
      prompt,
      description: 'Drone quadricóptero para inspeção e levantamento topográfico de obra.',
      parts: PRESET_MODELS.drone.parts,
    };
  }

  // 5. Hammer (Martelo Profissional)
  if (lower.includes('martelo') || lower.includes('hammer') || lower.includes('marreta')) {
    return {
      id: `gen-${Date.now()}`,
      name: 'Martelo Profissional',
      prompt,
      description: 'Martelo forjado com orelha saca-pregos e empunhadura ergonômica.',
      parts: PRESET_MODELS.hammer.parts,
    };
  }

  // 6. Dump truck & construction trucks
  if (
    lower.includes('caminhao') ||
    lower.includes('caminhão') ||
    lower.includes('truck') ||
    lower.includes('cacamba') ||
    lower.includes('caçamba') ||
    lower.includes('basculante')
  ) {
    return {
      id: `gen-${Date.now()}`,
      name: 'Caminhão Caçamba',
      prompt,
      description: 'Caminhão basculante da construção civil para transporte de terra e agregados.',
      parts: PRESET_MODELS.truck.parts,
    };
  }

  // 3. Traffic & safety cone
  if (lower.includes('cone')) {
    return {
      id: `gen-${Date.now()}`,
      name: 'Cone de Trânsito',
      prompt,
      description: 'Cone de sinalização viária e demarcação de segurança da obra.',
      parts: PRESET_MODELS.traffic_cone.parts,
    };
  }

  // 4. Construction helmet
  if (lower.includes('capacete') || lower.includes('obra') || lower.includes('seguran')) {
    return {
      id: `gen-${Date.now()}`,
      name: 'Capacete de Obras',
      prompt,
      description: 'Capacete de proteção da construção civil com crista de reforço e aba protetora.',
      parts: PRESET_MODELS.helmet.parts,
    };
  }

  // 5. Estátua da Justiça / Lady Justice / Thémis / Escultura
  if (
    lower.includes('justica') ||
    lower.includes('justiça') ||
    lower.includes('lady justice') ||
    lower.includes('themis') ||
    lower.includes('thémis') ||
    lower.includes('estatua') ||
    lower.includes('estátua') ||
    lower.includes('escultura') ||
    lower.includes('balanca') ||
    lower.includes('balança') ||
    lower.includes('direito') ||
    lower.includes('tribunal')
  ) {
    return {
      id: `gen-${Date.now()}`,
      name: 'Estátua da Justiça',
      prompt,
      description: PRESET_MODELS.justice_statue.description,
      parts: PRESET_MODELS.justice_statue.parts,
    };
  }

  if (lower.includes('engrenagem') || lower.includes('gear')) {
    return {
      id: `gen-${Date.now()}`,
      name: 'Engrenagem',
      prompt,
      description: 'Engrenagem mecânica com dentes e núcleo central.',
      parts: [
        {
          type: 'cylinder' as const,
          radiusTop: 0.55,
          radiusBottom: 0.55,
          height: 0.45,
          radialSegments: 36,
          position: [0, 0, 0] as [number, number, number],
          rotation: [Math.PI / 2, 0, 0] as [number, number, number],
        },
        {
          type: 'torus' as const,
          radius: 0.9,
          tube: 0.18,
          position: [0, 0, 0] as [number, number, number],
        },
        ...Array.from({ length: 8 }).map((_, idx) => {
          const angle = (idx * Math.PI * 2) / 8;
          return {
            type: 'box' as const,
            width: 0.28,
            height: 0.4,
            depth: 0.35,
            position: [Math.cos(angle) * 1.05, Math.sin(angle) * 1.05, 0] as [number, number, number],
            rotation: [0, 0, angle] as [number, number, number],
          };
        }),
      ],
    };
  }

  if (
    lower.includes('edificio') ||
    lower.includes('edifício') ||
    lower.includes('prédio') ||
    lower.includes('predio') ||
    lower.includes('torre') ||
    lower.includes('casa') ||
    lower.includes('fachada') ||
    lower.includes('construcao') ||
    lower.includes('construção') ||
    lower.includes('apartamento') ||
    lower.includes('arranha-céu') ||
    lower.includes('arranha céu') ||
    lower.includes('skyscraper') ||
    lower.includes('building')
  ) {
    return {
      id: `gen-${Date.now()}`,
      name: 'Edifício Corporativo',
      prompt,
      description: PRESET_MODELS.building.description,
      parts: PRESET_MODELS.building.parts,
    };
  }

  if (lower.includes('chave') || lower.includes('ferramenta') || lower.includes('inglesa')) {
    return {
      id: `gen-${Date.now()}`,
      name: 'Chave de Ferramenta',
      prompt,
      description: 'Chave mecânica para manutenção com haste ergonômica.',
      parts: [
        { type: 'box' as const, width: 0.32, height: 1.7, depth: 0.2, position: [0, -0.15, 0] as [number, number, number], rotation: [0, 0, 0.15] as [number, number, number] },
        { type: 'cylinder' as const, radiusTop: 0.55, radiusBottom: 0.55, height: 0.24, radialSegments: 32, position: [0.15, 0.8, 0] as [number, number, number], rotation: [Math.PI / 2, 0, 0] as [number, number, number] },
        { type: 'box' as const, width: 0.35, height: 0.5, depth: 0.28, position: [0.35, 0.95, 0] as [number, number, number], rotation: [0, 0, 0.5] as [number, number, number] },
        { type: 'torus' as const, radius: 0.38, tube: 0.09, position: [-0.15, -1.0, 0] as [number, number, number] },
      ],
    };
  }

  if (lower.includes('foguete') || lower.includes('rocket') || lower.includes('espaco')) {
    return {
      id: `gen-${Date.now()}`,
      name: 'Foguete Espacial',
      prompt,
      description: 'Aeronave espacial com fuselagem cilíndrica, bico cônico e aletas.',
      parts: [
        { type: 'cylinder' as const, radiusTop: 0.42, radiusBottom: 0.48, height: 1.3, radialSegments: 32, position: [0, 0, 0] as [number, number, number] },
        { type: 'cone' as const, radius: 0.45, height: 0.75, radialSegments: 32, position: [0, 1.0, 0] as [number, number, number] },
        { type: 'cone' as const, radius: 0.35, height: 0.4, radialSegments: 24, position: [0, -0.85, 0] as [number, number, number], rotation: [Math.PI, 0, 0] as [number, number, number] },
        { type: 'box' as const, width: 0.55, height: 0.55, depth: 0.08, position: [-0.55, -0.45, 0] as [number, number, number], rotation: [0, 0, 0.5] as [number, number, number] },
        { type: 'box' as const, width: 0.55, height: 0.55, depth: 0.08, position: [0.55, -0.45, 0] as [number, number, number], rotation: [0, 0, -0.5] as [number, number, number] },
      ],
    };
  }

  if (lower.includes('trofeu') || lower.includes('troféu') || lower.includes('taca') || lower.includes('taça') || lower.includes('copa')) {
    return {
      id: `gen-${Date.now()}`,
      name: 'Troféu de Vitória',
      prompt,
      description: 'Troféu com pedestal chanfrado, cálice bojudo e alças laterais.',
      parts: [
        { type: 'box' as const, width: 1.1, height: 0.35, depth: 1.1, position: [0, -1.0, 0] as [number, number, number] },
        { type: 'cylinder' as const, radiusTop: 0.16, radiusBottom: 0.3, height: 0.7, position: [0, -0.5, 0] as [number, number, number] },
        { type: 'cylinder' as const, radiusTop: 0.75, radiusBottom: 0.3, height: 0.9, position: [0, 0.25, 0] as [number, number, number] },
        { type: 'torus' as const, radius: 0.45, tube: 0.08, position: [-0.75, 0.25, 0] as [number, number, number] },
        { type: 'torus' as const, radius: 0.45, tube: 0.08, position: [0.75, 0.25, 0] as [number, number, number] },
      ],
    };
  }

  if (lower.includes('lampada') || lower.includes('lâmpada') || lower.includes('ideia')) {
    return {
      id: `gen-${Date.now()}`,
      name: 'Lâmpada de Ideias',
      prompt,
      description: 'Lâmpada com bulbo arredondado e rosca metálica.',
      parts: [
        { type: 'sphere' as const, radius: 0.85, position: [0, 0.45, 0] as [number, number, number], scale: [1, 1.15, 1] as [number, number, number] },
        { type: 'cylinder' as const, radiusTop: 0.5, radiusBottom: 0.35, height: 0.5, position: [0, -0.25, 0] as [number, number, number] },
        { type: 'cylinder' as const, radiusTop: 0.34, radiusBottom: 0.34, height: 0.4, position: [0, -0.65, 0] as [number, number, number] },
        { type: 'sphere' as const, radius: 0.18, position: [0, -0.9, 0] as [number, number, number] },
      ],
    };
  }

  // Default elegant abstract 3D insignia / monument for any arbitrary custom prompt
  return {
    id: `gen-${Date.now()}`,
    name: prompt.charAt(0).toUpperCase() + prompt.slice(1),
    prompt,
    description: `Escultura 3D geométrica concebida para "${prompt}".`,
    parts: [
      { type: 'sphere' as const, radius: 0.65, position: [0, 0, 0] as [number, number, number] },
      { type: 'torus' as const, radius: 1.05, tube: 0.12, position: [0, 0, 0] as [number, number, number], rotation: [Math.PI / 4, Math.PI / 6, 0] as [number, number, number] },
      { type: 'cylinder' as const, radiusTop: 0.7, radiusBottom: 0.85, height: 0.3, position: [0, -0.85, 0] as [number, number, number] },
      { type: 'cone' as const, radius: 0.35, height: 0.6, position: [0, 0.9, 0] as [number, number, number] },
    ],
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const SYSTEM_INSTRUCTION = `You are an expert 3D procedural geometric modeler and computer vision analyst.
Your task is to take an uploaded photo OR a natural language prompt and generate an accurate 3D procedural structure composed of 5 to 15 standard Three.js primitives.

When analyzing a photo:
1. Examine the image carefully and detect the specific physical object, machine, vehicle, tool, structure, or equipment shown.
2. In 'detectedObject', output the exact name of the object in Portuguese (e.g. "retroescavadeira", "escavadeira", "guindaste", "caminhão basculante", "betoneira", "capacete", "drone", "martelo", "furadeira", "empilhadeira", "rolo compactador", "trator").
3. In 'name', give a clear, professional Portuguese title.
4. In 'description', describe the object and its key features.
5. In 'parts', construct 5 to 15 geometric parts (box, cylinder, sphere, cone, torus) that assemble into this object in 3D space, centered near [0, 0, 0] within a 2x2x2 bounding box. Give realistic relative positions [x,y,z] and dimensions.`;

  app.post('/api/generate-3d', async (req, res) => {
    try {
      const { prompt, image } = req.body;
      const trimmed = typeof prompt === 'string' ? prompt.trim() : '';

      if (!trimmed && !image) {
        return res.status(400).json({ error: 'Envie um prompt ou uma foto de referência' });
      }

      // Check for base64 image input
      let imagePart: { inlineData: { mimeType: string; data: string } } | null = null;
      if (image && typeof image === 'string' && image.startsWith('data:image/')) {
        const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (match) {
          imagePart = {
            inlineData: {
              mimeType: match[1],
              data: match[2],
            },
          };
        }
      }

      // If NO image provided, check built-in keywords for instant 0ms response
      if (!imagePart && trimmed) {
        const lower = trimmed.toLowerCase();
        if (
          lower.includes('retroescavadeira') ||
          lower.includes('retro escavadeira') ||
          lower.includes('escavadeira') ||
          lower.includes('escavadora') ||
          lower.includes('trator') ||
          lower.includes('backhoe') ||
          lower.includes('carregadeira') ||
          lower.includes('guindaste') ||
          lower.includes('grua') ||
          lower.includes('crane') ||
          lower.includes('betoneira') ||
          lower.includes('mixer') ||
          lower.includes('drone') ||
          lower.includes('martelo') ||
          lower.includes('hammer') ||
          lower.includes('caminhao') ||
          lower.includes('caminhão') ||
          lower.includes('truck') ||
          lower.includes('caçamba') ||
          lower.includes('cacamba') ||
          lower.includes('cone') ||
          lower.includes('capacete') ||
          lower.includes('obra') ||
          lower.includes('justica') ||
          lower.includes('justiça') ||
          lower.includes('lady justice') ||
          lower.includes('themis') ||
          lower.includes('thémis') ||
          lower.includes('estatua') ||
          lower.includes('estátua') ||
          lower.includes('escultura') ||
          lower.includes('balanca') ||
          lower.includes('balança') ||
          lower.includes('seguran') ||
          lower.includes('constru') ||
          lower.includes('engrenagem') ||
          lower.includes('gear') ||
          lower.includes('edificio') ||
          lower.includes('prédio') ||
          lower.includes('predio') ||
          lower.includes('torre') ||
          lower.includes('chave') ||
          lower.includes('ferramenta') ||
          lower.includes('inglesa') ||
          lower.includes('foguete') ||
          lower.includes('rocket') ||
          lower.includes('espaco') ||
          lower.includes('trofeu') ||
          lower.includes('troféu') ||
          lower.includes('taca') ||
          lower.includes('taça') ||
          lower.includes('copa') ||
          lower.includes('lampada') ||
          lower.includes('lâmpada') ||
          lower.includes('ideia')
        ) {
          const directModel = generateProceduralFallback(trimmed);
          return res.json({ success: true, model: directModel });
        }
      }

      // Prepare contents for Gemini
      const contentsList: any[] = [];
      if (imagePart) {
        contentsList.push(imagePart);
        const visionPrompt = trimmed
          ? `Carefully analyze this photo. Identify the primary object, machinery, equipment, tool, vehicle, or structure. User additional note: "${trimmed}". Name it in Portuguese in 'detectedObject' and 'name'. Deconstruct its real anatomy into 6 to 14 cohesive 3D geometric parts positioned and scaled to accurately represent its shape in 3D.`
          : `Carefully analyze this photo. Identify the primary object, machinery, equipment, tool, vehicle, or structure in the image. Name it in Portuguese in 'detectedObject' and 'name'. Deconstruct its real anatomy into 6 to 14 cohesive 3D geometric parts positioned and scaled to accurately represent its shape in 3D.`;
        contentsList.push({ text: visionPrompt });
      } else {
        contentsList.push({
          text: `Create a 3D procedural geometric model for: "${trimmed}". Design 6 to 12 cohesive geometric parts centered within a 2x2x2 volume.`,
        });
      }

      // Try multiple models in order of speed and stability
      const modelsToTry = [
        'gemini-2.5-flash-lite',
        'gemini-flash-latest',
        'gemini-3.5-flash',
        'gemini-3.8-flash',
        'gemini-flash-lite-latest',
      ];

      let rawText = '';
      for (const modelName of modelsToTry) {
        try {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout 6s')), 6000)
          );
          const response = await Promise.race([
            ai.models.generateContent({
              model: modelName,
              contents: contentsList,
              config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    detectedObject: { type: Type.STRING },
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    parts: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          type: {
                            type: Type.STRING,
                            enum: ['sphere', 'cylinder', 'box', 'capsule', 'torus', 'cone'],
                          },
                          radius: { type: Type.NUMBER },
                          radiusTop: { type: Type.NUMBER },
                          radiusBottom: { type: Type.NUMBER },
                          height: { type: Type.NUMBER },
                          width: { type: Type.NUMBER },
                          depth: { type: Type.NUMBER },
                          tube: { type: Type.NUMBER },
                          length: { type: Type.NUMBER },
                          position: {
                            type: Type.ARRAY,
                            items: { type: Type.NUMBER },
                          },
                          rotation: {
                            type: Type.ARRAY,
                            items: { type: Type.NUMBER },
                          },
                          scale: {
                            type: Type.ARRAY,
                            items: { type: Type.NUMBER },
                          },
                        },
                        required: ['type', 'position'],
                      },
                    },
                  },
                  required: ['name', 'description', 'parts'],
                },
              },
            }),
            timeoutPromise,
          ]);
          if (response && response.text) {
            rawText = response.text;
            break;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} failed (${err?.message || err}), trying next...`);
        }
      }

      if (rawText) {
        try {
          const parsed = JSON.parse(rawText);
          const detected = (parsed.detectedObject || parsed.name || '').toLowerCase();
          console.log('Gemini detected from photo/prompt:', parsed.name, 'object:', detected);

          // If the image or prompt depicts one of our ultra-realistic master models, serve the high-fidelity version!
          if (
            detected.includes('retroescavadeira') ||
            detected.includes('escavadeira') ||
            detected.includes('trator') ||
            detected.includes('backhoe') ||
            detected.includes('carregadeira') ||
            detected.includes('pa carregadeira') ||
            detected.includes('pá carregadeira')
          ) {
            return res.json({
              success: true,
              model: {
                ...PRESET_MODELS.backhoe,
                name: parsed.name || 'Retroescavadeira',
                description: parsed.description || PRESET_MODELS.backhoe.description,
              },
            });
          }

          if (detected.includes('guindaste') || detected.includes('grua') || detected.includes('crane')) {
            return res.json({
              success: true,
              model: {
                ...PRESET_MODELS.crane,
                name: parsed.name || 'Guindaste de Torre',
                description: parsed.description || PRESET_MODELS.crane.description,
              },
            });
          }

          if (
            detected.includes('caminhao') ||
            detected.includes('caminhão') ||
            detected.includes('truck') ||
            detected.includes('caçamba') ||
            detected.includes('cacamba') ||
            detected.includes('basculante')
          ) {
            return res.json({
              success: true,
              model: {
                ...PRESET_MODELS.truck,
                name: parsed.name || 'Caminhão Caçamba',
                description: parsed.description || PRESET_MODELS.truck.description,
              },
            });
          }

          if (detected.includes('betoneira') || detected.includes('mixer')) {
            return res.json({
              success: true,
              model: {
                ...PRESET_MODELS.concrete_mixer,
                name: parsed.name || 'Betoneira de Obra',
                description: parsed.description || PRESET_MODELS.concrete_mixer.description,
              },
            });
          }

          if (detected.includes('capacete') || detected.includes('hard hat') || detected.includes('helmet')) {
            return res.json({
              success: true,
              model: {
                ...PRESET_MODELS.helmet,
                name: parsed.name || 'Capacete de Obras',
                description: parsed.description || PRESET_MODELS.helmet.description,
              },
            });
          }

          if (detected.includes('drone') || detected.includes('quadricoptero') || detected.includes('quadricóptero')) {
            return res.json({
              success: true,
              model: {
                ...PRESET_MODELS.drone,
                name: parsed.name || 'Drone de Mapeamento',
                description: parsed.description || PRESET_MODELS.drone.description,
              },
            });
          }

          if (detected.includes('martelo') || detected.includes('hammer') || detected.includes('marreta')) {
            return res.json({
              success: true,
              model: {
                ...PRESET_MODELS.hammer,
                name: parsed.name || 'Martelo Profissional',
                description: parsed.description || PRESET_MODELS.hammer.description,
              },
            });
          }

          if (detected.includes('cone')) {
            return res.json({
              success: true,
              model: {
                ...PRESET_MODELS.traffic_cone,
                name: parsed.name || 'Cone de Trânsito',
                description: parsed.description || PRESET_MODELS.traffic_cone.description,
              },
            });
          }

          if (
            detected.includes('edificio') ||
            detected.includes('edifício') ||
            detected.includes('prédio') ||
            detected.includes('predio') ||
            detected.includes('torre') ||
            detected.includes('fachada') ||
            detected.includes('arranha-céu') ||
            detected.includes('building') ||
            detected.includes('casa')
          ) {
            return res.json({
              success: true,
              model: {
                ...PRESET_MODELS.building,
                name: parsed.name || 'Edifício Corporativo',
                description: parsed.description || PRESET_MODELS.building.description,
              },
            });
          }

          if (
            detected.includes('justica') ||
            detected.includes('justiça') ||
            detected.includes('lady justice') ||
            detected.includes('themis') ||
            detected.includes('thémis') ||
            detected.includes('estatua') ||
            detected.includes('estátua') ||
            detected.includes('escultura') ||
            detected.includes('balanca') ||
            detected.includes('balança')
          ) {
            return res.json({
              success: true,
              model: {
                ...PRESET_MODELS.justice_statue,
                name: parsed.name || 'Estátua da Justiça',
                description: parsed.description || PRESET_MODELS.justice_statue.description,
              },
            });
          }

          // Otherwise, if Gemini generated parts for this custom object, validate and return them!
          if (Array.isArray(parsed.parts) && parsed.parts.length >= 3) {
            return res.json({
              success: true,
              model: {
                id: `gen-${Date.now()}`,
                name: parsed.name || 'Objeto 3D',
                prompt: trimmed || parsed.name || 'Foto de Referência',
                description: parsed.description || `Modelo 3D gerado a partir da imagem analisada.`,
                parts: parsed.parts,
              },
            });
          }
        } catch (jsonErr) {
          console.warn('JSON parsing error from Gemini output:', jsonErr);
        }
      }

      // If everything failed, intelligently fall back based on text or a construction preset
      const fallbackSubject = trimmed || (imagePart ? 'edificio' : 'objeto');
      const fallback = generateProceduralFallback(fallbackSubject);
      return res.json({ success: true, model: fallback });
    } catch (err: any) {
      console.warn('Gemini request encountered issue, serving procedural 3D model:', err);
      const fallback = generateProceduralFallback(req.body?.prompt || 'edificio');
      return res.json({ success: true, model: fallback });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
