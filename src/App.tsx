/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Scene, ShapeType, LayoutMode } from './components/Scene';
import { Settings2, GripHorizontal, GripVertical, Layers, Square, Type, List, LayoutGrid, Circle, Sparkles, Download, Video, Camera, Play, Pause, Loader2, RefreshCw, Upload, X, Hand, RotateCcw, Crosshair } from 'lucide-react';
import { Custom3DModel } from './types/custom3D';

export default function App() {
  const [shapeType, setShapeType] = useState<ShapeType>('softpoint');
  const [customModel, setCustomModel] = useState<Custom3DModel | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('linear');
  const [quantity, setQuantity] = useState(1);
  const [thickness, setThickness] = useState(0.5);
  const [radius, setRadius] = useState(0.4);
  const [twistAngle, setTwistAngle] = useState(0);
  const [spacing, setSpacing] = useState(0.8);
  const [color, setColor] = useState('#5c5cff'); // Default brand color
  const [ambientIntensity, setAmbientIntensity] = useState(0.4);
  const [lightRotation, setLightRotation] = useState(0);
  const [environmentPreset, setEnvironmentPreset] = useState('studio');
  const [bgColor, setBgColor] = useState('#e8e8ed'); // New background color state
  const [circleTilt, setCircleTilt] = useState(0); // For tilting radial layout
  const [bendAngle, setBendAngle] = useState(0); // Bend line into arc/circle
  const [waveAmplitude, setWaveAmplitude] = useState(0); // Sine wave amplitude
  const [waveFrequency, setWaveFrequency] = useState(1); // Sine wave frequency
  const [alignmentAxis, setAlignmentAxis] = useState<'x' | 'y' | 'z'>('x'); // Linear alignment axis

  // New state for animation & export
  const [animate, setAnimate] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [animationType, setAnimationType] = useState<'rotate' | 'zoom-in' | 'zoom-out' | 'float' | 'tumble' | 'swing' | 'all'>('rotate');
  const [animationScope, setAnimationScope] = useState<'group' | 'individual'>('group');
  const [cameraFov, setCameraFov] = useState(45);
  const [cameraAutoRotate, setCameraAutoRotate] = useState(false);
  const [cameraAutoRotateSpeed, setCameraAutoRotateSpeed] = useState(2);
  const [cameraTrigger, setCameraTrigger] = useState<{ id: number, preset: string } | undefined>(undefined);
  const [transparentBg, setTransparentBg] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'none' | 'solid' | 'transparent'>('none');
  const [shininess, setShininess] = useState(0.45); // Softer shine default (diminuído conforme pedido)
  const roughness = 0.14 + (1 - shininess) * 0.28;
  const clearcoat = shininess * 0.75;
  const clearcoatRoughness = 0.06 + (1 - shininess) * 0.16;
  const exportBridgeRef = useRef<{ captureImage: (format: 'png' | 'jpeg', transparent: boolean) => string } | null>(null);

  // Background Drag Mode (Girar 3D por padrão vs Pan / Posicionar na tela)
  const [dragMode, setDragMode] = useState<'rotate' | 'pan'>('rotate');
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(targetTag) || (e.target as HTMLElement)?.isContentEditable;
      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    const handleBlur = () => {
      setIsSpacePressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const activeDragMode = isSpacePressed ? 'pan' : dragMode;

  const [itemOverrides, setItemOverrides] = useState<Record<number, { x: number, y: number, z: number, rx: number, ry: number, rz: number }>>({});
  const [selectedPiece, setSelectedPiece] = useState<number | null>(null);

  const handleOverrideChange = (index: number, field: string, value: number) => {
    setItemOverrides(prev => ({
      ...prev,
      [index]: {
        ...(prev[index] || { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 }),
        [field]: value
      }
    }));
  };

  const handleItemDrag = (index: number, dx: number, dy: number, dz: number) => {
    setItemOverrides(prev => ({
      ...prev,
      [index]: {
        ...(prev[index] || { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 }),
        x: dx,
        y: dy,
        z: dz
      }
    }));
    // Auto-select the dragged piece so the sliders show up!
    setSelectedPiece(index);
  };

  const triggerCamera = (preset: string) => {
    setCameraTrigger({ id: Date.now(), preset });
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setGenerationError(null);

    try {
      const fileNameLower = file.name.toLowerCase();
      if (fileNameLower.endsWith('.glb') || fileNameLower.endsWith('.gltf')) {
        const buffer = await file.arrayBuffer();
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const loader = new GLTFLoader();
        loader.parse(
          buffer,
          '',
          (gltf) => {
            const obj = gltf.scene;
            const bbox = new THREE.Box3().setFromObject(obj);
            const center = bbox.getCenter(new THREE.Vector3());
            const size = bbox.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z) || 1;
            const scale = 2.4 / maxDim;
            obj.position.sub(center.multiplyScalar(scale));
            obj.scale.multiplyScalar(scale);

            const uploaded: Custom3DModel = {
              id: `upload-${Date.now()}`,
              name: file.name.replace(/\.[^/.]+$/, ''),
              prompt: file.name,
              description: `Modelo 3D importado: ${file.name}`,
              parts: [],
              importedScene: obj,
            };
            setCustomModel(uploaded);
            setShapeType('custom');
            setIsUploading(false);
          },
          (err) => {
            console.error(err);
            setGenerationError('Falha ao processar arquivo 3D GLB/GLTF.');
            setIsUploading(false);
          }
        );
      } else if (fileNameLower.endsWith('.obj')) {
        const text = await file.text();
        const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
        const loader = new OBJLoader();
        const obj = loader.parse(text);
        const bbox = new THREE.Box3().setFromObject(obj);
        const center = bbox.getCenter(new THREE.Vector3());
        const size = bbox.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const scale = 2.4 / maxDim;
        obj.position.sub(center.multiplyScalar(scale));
        obj.scale.multiplyScalar(scale);

        const uploaded: Custom3DModel = {
          id: `upload-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          prompt: file.name,
          description: `Modelo 3D importado: ${file.name}`,
          parts: [],
          importedScene: obj,
        };
        setCustomModel(uploaded);
        setShapeType('custom');
        setIsUploading(false);
      } else {
        setGenerationError('Formato não suportado. Por favor, envie arquivos .glb, .gltf ou .obj');
        setIsUploading(false);
      }
    } catch (err: any) {
      console.error(err);
      setGenerationError('Erro ao carregar o arquivo 3D.');
      setIsUploading(false);
    }
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const exportImage = (format: 'png' | 'jpeg', transparent: boolean) => {
    try {
      if (exportBridgeRef.current?.captureImage) {
        // High-fidelity super-sampled anti-aliased render (zero serrilhado)
        const dataUrl = exportBridgeRef.current.captureImage(format, transparent);
        const link = document.createElement('a');
        link.download = `softpoint-render-${Date.now()}.${format}`;
        link.href = dataUrl;
        link.click();
        return;
      }
    } catch (err) {
      console.warn('Super-sample capture fallback', err);
    }

    if (transparent) {
      setTransparentBg(true);
    }
    
    // Fallback if bridge is not ready
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const dataUrl = canvas.toDataURL(`image/${format}`, 1.0);
        const link = document.createElement('a');
        link.download = `softpoint-render-${Date.now()}.${format}`;
        link.href = dataUrl;
        link.click();
      }
      if (transparent) {
        setTransparentBg(false);
      }
    }, 150);
  };

  const toggleRecording = (transparent: boolean) => {
    // If currently recording, stop cleanly
    if (recordingMode !== 'none') {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.warn('Error stopping MediaRecorder:', e);
        }
      }
      setRecordingMode('none');
      if (transparentBg) setTransparentBg(false);
      return;
    }

    // Start recording
    if (transparent) {
      setTransparentBg(true);
    }
    setRecordingMode(transparent ? 'transparent' : 'solid');
    setAnimate(true); // Force animation on while recording

    // Clean up any previously opened tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        setRecordingMode('none');
        if (transparent) setTransparentBg(false);
        return;
      }

      try {
        const stream = canvas.captureStream(60);
        streamRef.current = stream;

        // Choose best supported MIME type
        const candidates = transparent
          ? [
              'video/webm;codecs=vp9',
              'video/webm;codecs=vp8',
              'video/webm',
            ]
          : [
              'video/webm;codecs=vp9',
              'video/webm;codecs=vp8',
              'video/mp4',
              'video/webm',
            ];

        let selectedMime = 'video/webm';
        for (const candidate of candidates) {
          if (MediaRecorder.isTypeSupported(candidate)) {
            selectedMime = candidate;
            break;
          }
        }

        const recorder = new MediaRecorder(stream, {
          mimeType: selectedMime,
          videoBitsPerSecond: 16000000, // 16 Mbps: super crisp and stable across repeated exports
        });

        chunksRef.current = [];

        recorder.ondataavailable = (e: BlobEvent) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        recorder.onerror = (e) => {
          console.error('MediaRecorder error event:', e);
          setRecordingMode('none');
          if (transparent) setTransparentBg(false);
        };

        recorder.onstop = () => {
          // Stop media stream tracks cleanly
          stream.getTracks().forEach((track) => track.stop());
          if (streamRef.current === stream) {
            streamRef.current = null;
          }

          if (chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: selectedMime });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const ext = selectedMime.includes('mp4') ? 'mp4' : 'webm';
            link.href = url;
            link.download = `softpoint-animation${transparent ? '-transparent' : ''}-${Date.now()}.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Keep the Blob URL alive so the browser can finish downloading cleanly
            setTimeout(() => {
              URL.revokeObjectURL(url);
            }, 20000);
          } else {
            console.warn('MediaRecorder produced 0 chunks.');
          }

          if (transparent) {
            setTransparentBg(false);
          }
          setRecordingMode('none');
        };

        mediaRecorderRef.current = recorder;
        // Request chunking every 250ms so all frames are captured reliably
        recorder.start(250);
      } catch (err) {
        console.error('Failed to start MediaRecorder:', err);
        setRecordingMode('none');
        if (transparent) setTransparentBg(false);
      }
    }, 150);
  };

  return (
    <div className="flex h-screen w-full bg-neutral-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-80 h-full bg-white border-r border-neutral-200 flex flex-col shadow-sm z-10 relative">
        <div className="p-6 border-b border-neutral-200 flex items-center justify-start">
          <img 
            src="https://res.cloudinary.com/drvtrbeky/image/upload/v1775486507/Cinza_lakfmo.png" 
            alt="Logo Softplan" 
            className="h-5 object-contain" 
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Format Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Formato (Format)</h3>
              <input
                ref={fileInputRef}
                type="file"
                accept=".glb,.gltf,.obj"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center space-x-1.5 py-1 px-2.5 bg-neutral-100 hover:bg-indigo-50 text-neutral-700 hover:text-indigo-700 border border-neutral-200 hover:border-indigo-300 rounded-md text-xs font-medium transition-all shadow-xs"
                title="Importar modelo 3D próprio (.glb, .gltf, .obj)"
              >
                {isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload 3D</span>
                  </>
                )}
              </button>
            </div>

            {generationError && (
              <p className="text-[11px] text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {generationError}
              </p>
            )}

            <div className={`grid ${customModel ? 'grid-cols-4' : 'grid-cols-3'} gap-1.5 p-1 bg-neutral-100 rounded-lg border border-neutral-200`}>
              <button
                onClick={() => setShapeType('softpoint')}
                className={`flex items-center justify-center space-x-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${shapeType === 'softpoint' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5 font-semibold' : 'text-neutral-500 hover:text-neutral-700'}`}
                title="Apenas Softpoints"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Soft</span>
              </button>
              <button
                onClick={() => setShapeType('logo')}
                className={`flex items-center justify-center space-x-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${shapeType === 'logo' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5 font-semibold' : 'text-neutral-500 hover:text-neutral-700'}`}
                title="Apenas Logo 'S'"
              >
                <Type className="w-3.5 h-3.5" />
                <span>Logo</span>
              </button>
              <button
                onClick={() => setShapeType('mixed')}
                className={`flex items-center justify-center space-x-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${shapeType === 'mixed' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5 font-semibold' : 'text-neutral-500 hover:text-neutral-700'}`}
                title="Mistura (Softpoint + Logo)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Misto</span>
              </button>
              {customModel && (
                <div className="relative flex items-center">
                  <button
                    onClick={() => setShapeType('custom')}
                    className={`w-full flex items-center justify-center space-x-1 py-2 pl-2 pr-5 rounded-md text-xs font-medium transition-all ${shapeType === 'custom' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5 font-semibold' : 'text-neutral-500 hover:text-neutral-700'}`}
                    title={`Modelo 3D Importado: ${customModel.name}`}
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate max-w-[50px]">{customModel.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCustomModel(null);
                      if (shapeType === 'custom') setShapeType('softpoint');
                    }}
                    className="absolute right-1 p-0.5 text-neutral-400 hover:text-red-500 rounded transition-colors"
                    title="Remover modelo importado"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* Material & Color */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Material & Cor</h3>
              <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {shininess <= 0.35 ? 'Acetinado' : shininess <= 0.6 ? 'Brilho Suave' : 'Alto Brilho'} ({Math.round(shininess * 100)}%)
              </span>
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Cores</label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setColor('#5c5cff')}
                  className={`py-2 rounded-md shadow-sm border transition-all flex flex-col items-center justify-center ${color === '#5c5cff' ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-neutral-200 hover:border-indigo-300'}`}
                  style={{ backgroundColor: '#5c5cff' }}
                  title="Azul Brand Softplan"
                >
                  <span className="text-white text-xs font-semibold drop-shadow-md">Brand</span>
                </button>
                <button
                  onClick={() => setColor('#ffffff')}
                  className={`py-2 rounded-md shadow-sm border transition-all flex flex-col items-center justify-center ${color === '#ffffff' ? 'ring-2 ring-neutral-400 border-neutral-400' : 'border-neutral-200 hover:border-neutral-300'}`}
                  style={{ backgroundColor: '#ffffff' }}
                  title="Branco Sólido"
                >
                  <span className="text-neutral-700 text-xs font-semibold">Branco</span>
                </button>
                <button
                  onClick={() => setColor('mixed')}
                  className={`py-2 rounded-md shadow-sm border transition-all flex flex-col items-center justify-center ${color === 'mixed' ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-neutral-200 hover:border-indigo-300'}`}
                  style={{ background: 'linear-gradient(135deg, #5c5cff 50%, #ffffff 50%)' }}
                  title="Mesclar (Brand + Branco alternados)"
                >
                  <span className="text-neutral-800 text-[11px] font-semibold bg-white/90 px-1 py-0.5 rounded shadow-xs">Misto</span>
                </button>
                <label
                  className={`py-2 rounded-md shadow-sm border transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden ${color !== '#5c5cff' && color !== '#ffffff' && color !== 'mixed' ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50'}`}
                  style={color !== '#5c5cff' && color !== '#ffffff' && color !== 'mixed' ? { backgroundColor: color } : {}}
                  title="Cor Personalizada"
                >
                  <span className={`text-[11px] font-semibold ${color !== '#5c5cff' && color !== '#ffffff' && color !== 'mixed' ? 'text-white drop-shadow-md' : 'text-neutral-600'}`}>
                    Custom
                  </span>
                  <input
                    type="color"
                    value={color === 'mixed' ? '#5c5cff' : color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
              </div>
            </div>

            {/* Shininess / Gloss Slider */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                  Intensidade do Brilho (Gloss)
                </label>
                <span className="text-xs text-neutral-500 font-mono">
                  {Math.round(shininess * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={shininess}
                onChange={(e) => setShininess(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Acetinado</span>
                <span className="text-indigo-600 font-medium">Suave (Padrão)</span>
                <span>Espelhado</span>
              </div>
            </div>

            <p className="text-xs text-neutral-500 bg-neutral-50 p-2.5 rounded-md border border-neutral-200/80 leading-relaxed">
              ✨ Material refinado: acabamento esmaltado com <strong>brilho suave e reflexos equilibrados de estúdio</strong>, sem reflexos estourados ou ofuscantes.
            </p>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* Shape Controls */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Shape Setup</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700">Thickness (Grossura)</label>
                <span className="text-xs text-neutral-500 font-mono">{thickness.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="2"
                step="0.05"
                value={thickness}
                onChange={(e) => setThickness(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className={`space-y-3 transition-opacity ${shapeType === 'logo' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700">Corner Radius</label>
                <span className="text-xs text-neutral-500 font-mono">{radius.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={radius}
                onChange={(e) => setRadius(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
                disabled={shapeType === 'logo'}
              />
              {shapeType === 'logo' && <p className="text-[10px] text-neutral-400 leading-tight">Fixed for Logo</p>}
            </div>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* Arrangement Controls */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Arrangement</h3>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-neutral-700">Layout Pattern</label>
              <div className="grid grid-cols-4 gap-2 p-1 bg-neutral-100 rounded-lg border border-neutral-200">
                <button
                  onClick={() => setLayoutMode('linear')}
                  className={`flex items-center justify-center p-2 rounded-md transition-all ${layoutMode === 'linear' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-neutral-500 hover:text-neutral-700'}`}
                  title="Linear (Z-Axis)"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`flex items-center justify-center p-2 rounded-md transition-all ${layoutMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-neutral-500 hover:text-neutral-700'}`}
                  title="Grid (Matrix)"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayoutMode('radial')}
                  className={`flex items-center justify-center p-2 rounded-md transition-all ${layoutMode === 'radial' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-neutral-500 hover:text-neutral-700'}`}
                  title="Radial (Circle)"
                >
                  <Circle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayoutMode('random')}
                  className={`flex items-center justify-center p-2 rounded-md transition-all ${layoutMode === 'random' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-neutral-500 hover:text-neutral-700'}`}
                  title="Random Scatter"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700">Quantity (Quantidade)</label>
                <span className="text-xs text-neutral-500 font-mono">{quantity}</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700">Twist Angle (Ângulo)</label>
                <span className="text-xs text-neutral-500 font-mono">{twistAngle}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={twistAngle}
                onChange={(e) => setTwistAngle(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            {layoutMode === 'linear' && (
              <>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-neutral-700">Alignment Axis</label>
                  <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-100 rounded-lg border border-neutral-200">
                    <button
                      onClick={() => setAlignmentAxis('x')}
                      className={`flex items-center justify-center p-2 rounded-md transition-all ${alignmentAxis === 'x' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-neutral-500 hover:text-neutral-700'}`}
                      title="Side by Side (X-Axis)"
                    >
                      <GripHorizontal className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setAlignmentAxis('y')}
                      className={`flex items-center justify-center p-2 rounded-md transition-all ${alignmentAxis === 'y' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-neutral-500 hover:text-neutral-700'}`}
                      title="Stacked Vertically (Y-Axis)"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setAlignmentAxis('z')}
                      className={`flex items-center justify-center p-2 rounded-md transition-all ${alignmentAxis === 'z' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-neutral-500 hover:text-neutral-700'}`}
                      title="Depth / One behind another (Z-Axis)"
                    >
                      <Layers className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-neutral-700">Bend (Curvatura)</label>
                    <span className="text-xs text-neutral-500 font-mono">{bendAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={bendAngle}
                    onChange={(e) => setBendAngle(parseInt(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-neutral-700">Wave (Onda)</label>
                    <span className="text-xs text-neutral-500 font-mono">{waveAmplitude}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={waveAmplitude}
                    onChange={(e) => setWaveAmplitude(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-neutral-700">Wave Freq (Frequência)</label>
                    <span className="text-xs text-neutral-500 font-mono">{waveFrequency}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={waveFrequency}
                    onChange={(e) => setWaveFrequency(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </>
            )}

            {layoutMode === 'radial' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-neutral-700">Circle Tilt (Inclinação)</label>
                  <span className="text-xs text-neutral-500 font-mono">{circleTilt}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="1"
                  value={circleTilt}
                  onChange={(e) => setCircleTilt(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700">Spacing</label>
                <span className="text-xs text-neutral-500 font-mono">{spacing.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                step="0.1"
                value={spacing}
                onChange={(e) => setSpacing(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* Individual Piece Setup */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Manual Positions</h3>
              <button 
                onClick={() => setItemOverrides({})}
                className="text-xs text-indigo-600 font-medium hover:text-indigo-800"
              >
                Reset All
              </button>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-neutral-700">Select Piece</label>
              <select
                value={selectedPiece === null ? '' : selectedPiece}
                onChange={(e) => setSelectedPiece(e.target.value === '' ? null : parseInt(e.target.value))}
                className="w-full text-sm p-2 bg-white border border-neutral-200 rounded text-neutral-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- None Selected --</option>
                {Array.from({ length: quantity }).map((_, i) => (
                  <option key={i} value={i}>Piece {i + 1}</option>
                ))}
              </select>
            </div>

            {selectedPiece !== null && (
              <div className="space-y-4 pt-2">
                {/* Position Controls */}
                <div className="space-y-2 p-3 bg-neutral-50 rounded border border-neutral-100">
                  <span className="text-xs font-semibold text-neutral-600 block mb-2">Position Offsets</span>
                  {['x', 'y', 'z'].map((axis) => (
                    <div key={`pos-${axis}`} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-neutral-500 w-4 uppercase">{axis}</span>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        step="0.1"
                        value={itemOverrides[selectedPiece]?.[axis as keyof typeof itemOverrides[0]] ?? 0}
                        onChange={(e) => handleOverrideChange(selectedPiece, axis, parseFloat(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                      <span className="text-xs text-neutral-500 font-mono w-8 text-right">
                        {(itemOverrides[selectedPiece]?.[axis as keyof typeof itemOverrides[0]] ?? 0).toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Rotation Controls */}
                <div className="space-y-2 p-3 bg-neutral-50 rounded border border-neutral-100">
                  <span className="text-xs font-semibold text-neutral-600 block mb-2">Rotation Offsets (Rad)</span>
                  {['rx', 'ry', 'rz'].map((axis) => (
                    <div key={`rot-${axis}`} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-neutral-500 w-4 uppercase">{axis.replace('r', '')}</span>
                      <input
                        type="range"
                        min="-3.14"
                        max="3.14"
                        step="0.05"
                        value={itemOverrides[selectedPiece]?.[axis as keyof typeof itemOverrides[0]] ?? 0}
                        onChange={(e) => handleOverrideChange(selectedPiece, axis, parseFloat(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                      <span className="text-xs text-neutral-500 font-mono w-8 text-right">
                        {(itemOverrides[selectedPiece]?.[axis as keyof typeof itemOverrides[0]] ?? 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-neutral-100" />

          {/* Background Setup */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Background Setup</h3>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-neutral-200 p-0 shadow-sm"
              />
              <div className="flex-1 grid grid-cols-4 gap-2">
                {['#e8e8ed', '#171717', '#5c5cff', '#000000'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setBgColor(preset)}
                    className={`w-full py-2 rounded shadow-sm border transition-all ${bgColor === preset ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-neutral-200 hover:border-neutral-300'}`}
                    style={{ backgroundColor: preset }}
                    title={preset}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* Lighting Controls */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Lighting Setup</h3>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-neutral-700">Environment Setup</label>
              <div className="grid grid-cols-2 gap-2">
                {(['studio', 'city', 'sunset', 'dawn', 'night', 'warehouse', 'forest', 'apartment'] as const).map(preset => (
                  <button
                    key={preset}
                    onClick={() => setEnvironmentPreset(preset)}
                    className={`py-1.5 text-xs font-medium rounded border transition-colors capitalize ${environmentPreset === preset ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-neutral-200 text-neutral-600 hover:border-indigo-300'}`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700">Ambient Intensity</label>
                <span className="text-xs text-neutral-500 font-mono">{ambientIntensity.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={ambientIntensity}
                onChange={(e) => setAmbientIntensity(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700">Light Rotation</label>
                <span className="text-xs text-neutral-500 font-mono">{lightRotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={lightRotation}
                onChange={(e) => setLightRotation(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* Camera Controls */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4" /> Camera Setup
            </h3>

            {/* Background Drag Mode */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Arrastar o Fundo</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDragMode('pan')}
                  className={`flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold rounded-md border transition-all ${
                    dragMode === 'pan'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                  title="Arrastar o fundo translada e posiciona os elementos na tela"
                >
                  <Hand className="w-3.5 h-3.5" />
                  <span>Posicionar (Pan)</span>
                </button>
                <button
                  onClick={() => setDragMode('rotate')}
                  className={`flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold rounded-md border transition-all ${
                    dragMode === 'rotate'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                  title="Arrastar o fundo gira a perspectiva 3D"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Girar 3D</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">Quick Angles</label>
                <button
                  onClick={() => triggerCamera('center')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  title="Centralizar elemento no meio da tela"
                >
                  <Crosshair className="w-3 h-3" />
                  <span>Centralizar</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['front', 'top', 'side', 'isometric', 'bottom', 'back', 'close-up'] as const).map(preset => (
                  <button
                    key={preset}
                    onClick={() => triggerCamera(preset)}
                    className="py-1.5 text-xs font-medium rounded border transition-colors capitalize bg-white border-neutral-200 text-neutral-600 hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700">Field of View (FOV)</label>
                <span className="text-xs text-neutral-500 font-mono">{cameraFov}°</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={cameraFov}
                onChange={(e) => setCameraFov(parseInt(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-neutral-400">
                <span>Zoom (Telephoto)</span>
                <span>Wide Angle</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700">Auto-Rotate View</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoRotate"
                    checked={cameraAutoRotate}
                    onChange={(e) => setCameraAutoRotate(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-neutral-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="autoRotate" className="ml-2 text-xs text-neutral-600">Enable</label>
                </div>
              </div>
              
              <div className={`space-y-1 transition-opacity ${!cameraAutoRotate ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-500">Speed</span>
                  <span className="text-xs text-neutral-500 font-mono">{cameraAutoRotateSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="10"
                  step="0.5"
                  value={cameraAutoRotateSpeed}
                  onChange={(e) => setCameraAutoRotateSpeed(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* Animation Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Animation</h3>
              <button
                onClick={() => setAnimate(!animate)}
                className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${animate ? 'bg-indigo-100 text-indigo-700' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                title={animate ? "Pause" : "Play"}
              >
                {animate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
            
            <div className={`space-y-4 transition-opacity ${!animate ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Type</label>
                <div className="flex flex-wrap gap-2">
                  {(['rotate', 'zoom-in', 'zoom-out', 'float', 'tumble', 'swing', 'all'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setAnimationType(type)}
                      className={`flex-1 min-w-[30%] py-1.5 px-2 text-xs font-medium rounded border transition-colors capitalize ${animationType === type ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-neutral-200 text-neutral-600 hover:border-indigo-300'}`}
                    >
                      {type.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Scope</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAnimationScope('group')}
                    className={`py-1.5 text-xs font-medium rounded border transition-colors ${animationScope === 'group' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-neutral-200 text-neutral-600 hover:border-indigo-300'}`}
                  >
                    Group
                  </button>
                  <button
                    onClick={() => setAnimationScope('individual')}
                    className={`py-1.5 text-xs font-medium rounded border transition-colors ${animationScope === 'individual' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-neutral-200 text-neutral-600 hover:border-indigo-300'}`}
                  >
                    Individual
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-neutral-700">Speed</label>
                  <span className="text-xs text-neutral-500 font-mono">{animationSpeed.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* Export Controls */}
          <div className="space-y-4 pb-8">
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Export</h3>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => exportImage('png', true)}
                className="flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium bg-white border border-neutral-200 text-neutral-700 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm"
              >
                <Camera className="w-4 h-4" />
                <span>PNG (Transparent)</span>
              </button>
              <button
                onClick={() => exportImage('jpeg', false)}
                className="flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium bg-white border border-neutral-200 text-neutral-700 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>JPG (Solid)</span>
              </button>
              <button
                onClick={() => recordingMode === 'solid' ? toggleRecording(false) : toggleRecording(false)}
                disabled={recordingMode === 'transparent'}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium border transition-all shadow-sm ${recordingMode === 'solid' ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-white border-neutral-200 text-neutral-700 hover:border-indigo-300 hover:text-indigo-600'} ${recordingMode === 'transparent' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Video className="w-4 h-4" />
                <span>{recordingMode === 'solid' ? 'Stop Recording' : 'Record Video (Solid)'}</span>
              </button>
              <button
                onClick={() => recordingMode === 'transparent' ? toggleRecording(true) : toggleRecording(true)}
                disabled={recordingMode === 'solid'}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium border transition-all shadow-sm ${recordingMode === 'transparent' ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-white border-neutral-200 text-neutral-700 hover:border-indigo-300 hover:text-indigo-600'} ${recordingMode === 'solid' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Video className="w-4 h-4" />
                <span>{recordingMode === 'transparent' ? 'Stop Recording' : 'Record Video (Transparent)'}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 relative cursor-grab active:cursor-grabbing select-none">
        {/* Floating Canvas Quick Controls */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 flex items-center bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-xl shadow-lg border border-neutral-200/90 space-x-1">
          <button
            onClick={() => setDragMode('rotate')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !isSpacePressed && dragMode === 'rotate'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Clique e arraste no fundo para girar a perspectiva 3D"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Girar 3D</span>
          </button>

          <button
            onClick={() => setDragMode('pan')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isSpacePressed || dragMode === 'pan'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
            title="Clique e arraste no fundo para mover e posicionar os elementos na tela"
          >
            <Hand className="w-3.5 h-3.5" />
            <span>{isSpacePressed ? 'Espaço: Movendo Tela' : 'Mover Tela (Pan)'}</span>
          </button>

          <div className="w-px h-4 bg-neutral-200 mx-1" />

          <button
            onClick={() => triggerCamera('center')}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            title="Centralizar elemento no meio da tela"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Centralizar</span>
          </button>
        </div>

        <Scene
          shapeType={shapeType}
          customModel={customModel}
          layoutMode={layoutMode}
          quantity={quantity}
          thickness={thickness}
          radius={radius}
          twistAngle={twistAngle}
          spacing={spacing}
          color={color}
          roughness={roughness}
          metalness={0.02}
          clearcoat={clearcoat}
          clearcoatRoughness={clearcoatRoughness}
          exportBridgeRef={exportBridgeRef}
          isRecording={recordingMode !== 'none'}
          dragMode={dragMode}
          isSpacePressed={isSpacePressed}
          bgColor={bgColor}
          ambientIntensity={ambientIntensity}
          lightRotation={lightRotation}
          environmentPreset={environmentPreset as any}
          transparentBg={transparentBg}
          animate={animate}
          animationSpeed={animationSpeed}
          animationType={animationType}
          animationScope={animationScope}
          cameraFov={cameraFov}
          autoRotate={cameraAutoRotate}
          autoRotateSpeed={cameraAutoRotateSpeed}
          cameraTrigger={cameraTrigger}
          itemOverrides={itemOverrides}
          onItemDrag={handleItemDrag}
          circleTilt={circleTilt}
          bendAngle={bendAngle}
          waveAmplitude={waveAmplitude}
          waveFrequency={waveFrequency}
          alignmentAxis={alignmentAxis}
        />
        
        {/* Helper overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none bg-neutral-900/85 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-medium flex items-center space-x-3 shadow-lg border border-white/10">
          <span className="flex items-center gap-1.5">
            {isSpacePressed ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold animate-pulse">
                <Hand className="w-3.5 h-3.5" />
                Mova o mouse para posicionar
              </span>
            ) : dragMode === 'rotate' ? (
              <span className="flex items-center gap-1 text-indigo-300">
                <RotateCcw className="w-3.5 h-3.5" />
                Arraste o fundo para girar 3D
              </span>
            ) : (
              <span className="flex items-center gap-1 text-indigo-300">
                <Hand className="w-3.5 h-3.5" />
                Arraste o fundo para mover
              </span>
            )}
          </span>
          <span className="opacity-40">•</span>
          <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-mono text-white/95">
            [Espaço] + Mover mouse = Mover Tela
          </span>
          <span className="opacity-40">•</span>
          <span>Scroll para zoom</span>
        </div>
      </main>
    </div>
  );
}

