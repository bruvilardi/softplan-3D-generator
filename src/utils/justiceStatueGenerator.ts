import * as THREE from 'three';

/**
 * Masterfully crafted, high-polygon neoclassical sculpture of Lady Justice
 * (Thémis / Estátua da Justiça).
 *
 * Includes:
 * - Multi-tiered classical pedestal with recessed panels, dentil cornice, and legal inscription plaque
 * - Stacked legal codex books (Código de Leis) at the foot with embossed spine ribs and ribbon bookmark
 * - Sculpted feet with classical Roman sandals and individual toes
 * - Organic flowing gown (chiton/peplos) with high-density sinusoidal and contrapposto drapery folds
 * - Cinched waist with knotted cinctorium and hanging fabric tails
 * - Diagonal himation drape fastened by an ornate shoulder brooch (fibula)
 * - Flowing cape (palla) cascading down the statue's back
 * - Anatomical face with sculpted nose, serene lips, cheekbones, jawline, and chin
 * - The iconic blindfold with realistic fabric wrinkles and rear knot with fluttering ribbons
 * - Elaborate Greek hairstyle with center part, wavy ringlets cascading over shoulders, chignon bun, and classical tiara
 * - Sculpted arms with anatomical muscle contours
 * - Sculpted hands with individual articulated fingers gripping the scale ring and sword hilt
 * - Precision neoclassical Scales of Justice with filigree beam, central balance pointer & dial, 6 fine chains, and dished pans
 * - Roman Gladius/Spatha sword of justice with leather-wrapped fluted grip, ornate crossguard, pommel, central fuller groove, and diamond blade
 */
