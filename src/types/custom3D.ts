import { buildStatueOfJustice } from '../utils/justiceStatueGenerator.ts';

export interface PathCommand {
  op: 'move' | 'line' | 'quad' | 'bezier' | 'arc';
  x: number;
  y: number;
  cpX?: number;
  cpY?: number;
  cp1X?: number;
  cp1Y?: number;
  cp2X?: number;
  cp2Y?: number;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
}

export interface ExtrudePart {
  type: 'extrude';
  shape?: PathCommand[];
  depth?: number;
  bevelEnabled?: boolean;
  bevelSize?: number;
  bevelThickness?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface SpherePart {
  type: 'sphere';
  radius: number;
  phiLength?: number;
  thetaStart?: number;
  thetaLength?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface CylinderPart {
  type: 'cylinder';
  radiusTop: number;
  radiusBottom: number;
  height: number;
  radialSegments?: number;
  thetaStart?: number;
  thetaLength?: number;
  phiLength?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface BoxPart {
  type: 'box';
  width: number;
  height: number;
  depth: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface TorusPart {
  type: 'torus';
  radius: number;
  tube: number;
  arc?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface CapsulePart {
  type: 'capsule';
  radius: number;
  length: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface ConePart {
  type: 'cone';
  radius: number;
  height: number;
  radialSegments?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export type Model3DPart =
  | ExtrudePart
  | SpherePart
  | CylinderPart
  | BoxPart
  | TorusPart
  | CapsulePart
  | ConePart;

export interface Custom3DModel {
  id: string;
  name: string;
  prompt: string;
  description?: string;
  parts: Model3DPart[];
  gltfUrl?: string;
  importedScene?: any;
}

let _cachedJusticeStatue: any = null;

export const PRESET_MODELS: Record<string, Custom3DModel> = {
  helmet: {
    id: 'helmet',
    name: 'Capacete de Obras',
    prompt: 'capacete de obras',
    description: 'Capacete de segurança profissional da construção civil com crista de impacto, canaletas de rigidez, aba frontal curva e defletor de nuca.',
    parts: [
      // Cúpula anatômica principal
      {
        type: 'sphere',
        radius: 0.96,
        phiLength: Math.PI * 2,
        thetaStart: 0,
        thetaLength: Math.PI * 0.52,
        position: [0, -0.04, 0],
        scale: [1.02, 0.88, 1.24],
      },
      // Crista central superior de impacto aerodinâmica
      {
        type: 'box',
        width: 0.18,
        height: 0.22,
        depth: 1.85,
        position: [0, 0.68, 0],
        scale: [1, 1, 1],
      },
      // Arredondamento do topo da crista
      {
        type: 'cylinder',
        radiusTop: 0.1,
        radiusBottom: 0.1,
        height: 1.7,
        radialSegments: 32,
        position: [0, 0.76, 0],
        rotation: [Math.PI / 2, 0, 0],
      },
      // Nervuras laterais de reforço esquerda e direita
      {
        type: 'box',
        width: 0.08,
        height: 0.1,
        depth: 1.35,
        position: [-0.42, 0.42, -0.05],
        rotation: [0, 0, -0.4],
      },
      {
        type: 'box',
        width: 0.08,
        height: 0.1,
        depth: 1.35,
        position: [0.42, 0.42, -0.05],
        rotation: [0, 0, 0.4],
      },
      // Aba frontal estendida com inclinação solar (Visor)
      {
        type: 'cylinder',
        radiusTop: 1.28,
        radiusBottom: 1.28,
        height: 0.06,
        radialSegments: 48,
        position: [0, -0.1, 0.25],
        scale: [1.02, 1, 1.4],
      },
      // Defletor traseiro de nuca para escoamento de água
      {
        type: 'cylinder',
        radiusTop: 1.22,
        radiusBottom: 1.22,
        height: 0.05,
        radialSegments: 48,
        position: [0, -0.12, -0.22],
        scale: [1.02, 1, 1.2],
      },
      // Rebordo perimetral de escoamento (goteira/calha)
      {
        type: 'torus',
        radius: 1.08,
        tube: 0.045,
        position: [0, -0.07, 0.06],
        rotation: [Math.PI / 2, 0, 0],
        scale: [1, 1.22, 1],
      },
      // Suporte frontal de identificação/emblema
      {
        type: 'box',
        width: 0.38,
        height: 0.25,
        depth: 0.08,
        position: [0, 0.24, 1.05],
        rotation: [-0.35, 0, 0],
      },
      // Encaixes laterais de acessórios (protetor auricular / abafador)
      {
        type: 'box',
        width: 0.06,
        height: 0.16,
        depth: 0.18,
        position: [-0.98, -0.02, 0],
      },
      {
        type: 'box',
        width: 0.06,
        height: 0.16,
        depth: 0.18,
        position: [0.98, -0.02, 0],
      },
    ],
  },
  gear: {
    id: 'gear',
    name: 'Engrenagem',
    prompt: 'engrenagem de precisão',
    description: 'Engrenagem mecânica com dentes e núcleo vazado.',
    parts: [
      // Central hub
      {
        type: 'cylinder',
        radiusTop: 0.55,
        radiusBottom: 0.55,
        height: 0.45,
        radialSegments: 36,
        position: [0, 0, 0],
        rotation: [Math.PI / 2, 0, 0],
      },
      // Outer ring
      {
        type: 'torus',
        radius: 0.9,
        tube: 0.18,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
      },
      // Gear teeth around circle
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
      // Center bore hole ring
      {
        type: 'cylinder',
        radiusTop: 0.25,
        radiusBottom: 0.25,
        height: 0.5,
        position: [0, 0, 0],
        rotation: [Math.PI / 2, 0, 0],
      },
    ],
  },
  building: {
    id: 'building',
    name: 'Edifício Corporativo',
    prompt: 'edifício corporativo moderno',
    description: 'Torre corporativa contemporânea com fachada em balanço, átrio térreo, recuos arquitetônicos, cobertura e antena de sinal.',
    parts: [
      // 1. Fundação e praça de entrada (Plaza térrea)
      { type: 'box', width: 2.1, height: 0.1, depth: 1.8, position: [0, -1.05, 0] },
      // 2. Base / Átrio de entrada envidraçado (Térreo duplo)
      { type: 'box', width: 1.6, height: 0.45, depth: 1.3, position: [0, -0.78, 0] },
      // Marquise da entrada principal
      { type: 'box', width: 1.1, height: 0.04, depth: 0.5, position: [0, -0.7, 0.85] },
      // 3. Torre principal (Corpo do edifício)
      { type: 'box', width: 1.25, height: 1.35, depth: 1.05, position: [0, 0.12, 0] },
      // Fachada em balanço frontal (Curtain wall)
      { type: 'box', width: 0.95, height: 1.15, depth: 0.12, position: [0, 0.15, 0.56] },
      // Frisos horizontais entre andares (Pavimentos)
      { type: 'box', width: 1.32, height: 0.05, depth: 1.12, position: [0, -0.25, 0] },
      { type: 'box', width: 1.32, height: 0.05, depth: 1.12, position: [0, 0.15, 0] },
      { type: 'box', width: 1.32, height: 0.05, depth: 1.12, position: [0, 0.55, 0] },
      // 4. Recuo superior (Penthouse / Pavimento executivo)
      { type: 'box', width: 0.95, height: 0.45, depth: 0.85, position: [-0.08, 1.0, 0] },
      // Caixa d'água e barrilete técnico na cobertura
      { type: 'box', width: 0.65, height: 0.28, depth: 0.55, position: [0.05, 1.35, -0.05] },
      // Heliponto / Terraço
      { type: 'cylinder', radiusTop: 0.38, radiusBottom: 0.38, height: 0.04, radialSegments: 24, position: [-0.15, 1.25, 0.15] },
      // 5. Antena de telecomunicação / Spire de topo
      { type: 'cylinder', radiusTop: 0.015, radiusBottom: 0.045, height: 0.85, position: [0.12, 1.85, -0.05] },
      { type: 'sphere', radius: 0.035, position: [0.12, 2.28, -0.05] },
    ],
  },
  wrench: {
    id: 'wrench',
    name: 'Chave de Ferramenta',
    prompt: 'chave inglesa ferramenta',
    description: 'Chave mecânica com empunhadura e mandíbulas de aperto.',
    parts: [
      // Handle
      {
        type: 'box',
        width: 0.32,
        height: 1.7,
        depth: 0.2,
        position: [0, -0.15, 0],
        rotation: [0, 0, 0.15],
      },
      // Top Head ring
      {
        type: 'cylinder',
        radiusTop: 0.55,
        radiusBottom: 0.55,
        height: 0.24,
        radialSegments: 32,
        position: [0.15, 0.8, 0],
        rotation: [Math.PI / 2, 0, 0],
      },
      // Open jaw cut/teeth
      {
        type: 'box',
        width: 0.35,
        height: 0.5,
        depth: 0.28,
        position: [0.35, 0.95, 0],
        rotation: [0, 0, 0.5],
      },
      // Bottom closed ring
      {
        type: 'torus',
        radius: 0.38,
        tube: 0.09,
        position: [-0.15, -1.0, 0],
      },
    ],
  },
  rocket: {
    id: 'rocket',
    name: 'Foguete Espacial',
    prompt: 'foguete espacial',
    description: 'Foguete com cápsula pontiaguda, aletas estabilizadoras e propulsor.',
    parts: [
      // Fuselage / body
      {
        type: 'cylinder',
        radiusTop: 0.42,
        radiusBottom: 0.48,
        height: 1.3,
        radialSegments: 32,
        position: [0, 0, 0],
      },
      // Nose cone
      {
        type: 'cone',
        radius: 0.45,
        height: 0.75,
        radialSegments: 32,
        position: [0, 1.0, 0],
      },
      // Thruster engine
      {
        type: 'cone',
        radius: 0.35,
        height: 0.4,
        radialSegments: 24,
        position: [0, -0.85, 0],
        rotation: [Math.PI, 0, 0],
      },
      // Fin left
      {
        type: 'box',
        width: 0.55,
        height: 0.55,
        depth: 0.08,
        position: [-0.55, -0.45, 0],
        rotation: [0, 0, 0.5],
      },
      // Fin right
      {
        type: 'box',
        width: 0.55,
        height: 0.55,
        depth: 0.08,
        position: [0.55, -0.45, 0],
        rotation: [0, 0, -0.5],
      },
      // Porthole cabin window
      {
        type: 'torus',
        radius: 0.2,
        tube: 0.04,
        position: [0, 0.25, 0.45],
        rotation: [0, 0, 0],
      },
    ],
  },
  backhoe: {
    id: 'backhoe',
    name: 'Retroescavadeira',
    prompt: 'retroescavadeira',
    description: 'Retroescavadeira pesada articulada com chassi de trator, cabine FOPS/ROPS, pá frontal com dentes, lança curva banana, braço escavador, concha traseira com dentes e sapatas estabilizadoras.',
    parts: [
      // 1. CHASSI E ESTRUTURA INFERIOR
      { type: 'box', width: 0.72, height: 0.28, depth: 1.45, position: [0, -0.15, 0] },
      { type: 'box', width: 0.88, height: 0.14, depth: 0.14, position: [0, -0.26, 0.52] }, // Eixo dianteiro
      { type: 'box', width: 1.05, height: 0.18, depth: 0.18, position: [0, -0.15, -0.42] }, // Eixo traseiro
      { type: 'box', width: 0.74, height: 0.36, depth: 0.22, position: [0, 0.02, 0.76] }, // Contrapeso/Pára-choque frontal
      { type: 'cylinder', radiusTop: 0.035, radiusBottom: 0.035, height: 0.2, position: [0, -0.06, 0.9] }, // Pino de engate

      // 2. CAPÔ DO MOTOR AERODINÂMICO
      { type: 'box', width: 0.65, height: 0.36, depth: 0.65, position: [0, 0.18, 0.38] },
      { type: 'box', width: 0.62, height: 0.26, depth: 0.3, position: [0, 0.12, 0.72], rotation: [-0.25, 0, 0] }, // Focinho inclinado
      { type: 'box', width: 0.54, height: 0.24, depth: 0.04, position: [0, 0.09, 0.88] }, // Grade frontal do radiador

      // Escapamento vertical com curva de saída
      { type: 'cylinder', radiusTop: 0.035, radiusBottom: 0.035, height: 0.72, position: [0.32, 0.55, 0.22] },
      { type: 'cylinder', radiusTop: 0.065, radiusBottom: 0.065, height: 0.32, position: [0.32, 0.45, 0.22] }, // Silenciador
      { type: 'torus', radius: 0.05, tube: 0.03, position: [0.34, 0.92, 0.22] }, // Ponteira curva

      // Snorkel / Filtro de ar ciclônico externo
      { type: 'cylinder', radiusTop: 0.028, radiusBottom: 0.028, height: 0.58, position: [-0.32, 0.5, 0.22] },
      { type: 'cylinder', radiusTop: 0.075, radiusBottom: 0.075, height: 0.12, position: [-0.32, 0.78, 0.22] }, // Copo ciclônico

      // 3. CABINE DO OPERADOR (ROPS / FOPS)
      { type: 'box', width: 0.82, height: 0.08, depth: 0.82, position: [0, 0.15, -0.15] }, // Plataforma da cabine
      // Colunas estruturais de proteção contra capotamento
      { type: 'cylinder', radiusTop: 0.032, radiusBottom: 0.032, height: 0.78, position: [-0.36, 0.55, 0.18], rotation: [0.12, 0, 0.06] },
      { type: 'cylinder', radiusTop: 0.032, radiusBottom: 0.032, height: 0.78, position: [0.36, 0.55, 0.18], rotation: [0.12, 0, -0.06] },
      { type: 'cylinder', radiusTop: 0.032, radiusBottom: 0.032, height: 0.78, position: [-0.36, 0.55, -0.48], rotation: [-0.08, 0, 0.06] },
      { type: 'cylinder', radiusTop: 0.032, radiusBottom: 0.032, height: 0.78, position: [0.36, 0.55, -0.48], rotation: [-0.08, 0, -0.06] },
      // Núcleo envidraçado
      { type: 'box', width: 0.74, height: 0.7, depth: 0.7, position: [0, 0.55, -0.15] },
      // Teto protetor com quebra-sol frontal
      { type: 'box', width: 0.88, height: 0.08, depth: 0.88, position: [0, 0.94, -0.15] },
      { type: 'box', width: 0.88, height: 0.04, depth: 0.16, position: [0, 0.92, 0.32], rotation: [-0.2, 0, 0] },
      // Faróis de trabalho no teto (trabalho noturno)
      { type: 'box', width: 0.1, height: 0.06, depth: 0.06, position: [-0.32, 0.93, 0.32] },
      { type: 'box', width: 0.1, height: 0.06, depth: 0.06, position: [0.32, 0.93, 0.32] },
      { type: 'box', width: 0.1, height: 0.06, depth: 0.06, position: [-0.32, 0.93, -0.6] },
      { type: 'box', width: 0.1, height: 0.06, depth: 0.06, position: [0.32, 0.93, -0.6] },
      // Giroflex / Luz de alerta
      { type: 'cylinder', radiusTop: 0.045, radiusBottom: 0.045, height: 0.1, position: [0.25, 1.02, -0.15] },
      // Espelhos retrovisores com hastes
      { type: 'box', width: 0.04, height: 0.14, depth: 0.08, position: [-0.46, 0.72, 0.25] },
      { type: 'cylinder', radiusTop: 0.012, radiusBottom: 0.012, height: 0.16, position: [-0.42, 0.65, 0.22], rotation: [0, 0, -0.5] },
      { type: 'box', width: 0.04, height: 0.14, depth: 0.08, position: [0.46, 0.72, 0.25] },
      { type: 'cylinder', radiusTop: 0.012, radiusBottom: 0.012, height: 0.16, position: [0.42, 0.65, 0.22], rotation: [0, 0, 0.5] },
      // Estribos / Degraus de acesso
      { type: 'box', width: 0.06, height: 0.03, depth: 0.32, position: [-0.5, -0.06, -0.1] },
      { type: 'box', width: 0.06, height: 0.03, depth: 0.32, position: [-0.5, -0.18, -0.1] },
      { type: 'box', width: 0.06, height: 0.03, depth: 0.32, position: [0.5, -0.06, -0.1] },
      { type: 'box', width: 0.06, height: 0.03, depth: 0.32, position: [0.5, -0.18, -0.1] },

      // 4. RODAS PESADAS COM RODAGEM DE TRATOR
      // Rodas traseiras grandes (tração)
      { type: 'cylinder', radiusTop: 0.46, radiusBottom: 0.46, height: 0.26, radialSegments: 48, position: [-0.54, -0.15, -0.42], rotation: [0, 0, Math.PI / 2] },
      { type: 'cylinder', radiusTop: 0.46, radiusBottom: 0.46, height: 0.26, radialSegments: 48, position: [0.54, -0.15, -0.42], rotation: [0, 0, Math.PI / 2] },
      // Rodas dianteiras direcionais
      { type: 'cylinder', radiusTop: 0.3, radiusBottom: 0.3, height: 0.2, radialSegments: 48, position: [-0.48, -0.28, 0.52], rotation: [0, 0, Math.PI / 2] },
      { type: 'cylinder', radiusTop: 0.3, radiusBottom: 0.3, height: 0.2, radialSegments: 48, position: [0.48, -0.28, 0.52], rotation: [0, 0, Math.PI / 2] },
      // Cubos e aros de aço estampados
      { type: 'cylinder', radiusTop: 0.26, radiusBottom: 0.26, height: 0.29, position: [-0.55, -0.15, -0.42], rotation: [0, 0, Math.PI / 2] },
      { type: 'cylinder', radiusTop: 0.26, radiusBottom: 0.26, height: 0.29, position: [0.55, -0.15, -0.42], rotation: [0, 0, Math.PI / 2] },
      { type: 'cylinder', radiusTop: 0.1, radiusBottom: 0.1, height: 0.32, position: [-0.56, -0.15, -0.42], rotation: [0, 0, Math.PI / 2] },
      { type: 'cylinder', radiusTop: 0.1, radiusBottom: 0.1, height: 0.32, position: [0.56, -0.15, -0.42], rotation: [0, 0, Math.PI / 2] },
      { type: 'cylinder', radiusTop: 0.18, radiusBottom: 0.18, height: 0.22, position: [-0.49, -0.28, 0.52], rotation: [0, 0, Math.PI / 2] },
      { type: 'cylinder', radiusTop: 0.18, radiusBottom: 0.18, height: 0.22, position: [0.49, -0.28, 0.52], rotation: [0, 0, Math.PI / 2] },
      // Garras de tração (Cleats) nos pneus traseiros
      ...[0, 0.52, 1.05, 1.57, 2.09, 2.62, 3.14, 3.66, 4.19, 4.71, 5.23, 5.76].flatMap((ang) => [
        {
          type: 'box' as const,
          width: 0.24,
          height: 0.05,
          depth: 0.08,
          position: [-0.54, -0.15 + Math.cos(ang) * 0.46, -0.42 + Math.sin(ang) * 0.46] as [number, number, number],
          rotation: [ang, 0, 0] as [number, number, number],
        },
        {
          type: 'box' as const,
          width: 0.24,
          height: 0.05,
          depth: 0.08,
          position: [0.54, -0.15 + Math.cos(ang) * 0.46, -0.42 + Math.sin(ang) * 0.46] as [number, number, number],
          rotation: [ang, 0, 0] as [number, number, number],
        },
      ]),

      // 5. PÁ CARREGADEIRA FRONTAL (FRONT LOADER)
      // Braços de elevação angulados duplos
      { type: 'box', width: 0.08, height: 0.12, depth: 0.55, position: [-0.42, 0.08, 0.72], rotation: [-0.55, 0, 0] },
      { type: 'box', width: 0.08, height: 0.12, depth: 0.6, position: [-0.42, -0.12, 1.08], rotation: [-0.15, 0, 0] },
      { type: 'box', width: 0.08, height: 0.12, depth: 0.55, position: [0.42, 0.08, 0.72], rotation: [-0.55, 0, 0] },
      { type: 'box', width: 0.08, height: 0.12, depth: 0.6, position: [0.42, -0.12, 1.08], rotation: [-0.15, 0, 0] },
      // Tubo de torção transversal de reforço
      { type: 'cylinder', radiusTop: 0.045, radiusBottom: 0.045, height: 0.88, position: [0, 0.04, 0.88], rotation: [0, 0, Math.PI / 2] },
      // Cilindros hidráulicos de elevação
      { type: 'cylinder', radiusTop: 0.04, radiusBottom: 0.04, height: 0.55, position: [-0.36, -0.05, 0.55], rotation: [-0.75, 0, 0] },
      { type: 'cylinder', radiusTop: 0.04, radiusBottom: 0.04, height: 0.55, position: [0.36, -0.05, 0.55], rotation: [-0.75, 0, 0] },
      // Cilindro central de inclinação da caçamba e mecanismo de 4 barras
      { type: 'cylinder', radiusTop: 0.045, radiusBottom: 0.045, height: 0.48, position: [0, 0.04, 1.02], rotation: [-0.25, 0, 0] },
      { type: 'box', width: 0.08, height: 0.2, depth: 0.08, position: [0, 0.08, 1.22] },
      // Caçamba dianteira em formato concha
      { type: 'cylinder', radiusTop: 0.32, radiusBottom: 0.32, height: 1.35, phiLength: Math.PI * 0.75, position: [0, -0.2, 1.3], rotation: [0, Math.PI / 2, Math.PI * 0.7] },
      { type: 'box', width: 1.35, height: 0.06, depth: 0.38, position: [0, -0.38, 1.48] }, // Lâmina de desgaste inferior
      { type: 'box', width: 1.35, height: 0.1, depth: 0.05, position: [0, 0.06, 1.26], rotation: [0.25, 0, 0] }, // Grade de contenção superior
      { type: 'box', width: 0.06, height: 0.36, depth: 0.45, position: [-0.67, -0.18, 1.4] }, // Lateral esquerda
      { type: 'box', width: 0.06, height: 0.36, depth: 0.45, position: [0.67, -0.18, 1.4] }, // Lateral direita
      // 6 Dentes de corte forjados na pá frontal
      ...[-0.55, -0.33, -0.11, 0.11, 0.33, 0.55].map((xPos) => ({
        type: 'box' as const,
        width: 0.06,
        height: 0.04,
        depth: 0.12,
        position: [xPos, -0.38, 1.68] as [number, number, number],
      })),

      // 6. BRAÇO ESCAVADOR TRASEIRO (BACKHOE EXCAVATOR)
      // Torre giratória (Kingpost) e pistões de giro
      { type: 'cylinder', radiusTop: 0.14, radiusBottom: 0.14, height: 0.48, position: [0, 0.05, -0.72] },
      { type: 'cylinder', radiusTop: 0.035, radiusBottom: 0.035, height: 0.35, position: [-0.2, -0.05, -0.65], rotation: [0, 0.4, 0] },
      { type: 'cylinder', radiusTop: 0.035, radiusBottom: 0.035, height: 0.35, position: [0.2, -0.05, -0.65], rotation: [0, -0.4, 0] },
      // Lança curva tipo "Banana Boom" articulada em 3 seções
      { type: 'box', width: 0.14, height: 0.16, depth: 0.6, position: [0, 0.32, -0.92], rotation: [-0.85, 0, 0] },
      { type: 'box', width: 0.14, height: 0.16, depth: 0.5, position: [0, 0.58, -1.22], rotation: [-0.3, 0, 0] },
      { type: 'box', width: 0.14, height: 0.16, depth: 0.55, position: [0, 0.68, -1.58], rotation: [0.4, 0, 0] },
      // Pistão hidráulico principal de elevação da lança
      { type: 'cylinder', radiusTop: 0.045, radiusBottom: 0.045, height: 0.65, position: [0, 0.28, -0.98], rotation: [-0.65, 0, 0] },
      // Braço secundário (Dipper Stick)
      { type: 'box', width: 0.12, height: 0.14, depth: 0.75, position: [0, 0.52, -1.88], rotation: [0.85, 0, 0] },
      // Pistão hidráulico do braço secundário
      { type: 'cylinder', radiusTop: 0.04, radiusBottom: 0.04, height: 0.55, position: [0, 0.72, -1.65], rotation: [0.25, 0, 0] },
      // Articulação e pistão da concha (Bucket Linkage)
      { type: 'cylinder', radiusTop: 0.035, radiusBottom: 0.035, height: 0.42, position: [0, 0.42, -1.95], rotation: [0.65, 0, 0] },
      { type: 'box', width: 0.08, height: 0.18, depth: 0.06, position: [0, 0.24, -2.08] },
      // Concha de escavação curva com orelhas de engate
      { type: 'cylinder', radiusTop: 0.22, radiusBottom: 0.22, height: 0.36, phiLength: Math.PI * 0.85, position: [0, 0.15, -2.18], rotation: [0, Math.PI / 2, Math.PI * 0.8] },
      { type: 'box', width: 0.18, height: 0.14, depth: 0.18, position: [0, 0.25, -2.12] },
      // 4 Dentes pontiagudos de escavação na concha
      ...[-0.12, -0.04, 0.04, 0.12].map((xPos) => ({
        type: 'box' as const,
        width: 0.04,
        height: 0.04,
        depth: 0.1,
        position: [xPos, 0.02, -2.32] as [number, number, number],
        rotation: [0.35, 0, 0] as [number, number, number],
      })),

      // 7. SAPATAS ESTABILIZADORAS LATERAIS (OUTRIGGERS)
      { type: 'box', width: 0.09, height: 0.55, depth: 0.09, position: [-0.55, -0.16, -0.68], rotation: [0, 0, -0.38] },
      { type: 'cylinder', radiusTop: 0.035, radiusBottom: 0.035, height: 0.42, position: [-0.45, 0.02, -0.68], rotation: [0, 0, -0.55] },
      { type: 'box', width: 0.26, height: 0.04, depth: 0.24, position: [-0.72, -0.42, -0.68] }, // Sapata esquerda
      { type: 'box', width: 0.09, height: 0.55, depth: 0.09, position: [0.55, -0.16, -0.68], rotation: [0, 0, 0.38] },
      { type: 'cylinder', radiusTop: 0.035, radiusBottom: 0.035, height: 0.42, position: [0.45, 0.02, -0.68], rotation: [0, 0, 0.55] },
      { type: 'box', width: 0.26, height: 0.04, depth: 0.24, position: [0.72, -0.42, -0.68] }, // Sapata direita
    ],
  },
  truck: {
    id: 'truck',
    name: 'Caminhão Caçamba',
    prompt: 'caminhão caçamba',
    description: 'Caminhão basculante para transporte de terra e agregados da construção civil.',
    parts: [
      // Chassis
      { type: 'box', width: 0.8, height: 0.2, depth: 1.9, position: [0, -0.18, 0] },
      // Cabine
      { type: 'box', width: 0.85, height: 0.75, depth: 0.7, position: [0, 0.32, 0.6] },
      // Teto cabine
      { type: 'box', width: 0.9, height: 0.08, depth: 0.75, position: [0, 0.72, 0.6] },
      // Grade frontal
      { type: 'box', width: 0.78, height: 0.35, depth: 0.1, position: [0, 0.15, 0.96] },
      // Caçamba basculante traseira
      { type: 'box', width: 1.05, height: 0.55, depth: 1.25, position: [0, 0.32, -0.38] },
      // Protetor de cabine da caçamba
      { type: 'box', width: 1.05, height: 0.25, depth: 0.35, position: [0, 0.52, 0.2] },
      // Rodas (6 rodas pesadas)
      { type: 'cylinder', radiusTop: 0.3, radiusBottom: 0.3, height: 0.22, radialSegments: 28, position: [-0.52, -0.26, 0.6], rotation: [0, 0, Math.PI / 2] },
      { type: 'cylinder', radiusTop: 0.3, radiusBottom: 0.3, height: 0.22, radialSegments: 28, position: [0.52, -0.26, 0.6], rotation: [0, 0, Math.PI / 2] },
      { type: 'cylinder', radiusTop: 0.3, radiusBottom: 0.3, height: 0.22, radialSegments: 28, position: [-0.52, -0.26, -0.2], rotation: [0, 0, Math.PI / 2] },
      { type: 'cylinder', radiusTop: 0.3, radiusBottom: 0.3, height: 0.22, radialSegments: 28, position: [0.52, -0.26, -0.2], rotation: [0, 0, Math.PI / 2] },
      { type: 'cylinder', radiusTop: 0.3, radiusBottom: 0.3, height: 0.22, radialSegments: 28, position: [-0.52, -0.26, -0.65], rotation: [0, 0, Math.PI / 2] },
      { type: 'cylinder', radiusTop: 0.3, radiusBottom: 0.3, height: 0.22, radialSegments: 28, position: [0.52, -0.26, -0.65], rotation: [0, 0, Math.PI / 2] },
    ],
  },
  traffic_cone: {
    id: 'traffic_cone',
    name: 'Cone de Trânsito',
    prompt: 'cone de transito',
    description: 'Cone de sinalização viária e segurança de obra.',
    parts: [
      { type: 'box', width: 1.2, height: 0.12, depth: 1.2, position: [0, -0.85, 0] },
      { type: 'cone', radius: 0.5, height: 1.7, radialSegments: 36, position: [0, 0.05, 0] },
      { type: 'torus', radius: 0.32, tube: 0.04, position: [0, -0.15, 0], rotation: [Math.PI / 2, 0, 0] },
      { type: 'torus', radius: 0.22, tube: 0.035, position: [0, 0.25, 0], rotation: [Math.PI / 2, 0, 0] },
    ],
  },
  crane: {
    id: 'crane',
    name: 'Guindaste de Torre',
    prompt: 'guindaste de torre',
    description: 'Guindaste de torre (grua) com mastro treliçado, lança horizontal, contra-lança com contrapesos e gancho.',
    parts: [
      // Base de concreto
      { type: 'box', width: 0.9, height: 0.15, depth: 0.9, position: [0, -1.05, 0] },
      // Mastro vertical treliçado
      { type: 'box', width: 0.22, height: 2.1, depth: 0.22, position: [0, 0.05, 0] },
      // Plataforma de giro e cabine do operador
      { type: 'cylinder', radiusTop: 0.2, radiusBottom: 0.2, height: 0.18, position: [0, 1.15, 0] },
      { type: 'box', width: 0.24, height: 0.28, depth: 0.3, position: [0.18, 1.28, 0.1] },
      // Vértice superior (A-Frame / Topo da torre)
      { type: 'cone', radius: 0.2, height: 0.6, position: [0, 1.55, 0] },
      // Lança horizontal de trabalho (Jib)
      { type: 'box', width: 0.15, height: 0.16, depth: 2.3, position: [0, 1.25, 1.05] },
      // Contra-lança traseira com contrapesos
      { type: 'box', width: 0.15, height: 0.16, depth: 1.0, position: [0, 1.25, -0.55] },
      { type: 'box', width: 0.35, height: 0.28, depth: 0.45, position: [0, 1.2, -0.9] },
      // Carrinho de carga (Trolley)
      { type: 'box', width: 0.18, height: 0.1, depth: 0.2, position: [0, 1.12, 1.3] },
      // Cabo e Gancho de elevação
      { type: 'cylinder', radiusTop: 0.015, radiusBottom: 0.015, height: 0.65, position: [0, 0.75, 1.3] },
      { type: 'torus', radius: 0.08, tube: 0.03, position: [0, 0.38, 1.3], rotation: [0, 0, Math.PI / 2] },
    ],
  },
  concrete_mixer: {
    id: 'concrete_mixer',
    name: 'Betoneira de Obra',
    prompt: 'betoneira de concreto',
    description: 'Betoneira profissional para mistura de concreto com tambor rotativo, cremalheira, volante e chassi móvel.',
    parts: [
      // Chassi tubular de suporte
      { type: 'box', width: 0.95, height: 0.1, depth: 1.2, position: [0, -0.7, 0] },
      { type: 'cylinder', radiusTop: 0.04, radiusBottom: 0.04, height: 0.9, position: [-0.4, -0.25, 0] },
      { type: 'cylinder', radiusTop: 0.04, radiusBottom: 0.04, height: 0.9, position: [0.4, -0.25, 0] },
      // Rodas de transporte
      { type: 'cylinder', radiusTop: 0.22, radiusBottom: 0.22, height: 0.12, position: [-0.52, -0.72, 0.2], rotation: [0, 0, Math.PI / 2] },
      { type: 'cylinder', radiusTop: 0.22, radiusBottom: 0.22, height: 0.12, position: [0.52, -0.72, 0.2], rotation: [0, 0, Math.PI / 2] },
      // Tambor / Balão de mistura inclinado (Fundo)
      { type: 'cylinder', radiusTop: 0.62, radiusBottom: 0.35, height: 0.55, radialSegments: 36, position: [0, 0.05, -0.1], rotation: [0.55, 0, 0] },
      // Tambor (Cúpula e boca cônica)
      { type: 'cone', radius: 0.62, height: 0.65, radialSegments: 36, position: [0, 0.45, 0.18], rotation: [0.55 + Math.PI, 0, 0] },
      // Cremalheira dentada central
      { type: 'torus', radius: 0.63, tube: 0.04, position: [0, 0.18, 0.02], rotation: [0.55, 0, 0] },
      // Boca do tambor
      { type: 'torus', radius: 0.3, tube: 0.04, position: [0, 0.68, 0.35], rotation: [0.55, 0, 0] },
      // Carenagem do motor elétrico
      { type: 'box', width: 0.35, height: 0.42, depth: 0.42, position: [0.48, -0.05, -0.2] },
      // Volante basculante de descarga
      { type: 'torus', radius: 0.22, tube: 0.03, position: [-0.48, 0.05, 0], rotation: [0, Math.PI / 2, 0] },
    ],
  },
  drone: {
    id: 'drone',
    name: 'Drone de Mapeamento',
    prompt: 'drone de mapeamento',
    description: 'Drone quadricóptero para topografia e inspeção de canteiro de obras.',
    parts: [
      // Fuselagem central
      { type: 'sphere', radius: 0.4, position: [0, 0, 0], scale: [1.2, 0.5, 1.2] },
      // Braços tubulares de carbono em X
      { type: 'box', width: 2.1, height: 0.06, depth: 0.08, position: [0, 0, 0], rotation: [0, Math.PI / 4, 0] },
      { type: 'box', width: 2.1, height: 0.06, depth: 0.08, position: [0, 0, 0], rotation: [0, -Math.PI / 4, 0] },
      // 4 Motores brushless
      { type: 'cylinder', radiusTop: 0.1, radiusBottom: 0.1, height: 0.14, position: [-0.75, 0.08, -0.75] },
      { type: 'cylinder', radiusTop: 0.1, radiusBottom: 0.1, height: 0.14, position: [0.75, 0.08, -0.75] },
      { type: 'cylinder', radiusTop: 0.1, radiusBottom: 0.1, height: 0.14, position: [-0.75, 0.08, 0.75] },
      { type: 'cylinder', radiusTop: 0.1, radiusBottom: 0.1, height: 0.14, position: [0.75, 0.08, 0.75] },
      // 4 Hélices duplas
      { type: 'box', width: 0.6, height: 0.02, depth: 0.08, position: [-0.75, 0.16, -0.75], rotation: [0, 0.3, 0] },
      { type: 'box', width: 0.6, height: 0.02, depth: 0.08, position: [0.75, 0.16, -0.75], rotation: [0, -0.3, 0] },
      { type: 'box', width: 0.6, height: 0.02, depth: 0.08, position: [-0.75, 0.16, 0.75], rotation: [0, -0.3, 0] },
      { type: 'box', width: 0.6, height: 0.02, depth: 0.08, position: [0.75, 0.16, 0.75], rotation: [0, 0.3, 0] },
      // Trem de pouso
      { type: 'cylinder', radiusTop: 0.03, radiusBottom: 0.03, height: 0.45, position: [-0.35, -0.25, 0], rotation: [0, 0, -0.3] },
      { type: 'cylinder', radiusTop: 0.03, radiusBottom: 0.03, height: 0.45, position: [0.35, -0.25, 0], rotation: [0, 0, 0.3] },
      // Câmera gimbal inferior
      { type: 'sphere', radius: 0.14, position: [0, -0.22, 0.1] },
      { type: 'cylinder', radiusTop: 0.06, radiusBottom: 0.06, height: 0.08, position: [0, -0.22, 0.22], rotation: [Math.PI / 2, 0, 0] },
    ],
  },
  hammer: {
    id: 'hammer',
    name: 'Martelo Profissional',
    prompt: 'martelo',
    description: 'Martelo de carpinteiro e construção com orelha bifurcada saca-pregos e cabo ergonômico.',
    parts: [
      // Cabeça forjada de aço
      { type: 'cylinder', radiusTop: 0.16, radiusBottom: 0.18, height: 0.6, position: [0, 0.6, 0.15], rotation: [Math.PI / 2, 0, 0] },
      // Orelha curva saca-pregos
      { type: 'box', width: 0.2, height: 0.15, depth: 0.45, position: [0, 0.68, -0.25], rotation: [-0.45, 0, 0] },
      // Colarinho de reforço
      { type: 'box', width: 0.22, height: 0.25, depth: 0.24, position: [0, 0.52, 0] },
      // Cabo contornado
      { type: 'cylinder', radiusTop: 0.09, radiusBottom: 0.075, height: 1.45, position: [0, -0.25, 0] },
      // Empunhadura de borracha
      { type: 'cylinder', radiusTop: 0.095, radiusBottom: 0.1, height: 0.7, position: [0, -0.65, 0] },
      { type: 'torus', radius: 0.09, tube: 0.025, position: [0, -0.98, 0], rotation: [Math.PI / 2, 0, 0] },
    ],
  },
  justice_statue: {
    id: 'justice_statue',
    name: 'Estátua da Justiça',
    prompt: 'estátua da justiça',
    description: 'Escultura clássica e realista da Deusa da Justiça (Lady Justice / Thémis) com toga drapeada de alta fidelidade, venda nos olhos, balança de pratos duplos, livros de lei e espada sobre pedestal.',
    parts: [],
    get importedScene() {
      if (!_cachedJusticeStatue) {
        _cachedJusticeStatue = buildStatueOfJustice();
      }
      return _cachedJusticeStatue;
    },
  },
};
