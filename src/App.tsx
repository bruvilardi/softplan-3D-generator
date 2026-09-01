/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { Scene, ShapeType, LayoutMode } from './components/Scene';
import { Settings2, GripHorizontal, GripVertical, Layers, Square, Type, List, LayoutGrid, Circle, Sparkles, Download, Video, Camera, Play, Pause } from 'lucide-react';

export default function App() {
  const [shapeType, setShapeType] = useState<ShapeType>('softpoint');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('linear');
  const [quantity, setQuantity] = useState(1);
  const [thickness, setThickness] = useState(0.5);
  const [radius, setRadius] = useState(0.4);
  const [twistAngle, setTwistAngle] = useState(0);
  const [spacing, setSpacing] = useState(0.8);
  const [color, setColor] = useState('#5c5cff'); // Default brand color
  const [transmission, setTransmission] = useState(1); // Glassiness
  const [roughness, setRoughness] = useState(0); // Frosted/Clear
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
  const [cameraTrigger, setCameraTrigger] = useState<{ id: number, preset: string } | undefined>(undefined);
  const [transparentBg, setTransparentBg] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'none' | 'solid' | 'transparent'>('none');

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

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const exportImage = (format: 'png' | 'jpeg', transparent: boolean) => {
    if (transparent) {
      setTransparentBg(true);
    }
    
    // Give it a frame to render without background
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
    if (recordingMode !== 'none') {
      mediaRecorderRef.current?.stop();
      setRecordingMode('none');
      if (transparentBg) setTransparentBg(false);
    } else {
      if (transparent) {
        setTransparentBg(true);
      }
      
      // Give React a tick to hide the background before capturing
      setTimeout(() => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return;
        
        const stream = canvas.captureStream(60);
        let mimeType = 'video/webm;codecs=vp9';
        
        if (transparent) {
          // Force webm for transparency support
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'video/webm'; 
          }
        } else {
          // Try to use MP4 if supported, fallback to webm
          if (MediaRecorder.isTypeSupported('video/mp4')) {
            mimeType = 'video/mp4';
          } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
            mimeType = 'video/webm;codecs=h264';
          }
        }
        
        mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
        chunksRef.current = [];
        
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
          link.href = url;
          link.download = `softpoint-animation${transparent ? '-transparent' : ''}.${ext}`;
          link.click();
          URL.revokeObjectURL(url);
          
          if (transparent) {
            setTransparentBg(false);
          }
        };
        
        mediaRecorderRef.current.start();
        setRecordingMode(transparent ? 'transparent' : 'solid');
        setAnimate(true); // Force animation on while recording
      }, 100);
    }
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
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Formato (Format)</h3>
            <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-lg border border-neutral-200">
              <button
                onClick={() => setShapeType('softpoint')}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${shapeType === 'softpoint' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                <Square className="w-4 h-4" />
                <span>Softpoint</span>
              </button>
              <button
                onClick={() => setShapeType('logo')}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${shapeType === 'logo' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                <Type className="w-4 h-4" />
                <span>Logo 'S'</span>
              </button>
            </div>
          </div>

          <div className="h-px bg-neutral-100" />

          {/* Material Setup */}
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Material Setup</h3>
            <div className="flex items-center space-x-3">
              <div className="flex-1 grid grid-cols-3 gap-2">
                <button
                  onClick={() => setColor('#5c5cff')}
                  className={`w-full py-2 rounded-md shadow-sm border transition-all flex items-center justify-center ${color === '#5c5cff' ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-neutral-200 hover:border-indigo-300'}`}
                  style={{ backgroundColor: '#5c5cff' }}
                  title="Brand Color"
                >
                  <span className="text-white text-xs font-semibold drop-shadow-md">Brand</span>
                </button>
                <button
                  onClick={() => setColor('#ffffff')}
                  className={`w-full py-2 rounded-md shadow-sm border transition-all flex items-center justify-center ${color === '#ffffff' ? 'ring-2 ring-neutral-400 border-neutral-400' : 'border-neutral-200 hover:border-neutral-300'}`}
                  style={{ backgroundColor: '#ffffff' }}
                  title="Transparent / Clear"
                >
                  <span className="text-neutral-600 text-xs font-semibold">Clear</span>
                </button>
                <button
                  onClick={() => setColor('mixed')}
                  className={`w-full py-2 rounded-md shadow-sm border transition-all flex items-center justify-center ${color === 'mixed' ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-neutral-200 hover:border-indigo-300'}`}
                  style={{ background: 'linear-gradient(135deg, #5c5cff 50%, #ffffff 50%)' }}
                  title="Both Mixed"
                >
                  <span className="text-neutral-800 text-xs font-semibold bg-white/80 px-1.5 py-0.5 rounded backdrop-blur-sm">Both</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700">Translucency (Glassiness)</label>
                <span className="text-xs text-neutral-500 font-mono">{transmission.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={transmission}
                onChange={(e) => setTransmission(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-700">Roughness (Frosted)</label>
                <span className="text-xs text-neutral-500 font-mono">{roughness.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={roughness}
                onChange={(e) => setRoughness(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Quick Angles</label>
              <div className="grid grid-cols-2 gap-2">
                {(['front', 'top', 'side', 'isometric'] as const).map(preset => (
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
      <main className="flex-1 relative cursor-grab active:cursor-grabbing">
        <Scene
          shapeType={shapeType}
          layoutMode={layoutMode}
          quantity={quantity}
          thickness={thickness}
          radius={radius}
          twistAngle={twistAngle}
          spacing={spacing}
          color={color}
          transmission={transmission}
          roughness={roughness}
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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
          <span>Click & Drag a piece to move it</span>
          <span className="opacity-50">•</span>
          <span>Drag background to rotate</span>
          <span className="opacity-50">•</span>
          <span>Scroll to zoom</span>
        </div>
      </main>
    </div>
  );
}