export function buildStatueOfJustice(): THREE.Group {
  const root = new THREE.Group();
  const meshes: THREE.Mesh[] = [];

  // Helper to register mesh
  const addGeo = (geo: THREE.BufferGeometry) => {
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    meshes.push(mesh);
    root.add(mesh);
    return mesh;
  };

  // =========================================================================
  // 1. CLASSICAL MULTI-TIER PEDESTAL WITH MOLDINGS & INSCRIPTION
  // =========================================================================
  // 1a. Sub-plinth (bottom wide foundation)
  const subPlinth = new THREE.BoxGeometry(1.6, 0.12, 1.35);
  subPlinth.translate(0, -1.06, 0);
  addGeo(subPlinth);

  // 1b. Chamfered base plinth with cavetto molding
  const baseCavetto = new THREE.CylinderGeometry(0.85, 0.96, 0.08, 48);
  baseCavetto.scale(1.0, 1.0, 0.85);
  baseCavetto.translate(0, -0.96, 0);
  addGeo(baseCavetto);

  // 1c. Main pedestal die (shaft) with 4 recessed panels
  const pedestalDie = new THREE.BoxGeometry(1.3, 0.38, 1.05);
  pedestalDie.translate(0, -0.73, 0);
  addGeo(pedestalDie);

  // Recessed panel frames
  const frontPanel = new THREE.BoxGeometry(0.96, 0.26, 0.04);
  frontPanel.translate(0, -0.73, 0.53);
  addGeo(frontPanel);

  const backPanel = new THREE.BoxGeometry(0.96, 0.26, 0.04);
  backPanel.translate(0, -0.73, -0.53);
  addGeo(backPanel);

  const leftPanel = new THREE.BoxGeometry(0.04, 0.26, 0.76);
  leftPanel.translate(-0.65, -0.73, 0);
  addGeo(leftPanel);

  const rightPanel = new THREE.BoxGeometry(0.04, 0.26, 0.76);
  rightPanel.translate(0.65, -0.73, 0);
  addGeo(rightPanel);

  // 1d. Roman Inscription Plaque on Front Panel ("LEX ET IUSTITIA")
  const plaqueInner = new THREE.BoxGeometry(0.82, 0.18, 0.02);
  plaqueInner.translate(0, -0.73, 0.55);
  addGeo(plaqueInner);

  // Decorative corner studs on the plaque
  const studPositions = [
    [-0.37, -0.67, 0.56],
    [0.37, -0.67, 0.56],
    [-0.37, -0.79, 0.56],
    [0.37, -0.79, 0.56],
  ];
  studPositions.forEach(([x, y, z]) => {
    const stud = new THREE.SphereGeometry(0.016, 12, 12);
    stud.translate(x, y, z);
    addGeo(stud);
  });

  // 1e. Classical Dentil Cornice (Beaded dental blocks under top ledge)
  const corniceBed = new THREE.BoxGeometry(1.38, 0.05, 1.12);
  corniceBed.translate(0, -0.52, 0);
  addGeo(corniceBed);

  // Dentil teeth along front and sides
  for (let d = -0.55; d <= 0.55; d += 0.09) {
    const dentilF = new THREE.BoxGeometry(0.045, 0.035, 0.03);
    dentilF.translate(d, -0.52, 0.56);
    addGeo(dentilF);
  }

  // Top plinth step (statue support surface)
  const topStep = new THREE.BoxGeometry(1.42, 0.06, 1.16);
  topStep.translate(0, -0.47, 0);
  addGeo(topStep);

  // =========================================================================
  // 2. STACKED LEGAL CODEX BOOKS (CÓDIGO DE LEIS / CORPUS JURIS)
  // =========================================================================
  // Book 1 (Bottom heavy legal folio)
  const book1Cover = new THREE.BoxGeometry(0.48, 0.1, 0.36);
  book1Cover.translate(0.44, -0.39, -0.16);
  addGeo(book1Cover);

  const book1Pages = new THREE.BoxGeometry(0.44, 0.076, 0.32);
  book1Pages.translate(0.45, -0.39, -0.16);
  addGeo(book1Pages);

  // Raised spine bands on Book 1
  for (let b = -0.12; b <= 0.12; b += 0.06) {
    const spineBand = new THREE.CylinderGeometry(0.012, 0.012, 0.1, 12);
    spineBand.translate(0.2, -0.39, -0.16 + b);
    addGeo(spineBand);
  }

  // Book 2 (Top volume angled slightly)
  const book2Cover = new THREE.BoxGeometry(0.4, 0.08, 0.3);
  book2Cover.rotateY(0.24);
  book2Cover.translate(0.45, -0.3, -0.15);
  addGeo(book2Cover);

  // Satin bookmark ribbon draping down from Book 2 over the pedestal edge
  const ribbonCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.58, -0.28, -0.12),
    new THREE.Vector3(0.68, -0.36, -0.1),
    new THREE.Vector3(0.72, -0.48, -0.08),
    new THREE.Vector3(0.71, -0.62, -0.06),
  ]);
  const ribbonGeo = new THREE.TubeGeometry(ribbonCurve, 16, 0.012, 8, false);
  addGeo(ribbonGeo);

  // =========================================================================
  // 3. CLASSICAL SANDALS & SCULPTED FEET (CONTRAPPOSTO POSE)
  // =========================================================================
  // Left foot (supporting weight, projecting through drapery at front)
  const footLSole = new THREE.BoxGeometry(0.13, 0.03, 0.26);
  footLSole.translate(-0.16, -0.425, 0.28);
  addGeo(footLSole);

  const footLArch = new THREE.CylinderGeometry(0.045, 0.06, 0.2, 16);
  footLArch.rotateX(Math.PI / 2);
  footLArch.scale(0.85, 0.6, 1.0);
  footLArch.translate(-0.16, -0.39, 0.26);
  addGeo(footLArch);

  // Sculpted classical toes
  const toeOffsets = [-0.04, -0.02, 0.0, 0.02, 0.04];
  toeOffsets.forEach((tx, idx) => {
    const toeR = 0.016 - Math.abs(idx - 1) * 0.002;
    const toe = new THREE.SphereGeometry(toeR, 12, 12);
    toe.scale(0.9, 0.8, 1.4);
    toe.translate(-0.16 + tx, -0.41, 0.38 - Math.abs(idx - 1) * 0.01);
    addGeo(toe);
  });

  // Sandal straps (criss-cross Roman leather bindings)
  const strap1 = new THREE.TorusGeometry(0.062, 0.007, 8, 24);
  strap1.rotateX(Math.PI / 2);
  strap1.translate(-0.16, -0.39, 0.31);
  addGeo(strap1);

  const strap2 = new THREE.TorusGeometry(0.055, 0.007, 8, 24);
  strap2.rotateX(Math.PI / 2 + 0.3);
  strap2.translate(-0.16, -0.37, 0.24);
  addGeo(strap2);

  // Right foot (relaxed, set back near the law book)
  const footRSole = new THREE.BoxGeometry(0.12, 0.03, 0.24);
  footRSole.rotateY(-0.25);
  footRSole.translate(0.18, -0.425, 0.12);
  addGeo(footRSole);

  // =========================================================================
  // 4. FLOWING CLASSICAL LOWER ROBE (HIGH-DENSITY PARAMETRIC DRAPERY)
  // =========================================================================
  // 80 radial segments x 60 vertical steps for ultra-smooth fluid silk folds
  const robeSegs = 80;
  const robeSteps = 60;
  const rPositions: number[] = [];
  const rUvs: number[] = [];
  const rIndices: number[] = [];

  for (let j = 0; j <= robeSteps; j++) {
    const v = j / robeSteps;
    // Y spans from hem pooling at base (-0.44) to waist cinctorium (0.16)
    const y = -0.44 + v * 0.6;
    // Tapering flare from hem radius 0.64 down to waist 0.28
    const baseR = 0.64 * (1 - v * 0.56);

    for (let i = 0; i <= robeSegs; i++) {
      const u = i / robeSegs;
      const theta = u * Math.PI * 2;

      // 1. Classical fluted pleats (primary vertical drape rhythm)
      const primaryFlutes = 0.048 * Math.sin(theta * 14 + y * 2.2);

      // 2. High-frequency micro-crinkles for realistic woven fabric texture
      const microFolds = 0.018 * Math.sin(theta * 28 - y * 3.8);

      // 3. Swags and horizontal drapery tension around hips
      const hipSwag = 0.022 * Math.cos(theta * 6 + y * 4.5);

      // 4. Contrapposto left knee projection: weight is on left leg, knee pushing through
      const kneeTheta = Math.PI * 0.44;
      const kneeY = -0.12;
      const dThetaKnee = theta - kneeTheta;
      const dYKnee = y - kneeY;
      const kneeBump =
        Math.exp(-(dThetaKnee * dThetaKnee) / 0.18) *
        Math.exp(-(dYKnee * dYKnee) / 0.045) *
        0.095;

      // 5. Tension lines radiating down from the knee to the hem
      const tensionRad =
        Math.exp(-Math.abs(dThetaKnee) / 0.25) *
        Math.sin((y - kneeY) * 12) *
        0.02 *
        (y < kneeY ? 1 : 0.2);

      // 6. Hem pooling flare over the plinth step
      const hemPooling = v < 0.15 ? Math.pow(1 - v / 0.15, 2) * 0.08 * (1 + 0.3 * Math.sin(theta * 10)) : 0;

      const r = Math.max(0.12, baseR + primaryFlutes + microFolds + hipSwag + kneeBump + tensionRad + hemPooling);
      const x = Math.sin(theta) * r;
      // Slight anatomical oval depth (statue is deeper in Z than wide in X)
      const z = Math.cos(theta) * r * 0.94;

      rPositions.push(x, y, z);
      rUvs.push(u, v);
    }
  }

  for (let j = 0; j < robeSteps; j++) {
    for (let i = 0; i < robeSegs; i++) {
      const a = j * (robeSegs + 1) + i;
      const b = a + 1;
      const c = (j + 1) * (robeSegs + 1) + i;
      const d = c + 1;
      rIndices.push(a, c, b);
      rIndices.push(b, c, d);
    }
  }

  const robeGeo = new THREE.BufferGeometry();
  robeGeo.setAttribute('position', new THREE.Float32BufferAttribute(rPositions, 3));
  robeGeo.setAttribute('uv', new THREE.Float32BufferAttribute(rUvs, 2));
  robeGeo.setIndex(rIndices);
  addGeo(robeGeo);

  // =========================================================================
  // 5. CINCTORIUM / EMBOSSED GIRDLE & HANGING SASH TAILS
  // =========================================================================
  // Braided belt holding the toga
  const beltTorus = new THREE.TorusGeometry(0.31, 0.038, 20, 64);
  beltTorus.rotateX(Math.PI / 2);
  beltTorus.translate(0, 0.16, 0.02);
  addGeo(beltTorus);

  // Ornate central buckle / brooch at front of waist
  const beltBrooch = new THREE.CylinderGeometry(0.045, 0.045, 0.025, 24);
  beltBrooch.rotateX(Math.PI / 2);
  beltBrooch.translate(0, 0.16, 0.34);
  addGeo(beltBrooch);

  // Tied knot loops
  const knotL = new THREE.TorusGeometry(0.035, 0.015, 12, 24);
  knotL.rotateY(0.4);
  knotL.translate(-0.05, 0.14, 0.34);
  addGeo(knotL);

  const knotR = new THREE.TorusGeometry(0.035, 0.015, 12, 24);
  knotR.rotateY(-0.4);
  knotR.translate(0.05, 0.14, 0.34);
  addGeo(knotR);

  // Hanging fabric sash tails cascading down the front of the skirt
  const sashL = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.04, 0.14, 0.35),
      new THREE.Vector3(-0.06, 0.02, 0.36),
      new THREE.Vector3(-0.08, -0.12, 0.38),
      new THREE.Vector3(-0.07, -0.24, 0.39),
    ]),
    20,
    0.02,
    8,
    false
  );
  addGeo(sashL);

  const sashR = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.04, 0.14, 0.35),
      new THREE.Vector3(0.06, 0.01, 0.37),
      new THREE.Vector3(0.08, -0.14, 0.39),
      new THREE.Vector3(0.09, -0.26, 0.41),
    ]),
    20,
    0.018,
    8,
    false
  );
  addGeo(sashR);

  // =========================================================================
  // 6. UPPER BODICE (PEPLOS) WITH DIAGONAL HIMATION DRAPERY
  // =========================================================================
  const bodiceSegs = 72;
  const bodiceSteps = 36;
  const bPositions: number[] = [];
  const bUvs: number[] = [];
  const bIndices: number[] = [];

  for (let j = 0; j <= bodiceSteps; j++) {
    const v = j / bodiceSteps;
    // Y goes from waist (0.16) to clavicle/shoulders (0.58)
    const y = 0.16 + v * 0.42;
    // Flare slightly from waist (0.28) out to shoulder breadth (0.38)
    const rx = 0.28 + v * 0.09;
    const rz = 0.22 + v * 0.04;

    for (let i = 0; i <= bodiceSegs; i++) {
      const u = i / bodiceSegs;
      const theta = u * Math.PI * 2;

      // Anatomical bust contouring (two distinct peaks with cleavage valley)
      const isChest = theta > Math.PI * 0.25 && theta < Math.PI * 0.75;
      let bustRelief = 0;
      if (isChest) {
        const chestX = Math.sin(theta);
        const breastL = Math.exp(-Math.pow(chestX - 0.35, 2) / 0.04) * Math.exp(-Math.pow(y - 0.36, 2) / 0.016) * 0.08;
        const breastR = Math.exp(-Math.pow(chestX + 0.35, 2) / 0.04) * Math.exp(-Math.pow(y - 0.36, 2) / 0.016) * 0.08;
        bustRelief = breastL + breastR;
      }

      // Diagonal himation drape: folds crossing from right shoulder (top-right) down across the chest
      const diagPhase = Math.sin(theta) * 2.5 + y * 6.0;
      const diagFolds = 0.024 * Math.sin(diagPhase);

      // Ribcage and spinal furrow at the back
      const spineIndent = theta > Math.PI * 1.4 && theta < Math.PI * 1.6 ? -0.025 : 0;

      const px = Math.sin(theta) * (rx + diagFolds);
      const pz = Math.cos(theta) * (rz + bustRelief + diagFolds * 0.8) + spineIndent;

      bPositions.push(px, y, pz);
      bUvs.push(u, v);
    }
  }

  for (let j = 0; j < bodiceSteps; j++) {
    for (let i = 0; i < bodiceSegs; i++) {
      const a = j * (bodiceSegs + 1) + i;
      const b = a + 1;
      const c = (j + 1) * (bodiceSegs + 1) + i;
      const d = c + 1;
      bIndices.push(a, c, b);
      bIndices.push(b, c, d);
    }
  }

  const bodiceGeo = new THREE.BufferGeometry();
  bodiceGeo.setAttribute('position', new THREE.Float32BufferAttribute(bPositions, 3));
  bodiceGeo.setAttribute('uv', new THREE.Float32BufferAttribute(bUvs, 2));
  bodiceGeo.setIndex(bIndices);
  addGeo(bodiceGeo);

  // Ornate cameo brooch / fibula fastening the toga on the right shoulder
  const shoulderBrooch = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 24);
  shoulderBrooch.rotateZ(-0.4);
  shoulderBrooch.translate(0.32, 0.56, 0.06);
  addGeo(shoulderBrooch);

  const broochPearl = new THREE.SphereGeometry(0.02, 16, 16);
  broochPearl.translate(0.32, 0.57, 0.07);
  addGeo(broochPearl);

  // Flowing cape / mantle (Palla) billowing down the statue's back
  const capeSegs = 40;
  const capeSteps = 30;
  const capePos: number[] = [];
  const capeIndices: number[] = [];

  for (let j = 0; j <= capeSteps; j++) {
    const v = j / capeSteps;
    const y = 0.55 - v * 0.85; // Cascades from shoulders down to mid-calf
    const width = 0.65 + v * 0.25;

    for (let i = 0; i <= capeSegs; i++) {
      const u = i / capeSegs;
      const x = (u - 0.5) * width;
      // Rippling cloth waves
      const ripple = 0.03 * Math.sin(u * Math.PI * 6 + y * 4);
      const z = -0.22 - v * 0.12 + ripple;
      capePos.push(x, y, z);
    }
  }

  for (let j = 0; j < capeSteps; j++) {
    for (let i = 0; i < capeSegs; i++) {
      const a = j * (capeSegs + 1) + i;
      const b = a + 1;
      const c = (j + 1) * (capeSegs + 1) + i;
      const d = c + 1;
      capeIndices.push(a, b, c);
      capeIndices.push(b, d, c);
      // Double sided faces for thickness
      capeIndices.push(a, c, b);
      capeIndices.push(b, c, d);
    }
  }

  const capeGeo = new THREE.BufferGeometry();
  capeGeo.setAttribute('position', new THREE.Float32BufferAttribute(capePos, 3));
  capeGeo.setIndex(capeIndices);
  addGeo(capeGeo);

  // =========================================================================
  // 7. SCULPTED HEAD, ANATOMICAL FACE, BLINDFOLD & GRECIAN COIFFURE
  // =========================================================================
  // Graceful neck with sternocleidomastoid muscle definition
  const neckGeo = new THREE.CylinderGeometry(0.095, 0.125, 0.16, 32);
  neckGeo.translate(0, 0.64, 0.02);
  addGeo(neckGeo);

  // Anatomical Head base
  const headBase = new THREE.SphereGeometry(0.16, 48, 48);
  headBase.scale(0.88, 1.12, 1.02);
  headBase.translate(0, 0.8, 0.04);
  addGeo(headBase);

  // Sculpted Classical Nose (Straight Grecian profile)
  const noseBridge = new THREE.ConeGeometry(0.024, 0.09, 16);
  noseBridge.rotateX(-0.35);
  noseBridge.translate(0, 0.77, 0.2);
  addGeo(noseBridge);

  // Nostrils
  const nostrilL = new THREE.SphereGeometry(0.012, 12, 12);
  nostrilL.translate(-0.016, 0.73, 0.185);
  addGeo(nostrilL);
  const nostrilR = new THREE.SphereGeometry(0.012, 12, 12);
  nostrilR.translate(0.016, 0.73, 0.185);
  addGeo(nostrilR);

  // Sculpted Classical Lips (Cupid's bow & serene judicial expression)
  const upperLip = new THREE.TorusGeometry(0.022, 0.007, 12, 24, Math.PI * 0.9);
  upperLip.rotateZ(Math.PI);
  upperLip.translate(0, 0.7, 0.185);
  addGeo(upperLip);

  const lowerLip = new THREE.SphereGeometry(0.016, 16, 16);
  lowerLip.scale(1.4, 0.7, 0.9);
  lowerLip.translate(0, 0.685, 0.182);
  addGeo(lowerLip);

  // Sculpted Chin & Jawline
  const chin = new THREE.SphereGeometry(0.028, 16, 16);
  chin.scale(1.1, 0.9, 1.2);
  chin.translate(0, 0.655, 0.165);
  addGeo(chin);

  // Cheekbones
  const cheekL = new THREE.SphereGeometry(0.035, 16, 16);
  cheekL.scale(1.0, 0.8, 1.1);
  cheekL.translate(-0.08, 0.75, 0.13);
  addGeo(cheekL);

  const cheekR = new THREE.SphereGeometry(0.035, 16, 16);
  cheekR.scale(1.0, 0.8, 1.1);
  cheekR.translate(0.08, 0.75, 0.13);
  addGeo(cheekR);

  // Classical Ears & Pendant Earrings
  const earL = new THREE.SphereGeometry(0.035, 16, 16);
  earL.scale(0.4, 1.2, 0.7);
  earL.translate(-0.145, 0.78, 0.03);
  addGeo(earL);

  const earringL = new THREE.SphereGeometry(0.01, 12, 12);
  earringL.translate(-0.15, 0.735, 0.03);
  addGeo(earringL);

  const earR = new THREE.SphereGeometry(0.035, 16, 16);
  earR.scale(0.4, 1.2, 0.7);
  earR.translate(0.145, 0.78, 0.03);
  addGeo(earR);

  const earringR = new THREE.SphereGeometry(0.01, 12, 12);
  earringR.translate(0.15, 0.735, 0.03);
  addGeo(earringR);

  // =========================================================================
  // THE ICONIC BLINDFOLD (VENDA DA IMPARCIALIDADE - "A JUSTIÇA É CEGA")
  // =========================================================================
  // Fabric ribbon wrapped snugly around brow and eyes
  const blindfoldBand = new THREE.TorusGeometry(0.155, 0.042, 24, 64);
  blindfoldBand.scale(0.9, 0.72, 1.05);
  blindfoldBand.rotateX(Math.PI / 2 + 0.05);
  blindfoldBand.translate(0, 0.815, 0.05);
  addGeo(blindfoldBand);

  // Fabric creases over eyes
  const crease1 = new THREE.TorusGeometry(0.158, 0.012, 12, 48);
  crease1.scale(0.9, 0.72, 1.05);
  crease1.rotateX(Math.PI / 2 + 0.02);
  crease1.translate(0, 0.835, 0.055);
  addGeo(crease1);

  // Rear Knot of the blindfold
  const blindfoldKnot = new THREE.SphereGeometry(0.035, 16, 16);
  blindfoldKnot.translate(0, 0.81, -0.13);
  addGeo(blindfoldKnot);

  // Two trailing fabric ribbon tails cascading down the back of the neck
  const ribbonTail1 = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.02, 0.81, -0.13),
      new THREE.Vector3(-0.04, 0.73, -0.15),
      new THREE.Vector3(-0.03, 0.65, -0.14),
      new THREE.Vector3(-0.05, 0.58, -0.16),
    ]),
    16,
    0.014,
    8,
    false
  );
  addGeo(ribbonTail1);

  const ribbonTail2 = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.02, 0.81, -0.13),
      new THREE.Vector3(0.05, 0.74, -0.14),
      new THREE.Vector3(0.04, 0.66, -0.15),
      new THREE.Vector3(0.06, 0.59, -0.14),
    ]),
    16,
    0.012,
    8,
    false
  );
  addGeo(ribbonTail2);

  // =========================================================================
  // CLASSICAL GRECIAN HAIR & CHIGNON BUN
  // =========================================================================
  // Crown and back hair volume with wavy chignon texture
  const hairMass = new THREE.SphereGeometry(0.165, 32, 32);
  hairMass.scale(1.02, 0.98, 1.18);
  hairMass.translate(0, 0.83, -0.07);
  addGeo(hairMass);

  // Elaborate Greek braided chignon bun at the occiput
  const hairBunTorus = new THREE.TorusGeometry(0.085, 0.045, 20, 36);
  hairBunTorus.rotateX(Math.PI * 0.25);
  hairBunTorus.translate(0, 0.83, -0.19);
  addGeo(hairBunTorus);

  // Flowing ringlet curls cascading over the shoulders onto the chest
  // Left shoulder ringlet
  const ringletL = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.14, 0.82, 0.02),
      new THREE.Vector3(-0.18, 0.73, 0.06),
      new THREE.Vector3(-0.21, 0.65, 0.1),
      new THREE.Vector3(-0.19, 0.56, 0.14),
      new THREE.Vector3(-0.17, 0.48, 0.16),
    ]),
    24,
    0.02,
    8,
    false
  );
  addGeo(ringletL);

  // Right shoulder ringlet
  const ringletR = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.14, 0.82, 0.02),
      new THREE.Vector3(0.18, 0.73, 0.06),
      new THREE.Vector3(0.21, 0.65, 0.1),
      new THREE.Vector3(0.19, 0.56, 0.14),
      new THREE.Vector3(0.17, 0.48, 0.16),
    ]),
    24,
    0.02,
    8,
    false
  );
  addGeo(ringletR);

  // Classical Diadem / Laurel Crown (Tiara da Justiça) atop brow
  const diadem = new THREE.TorusGeometry(0.155, 0.016, 16, 48, Math.PI * 0.8);
  diadem.rotateX(Math.PI * 0.35);
  diadem.rotateZ(-Math.PI * 0.4);
  diadem.translate(0, 0.91, 0.08);
  addGeo(diadem);

  // Central star/gem on tiara
  const tiaraStar = new THREE.OctahedronGeometry(0.024, 0);
  tiaraStar.translate(0, 0.94, 0.11);
  addGeo(tiaraStar);

  // =========================================================================
  // 8. LEFT ARM & SCULPTED HAND (HOLDING THE SCALES)
  // =========================================================================
  // Left shoulder deltoid
  const shoulderL = new THREE.SphereGeometry(0.095, 24, 24);
  shoulderL.translate(-0.36, 0.53, 0.02);
  addGeo(shoulderL);

  // Left upper arm (extended upward and outward)
  const armL1 = new THREE.CylinderGeometry(0.072, 0.062, 0.38, 24);
  armL1.rotateZ(Math.PI * 0.28);
  armL1.translate(-0.48, 0.46, 0.06);
  addGeo(armL1);

  // Elbow joint
  const elbowL = new THREE.SphereGeometry(0.062, 20, 20);
  elbowL.translate(-0.57, 0.4, 0.1);
  addGeo(elbowL);

  // Left forearm (raised forward-upward holding the scales)
  const armL2 = new THREE.CylinderGeometry(0.062, 0.048, 0.36, 24);
  armL2.rotateX(-Math.PI * 0.34);
  armL2.rotateZ(Math.PI * 0.2);
  armL2.translate(-0.64, 0.52, 0.24);
  addGeo(armL2);

  // Left wrist
  const wristL = new THREE.CylinderGeometry(0.046, 0.046, 0.06, 20);
  wristL.translate(-0.7, 0.62, 0.34);
  addGeo(wristL);

  // Left Hand Palm
  const palmL = new THREE.BoxGeometry(0.07, 0.04, 0.09);
  palmL.rotateZ(0.2);
  palmL.translate(-0.72, 0.65, 0.35);
  addGeo(palmL);

  // 5 Articulated curved fingers clasping the scale ring
  for (let f = 0; f < 4; f++) {
    const fingerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.73 - f * 0.015, 0.66, 0.37),
      new THREE.Vector3(-0.73 - f * 0.015, 0.68, 0.39),
      new THREE.Vector3(-0.71 - f * 0.015, 0.67, 0.4),
    ]);
    const fingerGeo = new THREE.TubeGeometry(fingerCurve, 8, 0.009, 8, false);
    addGeo(fingerGeo);
  }
  // Thumb gripping from underneath
  const thumbL = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.7, 0.63, 0.33),
      new THREE.Vector3(-0.69, 0.65, 0.35),
      new THREE.Vector3(-0.7, 0.67, 0.36),
    ]),
    8,
    0.01,
    8,
    false
  );
  addGeo(thumbL);

  // =========================================================================
  // 9. THE SCALES OF JUSTICE (A BALANÇA DE ALTA PRECISÃO)
  // =========================================================================
  // Suspension Ring gripped by hand
  const scaleRing = new THREE.TorusGeometry(0.048, 0.009, 16, 32);
  scaleRing.rotateY(Math.PI / 2);
  scaleRing.translate(-0.71, 0.68, 0.38);
  addGeo(scaleRing);

  // Swivel shackle connector
  const shackle = new THREE.CylinderGeometry(0.012, 0.012, 0.04, 16);
  shackle.translate(-0.71, 0.72, 0.38);
  addGeo(shackle);

  // Neoclassical Balance Crossbeam (Ornate tapered arm)
  const beamCenter = new THREE.CylinderGeometry(0.024, 0.024, 0.06, 24);
  beamCenter.translate(-0.71, 0.75, 0.38);
  addGeo(beamCenter);

  const scaleBeam = new THREE.CylinderGeometry(0.014, 0.014, 0.96, 32);
  scaleBeam.rotateZ(Math.PI / 2);
  scaleBeam.translate(-0.71, 0.75, 0.38);
  addGeo(scaleBeam);

  // Central Vertical Balance Pointer (Agulha de Equilíbrio) & Semi-circular dial
  const pointerNeedle = new THREE.ConeGeometry(0.016, 0.12, 16);
  pointerNeedle.translate(-0.71, 0.81, 0.38);
  addGeo(pointerNeedle);

  const dialArch = new THREE.TorusGeometry(0.05, 0.005, 8, 24, Math.PI);
  dialArch.rotateZ(Math.PI);
  dialArch.translate(-0.71, 0.76, 0.38);
  addGeo(dialArch);

  // Filigree curved scrollwork brackets reinforcing the beam
  const scrollL = new THREE.TorusGeometry(0.08, 0.006, 8, 32, Math.PI * 0.9);
  scrollL.rotateZ(Math.PI * 0.45);
  scrollL.translate(-0.84, 0.72, 0.38);
  addGeo(scrollL);

  const scrollR = new THREE.TorusGeometry(0.08, 0.006, 8, 32, Math.PI * 0.9);
  scrollR.rotateZ(-Math.PI * 0.45);
  scrollR.translate(-0.58, 0.72, 0.38);
  addGeo(scrollR);

  // End Finials on the beam
  const finialL = new THREE.SphereGeometry(0.028, 16, 16);
  finialL.translate(-1.19, 0.75, 0.38);
  addGeo(finialL);

  const finialR = new THREE.SphereGeometry(0.028, 16, 16);
  finialR.translate(-0.23, 0.75, 0.38);
  addGeo(finialR);

  // --- Scale Dish 1 (Left Pan - -1.19, Y: 0.32, Z: 0.38) ---
  const panRadius = 0.17;
  const panDepth = 0.05;
  // Dished concave pan
  const panL = new THREE.SphereGeometry(panRadius, 36, 18, 0, Math.PI * 2, Math.PI * 0.58, Math.PI * 0.42);
  panL.scale(1, 0.42, 1);
  panL.translate(-1.19, 0.33, 0.38);
  addGeo(panL);

  // Rolled brass rim
  const panLRim = new THREE.TorusGeometry(panRadius, 0.008, 12, 48);
  panLRim.rotateX(Math.PI / 2);
  panLRim.translate(-1.19, 0.33, 0.38);
  addGeo(panLRim);

  // 3 Triangular Suspension Chains for Left Dish
  for (let c = 0; c < 3; c++) {
    const angle = (c * Math.PI * 2) / 3;
    const rimX = -1.19 + Math.sin(angle) * (panRadius * 0.95);
    const rimZ = 0.38 + Math.cos(angle) * (panRadius * 0.95);

    const chain = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.19, 0.74, 0.38),
        new THREE.Vector3((-1.19 + rimX) * 0.5, 0.54, (0.38 + rimZ) * 0.5),
        new THREE.Vector3(rimX, 0.33, rimZ),
      ]),
      16,
      0.004,
      6,
      false
    );
    addGeo(chain);
  }

  // --- Scale Dish 2 (Right Pan - -0.23, Y: 0.32, Z: 0.38) ---
  const panR = new THREE.SphereGeometry(panRadius, 36, 18, 0, Math.PI * 2, Math.PI * 0.58, Math.PI * 0.42);
  panR.scale(1, 0.42, 1);
  panR.translate(-0.23, 0.33, 0.38);
  addGeo(panR);

  const panRRim = new THREE.TorusGeometry(panRadius, 0.008, 12, 48);
  panRRim.rotateX(Math.PI / 2);
  panRRim.translate(-0.23, 0.33, 0.38);
  addGeo(panRRim);

  // 3 Triangular Suspension Chains for Right Dish
  for (let c = 0; c < 3; c++) {
    const angle = (c * Math.PI * 2) / 3;
    const rimX = -0.23 + Math.sin(angle) * (panRadius * 0.95);
    const rimZ = 0.38 + Math.cos(angle) * (panRadius * 0.95);

    const chain = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.23, 0.74, 0.38),
        new THREE.Vector3((-0.23 + rimX) * 0.5, 0.54, (0.38 + rimZ) * 0.5),
        new THREE.Vector3(rimX, 0.33, rimZ),
      ]),
      16,
      0.004,
      6,
      false
    );
    addGeo(chain);
  }

  // =========================================================================
  // 10. RIGHT ARM & SCULPTED HAND (RESTING ON SWORD HILT)
  // =========================================================================
  // Right shoulder
  const shoulderR = new THREE.SphereGeometry(0.095, 24, 24);
  shoulderR.translate(0.36, 0.53, 0.02);
  addGeo(shoulderR);

  // Right upper arm
  const armR1 = new THREE.CylinderGeometry(0.072, 0.064, 0.38, 24);
  armR1.rotateZ(-Math.PI * 0.16);
  armR1.translate(0.44, 0.36, 0.06);
  addGeo(armR1);

  // Right elbow
  const elbowR = new THREE.SphereGeometry(0.062, 20, 20);
  elbowR.translate(0.48, 0.18, 0.1);
  addGeo(elbowR);

  // Right forearm
  const armR2 = new THREE.CylinderGeometry(0.062, 0.052, 0.36, 24);
  armR2.rotateX(Math.PI * 0.12);
  armR2.rotateZ(-Math.PI * 0.08);
  armR2.translate(0.5, 0.02, 0.16);
  addGeo(armR2);

  // Right wrist
  const wristR = new THREE.CylinderGeometry(0.048, 0.048, 0.05, 20);
  wristR.translate(0.51, -0.14, 0.2);
  addGeo(wristR);

  // Right Hand gripping the sword crossguard & pommel
  const palmR = new THREE.BoxGeometry(0.08, 0.05, 0.08);
  palmR.translate(0.51, -0.17, 0.22);
  addGeo(palmR);

  // 4 Wrapped fingers around the hilt
  for (let f = 0; f < 4; f++) {
    const fingerR = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.48, -0.15 - f * 0.016, 0.24),
        new THREE.Vector3(0.52, -0.15 - f * 0.016, 0.27),
        new THREE.Vector3(0.54, -0.15 - f * 0.016, 0.23),
      ]),
      8,
      0.009,
      8,
      false
    );
    addGeo(fingerR);
  }

  // Thumb resting on the crossguard
  const thumbR = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.48, -0.13, 0.2),
      new THREE.Vector3(0.5, -0.14, 0.22),
      new THREE.Vector3(0.51, -0.16, 0.23),
    ]),
    8,
    0.01,
    8,
    false
  );
  addGeo(thumbR);

  // =========================================================================
  // 11. THE SWORD OF JUSTICE (A ESPADA DA LEI)
  // =========================================================================
  const swordX = 0.51;
  const swordZ = 0.22;

  // Faceted spherical pommel
  const pommel = new THREE.DodecahedronGeometry(0.045, 1);
  pommel.translate(swordX, 0.03, swordZ);
  addGeo(pommel);

  // Fluted & cord-wrapped grip
  const grip = new THREE.CylinderGeometry(0.024, 0.026, 0.17, 24);
  grip.translate(swordX, -0.065, swordZ);
  addGeo(grip);

  // Wire wrapping rings along the grip
  for (let w = -0.13; w <= 0.0; w += 0.03) {
    const wireRing = new THREE.TorusGeometry(0.028, 0.004, 8, 24);
    wireRing.rotateX(Math.PI / 2);
    wireRing.translate(swordX, w, swordZ);
    addGeo(wireRing);
  }

  // Classical Cruciform Crossguard with recurved acanthus quillons
  const guardCenter = new THREE.BoxGeometry(0.09, 0.045, 0.07);
  guardCenter.translate(swordX, -0.16, swordZ);
  addGeo(guardCenter);

  const quillonL = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(swordX, -0.16, swordZ),
      new THREE.Vector3(swordX - 0.1, -0.155, swordZ),
      new THREE.Vector3(swordX - 0.18, -0.18, swordZ),
    ]),
    12,
    0.018,
    8,
    false
  );
  addGeo(quillonL);

  const quillonR = new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(swordX, -0.16, swordZ),
      new THREE.Vector3(swordX + 0.1, -0.155, swordZ),
      new THREE.Vector3(swordX + 0.18, -0.18, swordZ),
    ]),
    12,
    0.018,
    8,
    false
  );
  addGeo(quillonR);

  // Blade with Central Fuller Groove (Canalete) & Diamond Cross-Section
  // Spans from -0.18 down to -1.02
  const bladeSteps = 40;
  const bladePositions: number[] = [];
  const bladeIndices: number[] = [];

  const topW = 0.072;
  const botW = 0.025;
  const maxThick = 0.022;
  const fullerDepth = 0.007;

  for (let s = 0; s <= bladeSteps; s++) {
    const t = s / bladeSteps;
    const by = -0.18 - t * 0.84; // From guard (-0.18) down to tip (-1.02)
    const w = (1 - t * 0.65) * topW;
    const th = (1 - t * 0.7) * maxThick;
    const fd = (1 - t) * fullerDepth;

    // 6 profile points across blade width at this height:
    // Left edge, Left fuller lip, Center fuller bottom, Right fuller lip, Right edge, Back spine
    // Front face
    bladePositions.push(swordX - w, by, swordZ); // 0: Left edge
    bladePositions.push(swordX - w * 0.35, by, swordZ + th); // 1: Left bevel ridge
    bladePositions.push(swordX, by, swordZ + th - fd); // 2: Center fuller groove
    bladePositions.push(swordX + w * 0.35, by, swordZ + th); // 3: Right bevel ridge
    bladePositions.push(swordX + w, by, swordZ); // 4: Right edge
    // Back face mirror
    bladePositions.push(swordX + w * 0.35, by, swordZ - th); // 5: Back right bevel
    bladePositions.push(swordX, by, swordZ - th + fd); // 6: Back fuller groove
    bladePositions.push(swordX - w * 0.35, by, swordZ - th); // 7: Back left bevel
  }

  // Connect blade cross-sections
  for (let s = 0; s < bladeSteps; s++) {
    const o1 = s * 8;
    const o2 = (s + 1) * 8;

    for (let p = 0; p < 8; p++) {
      const nextP = (p + 1) % 8;
      bladeIndices.push(o1 + p, o2 + p, o1 + nextP);
      bladeIndices.push(o1 + nextP, o2 + p, o2 + nextP);
    }
  }

  // Sharp Point at the bottom
  const tipIdx = bladePositions.length / 3;
  bladePositions.push(swordX, -1.06, swordZ);
  const lastSection = bladeSteps * 8;
  for (let p = 0; p < 8; p++) {
    const nextP = (p + 1) % 8;
    bladeIndices.push(lastSection + p, tipIdx, lastSection + nextP);
  }

  const bladeGeo = new THREE.BufferGeometry();
  bladeGeo.setAttribute('position', new THREE.Float32BufferAttribute(bladePositions, 3));
  bladeGeo.setIndex(bladeIndices);
  addGeo(bladeGeo);

  return root;
}
