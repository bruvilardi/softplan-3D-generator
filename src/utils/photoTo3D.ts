import * as THREE from 'three';

export interface PhotoSculptOptions {
  depthScale?: number;
  baseThickness?: number;
  resolution?: number;
}

/**
 * Creates an authentic 3D volumetric sculpture mesh directly from an image.
 * Uses high-resolution relief depth mapping, contour displacement, watertight boundary sealing,
 * and smooth vertex normal calculation.
 */
export async function createSculptureFromPhoto(
  imageDataUrl: string,
  options: PhotoSculptOptions = {}
): Promise<THREE.Group> {
  const { depthScale = 0.45, baseThickness = 0.16, resolution = 90 } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const aspect = img.width / img.height;
        let gridW = resolution;
        let gridH = Math.round(resolution / (aspect || 1));
        if (gridH > 120) gridH = 120;
        if (gridW > 120) gridW = 120;
        if (gridH < 40) gridH = 40;
        if (gridW < 40) gridW = 40;

        const canvas = document.createElement('canvas');
        canvas.width = gridW;
        canvas.height = gridH;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get 2D canvas context');

        ctx.drawImage(img, 0, 0, gridW, gridH);
        const imgData = ctx.getImageData(0, 0, gridW, gridH);
        const data = imgData.data;

        // Sample corner luminance to estimate background
        const cornerIndices = [
          0,
          (gridW - 1) * 4,
          ((gridH - 1) * gridW) * 4,
          ((gridH - 1) * gridW + gridW - 1) * 4,
        ];
        let bgLumSum = 0;
        cornerIndices.forEach((idx) => {
          bgLumSum += 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        });
        const bgLum = bgLumSum / 4;
        const isBgBright = bgLum > 128;

        // Extract normalized height values [0..1]
        const heights = new Float32Array(gridW * gridH);
        for (let y = 0; y < gridH; y++) {
          for (let x = 0; x < gridW; x++) {
            const idx = (y * gridW + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3] / 255;
            const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

            // Invert if background is light so foreground subject has relief height
            let h = isBgBright ? 1 - lum : lum;
            h = Math.max(0, Math.min(1, h)) * a;
            // Contrast boost for dramatic relief sculpting
            h = Math.pow(h, 0.85);
            heights[y * gridW + x] = h;
          }
        }

        // Mild 3x3 Gaussian smoothing for organic sculpted feel
        const smoothHeights = new Float32Array(gridW * gridH);
        for (let y = 0; y < gridH; y++) {
          for (let x = 0; x < gridW; x++) {
            let sum = 0;
            let count = 0;
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < gridW && ny >= 0 && ny < gridH) {
                  const weight = (dx === 0 && dy === 0) ? 4 : (dx === 0 || dy === 0) ? 2 : 1;
                  sum += heights[ny * gridW + nx] * weight;
                  count += weight;
                }
              }
            }
            smoothHeights[y * gridW + x] = sum / count;
          }
        }

        // Build 3D Mesh Geometry
        // Physical dimensions centered around origin
        const worldW = 1.8;
        const worldH = worldW / aspect;
        const halfW = worldW / 2;
        const halfH = worldH / 2;

        const positions: number[] = [];
        const indices: number[] = [];
        const uvs: number[] = [];

        // 1. FRONT DISPLACEMENT GRID
        for (let y = 0; y < gridH; y++) {
          const v = 1 - y / (gridH - 1);
          const py = (y / (gridH - 1) - 0.5) * -worldH;
          for (let x = 0; x < gridW; x++) {
            const u = x / (gridW - 1);
            const px = (x / (gridW - 1) - 0.5) * worldW;
            const h = smoothHeights[y * gridW + x];
            const pz = baseThickness * 0.5 + h * depthScale;
            positions.push(px, py, pz);
            uvs.push(u, v);
          }
        }

        // Front faces
        for (let y = 0; y < gridH - 1; y++) {
          for (let x = 0; x < gridW - 1; x++) {
            const i0 = y * gridW + x;
            const i1 = i0 + 1;
            const i2 = i0 + gridW;
            const i3 = i2 + 1;
            indices.push(i0, i1, i2);
            indices.push(i1, i3, i2);
          }
        }

        // 2. BACK RELIEF GRID (subtly curved for volumetric sculpted bust/plaque feel)
        const backOffset = gridW * gridH;
        for (let y = 0; y < gridH; y++) {
          const v = 1 - y / (gridH - 1);
          const py = (y / (gridH - 1) - 0.5) * -worldH;
          for (let x = 0; x < gridW; x++) {
            const u = x / (gridW - 1);
            const px = (x / (gridW - 1) - 0.5) * worldW;
            const h = smoothHeights[y * gridW + x];
            const pz = -baseThickness * 0.5 - h * (depthScale * 0.35);
            positions.push(px, py, pz);
            uvs.push(u, v);
          }
        }

        // Back faces (reverse winding so normals point backward)
        for (let y = 0; y < gridH - 1; y++) {
          for (let x = 0; x < gridW - 1; x++) {
            const i0 = backOffset + y * gridW + x;
            const i1 = i0 + 1;
            const i2 = i0 + gridW;
            const i3 = i2 + 1;
            indices.push(i0, i2, i1);
            indices.push(i1, i2, i3);
          }
        }

        // 3. WATERTIGHT SIDE WALLS (Seals top, bottom, left, right edges)
        // Top edge (y = 0)
        for (let x = 0; x < gridW - 1; x++) {
          const f0 = x;
          const f1 = x + 1;
          const b0 = backOffset + x;
          const b1 = backOffset + x + 1;
          indices.push(f0, b0, f1);
          indices.push(f1, b0, b1);
        }
        // Bottom edge (y = gridH - 1)
        const botY = gridH - 1;
        for (let x = 0; x < gridW - 1; x++) {
          const f0 = botY * gridW + x;
          const f1 = f0 + 1;
          const b0 = backOffset + f0;
          const b1 = backOffset + f1;
          indices.push(f0, f1, b0);
          indices.push(f1, b1, b0);
        }
        // Left edge (x = 0)
        for (let y = 0; y < gridH - 1; y++) {
          const f0 = y * gridW;
          const f1 = (y + 1) * gridW;
          const b0 = backOffset + f0;
          const b1 = backOffset + f1;
          indices.push(f0, b0, f1);
          indices.push(f1, b0, b1);
        }
        // Right edge (x = gridW - 1)
        for (let y = 0; y < gridH - 1; y++) {
          const f0 = y * gridW + (gridW - 1);
          const f1 = (y + 1) * gridW + (gridW - 1);
          const b0 = backOffset + f0;
          const b1 = backOffset + f1;
          indices.push(f0, f1, b0);
          indices.push(f1, b1, b0);
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geo.setIndex(indices);
        geo.computeVertexNormals();
        geo.center();

        const mesh = new THREE.Mesh(geo);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        const group = new THREE.Group();
        group.add(mesh);

        // Add an optional classic sculpted pedestal foot
        const pedestalGeo = new THREE.BoxGeometry(worldW * 1.05, 0.12, 0.5);
        pedestalGeo.center();
        const pedestalMesh = new THREE.Mesh(pedestalGeo);
        pedestalMesh.position.set(0, -worldH * 0.5 - 0.06, 0);
        pedestalMesh.castShadow = true;
        pedestalMesh.receiveShadow = true;
        group.add(pedestalMesh);

        resolve(group);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image for 3D sculpting'));
    img.src = imageDataUrl;
  });
}
