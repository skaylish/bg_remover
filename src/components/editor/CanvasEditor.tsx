'use client';

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import { useEditorStore } from '@/store/editorStore';

export interface CanvasEditorHandle {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  exportPng: (scale?: number) => Promise<Blob | null>;
  exportJpeg: (scale?: number) => Promise<Blob | null>;
}

interface CanvasEditorProps {
  processedDataUrl: string;
  originalDataUrl: string;
}

const MAX_UNDO = 20;

// Draw checkerboard pattern
function drawCheckerboard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  const cs = 14;
  const pat = (() => {
    const tmp = document.createElement('canvas');
    tmp.width = cs * 2; tmp.height = cs * 2;
    const tc = tmp.getContext('2d')!;
    tc.fillStyle = '#1a1a28'; tc.fillRect(0, 0, cs * 2, cs * 2);
    tc.fillStyle = '#141420'; tc.fillRect(0, 0, cs, cs); tc.fillRect(cs, cs, cs, cs);
    return ctx.createPattern(tmp, 'repeat');
  })();
  if (pat) { ctx.fillStyle = pat; ctx.fillRect(x, y, w, h); }
}

const CanvasEditor = forwardRef<CanvasEditorHandle, CanvasEditorProps>(
  ({ processedDataUrl, originalDataUrl }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const maskCanvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const mode = useEditorStore((s) => s.mode);
    const brushSize = useEditorStore((s) => s.brushSize);
    const brushType = useEditorStore((s) => s.brushType);
    const zoom = useEditorStore((s) => s.zoom);
    const showOriginal = useEditorStore((s) => s.showOriginal);
    const backgroundColor = useEditorStore((s) => s.backgroundColor);
    const backgroundType = useEditorStore((s) => s.backgroundType);
    const backgroundGradient = useEditorStore((s) => s.backgroundGradient);
    const backgroundBlur = useEditorStore((s) => s.backgroundBlur);
    const effects = useEditorStore((s) => s.effects);

    const undoStackRef = useRef<ImageData[]>([]);
    const redoStackRef = useRef<ImageData[]>([]);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const fgImgRef = useRef<HTMLImageElement | null>(null);
    const origImgRef = useRef<HTMLImageElement | null>(null);
    const blurredCacheRef = useRef<HTMLCanvasElement | null>(null);
    const isPainting = useRef(false);
    const panStart = useRef<{ x: number; y: number } | null>(null);
    const panOffset = useRef({ x: 0, y: 0 });
    const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

    // Load images
    useEffect(() => {
      blurredCacheRef.current = null; // reset blur cache on new image

      const fg = new Image();
      fg.crossOrigin = 'anonymous';
      fg.onload = () => { fgImgRef.current = fg; };
      fg.src = processedDataUrl;

      const orig = new Image();
      orig.crossOrigin = 'anonymous';
      orig.onload = () => {
        origImgRef.current = orig;
        setImgSize({ w: orig.naturalWidth, h: orig.naturalHeight });

        const mc = maskCanvasRef.current;
        if (!mc) return;
        mc.width = orig.naturalWidth;
        mc.height = orig.naturalHeight;
        const ctx = mc.getContext('2d')!;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, mc.width, mc.height);
      };
      orig.src = originalDataUrl;
    }, [processedDataUrl, originalDataUrl]);

    // Build masked foreground onto an offscreen canvas
    const buildMaskedFg = useCallback((w: number, h: number): HTMLCanvasElement => {
      const mc = maskCanvasRef.current!;
      const fg = fgImgRef.current!;
      const off = document.createElement('canvas');
      off.width = w; off.height = h;
      const ctx = off.getContext('2d')!;

      // Apply color adjustments via CSS filter
      const { brightness, contrast, saturation } = effects;
      const hasFilter = brightness !== 100 || contrast !== 100 || saturation !== 100;
      if (hasFilter) {
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      }
      ctx.drawImage(fg, 0, 0, w, h);
      ctx.filter = 'none';

      // Apply mask
      ctx.globalCompositeOperation = 'destination-in';
      ctx.drawImage(mc, 0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      return off;
    }, [effects]);

    // Get/build blurred background canvas
    const getBlurredBg = useCallback((w: number, h: number, blurPx: number): HTMLCanvasElement => {
      if (blurredCacheRef.current &&
          blurredCacheRef.current.width === w &&
          blurredCacheRef.current.height === h) {
        return blurredCacheRef.current;
      }
      const off = document.createElement('canvas');
      off.width = w; off.height = h;
      const ctx = off.getContext('2d')!;
      ctx.filter = `blur(${blurPx}px)`;
      ctx.drawImage(origImgRef.current!, 0, 0, w, h);
      ctx.filter = 'none';
      blurredCacheRef.current = off;
      return off;
    }, []);

    // Invalidate blur cache when blur value changes
    useEffect(() => { blurredCacheRef.current = null; }, [backgroundBlur]);

    const getDisplayRect = useCallback((cw: number, ch: number, iw: number, ih: number) => {
      const baseScale = Math.min(cw / iw, ch / ih) * 0.9;
      const scale = baseScale * zoom;
      const x = panOffset.current.x + (cw - iw * scale) / 2;
      const y = panOffset.current.y + (ch - ih * scale) / 2;
      return { x, y, w: iw * scale, h: ih * scale, scale };
    }, [zoom]);

    const render = useCallback(() => {
      const canvas = canvasRef.current;
      const mc = maskCanvasRef.current;
      if (!canvas || !fgImgRef.current || !mc) return;
      const ctx = canvas.getContext('2d')!;
      const { w: iw, h: ih } = imgSize;
      if (!iw || !ih) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }

      const cw = canvas.width, ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      ctx.save();

      const { x, y, w, h } = getDisplayRect(cw, ch, iw, ih);

      // ── Show original mode ──
      if (showOriginal && origImgRef.current) {
        ctx.drawImage(origImgRef.current, x, y, w, h);
        ctx.restore();
        return;
      }

      // ── Background ──
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.clip();

      if (backgroundType === 'transparent') {
        drawCheckerboard(ctx, x, y, w, h);
      } else if (backgroundType === 'color') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(x, y, w, h);
      } else if (backgroundType === 'gradient') {
        const rad = (backgroundGradient.angle * Math.PI) / 180;
        const cx2 = x + w / 2, cy2 = y + h / 2;
        const len = Math.sqrt(w * w + h * h) / 2;
        const grd = ctx.createLinearGradient(
          cx2 - Math.cos(rad) * len, cy2 - Math.sin(rad) * len,
          cx2 + Math.cos(rad) * len, cy2 + Math.sin(rad) * len
        );
        grd.addColorStop(0, backgroundGradient.from);
        grd.addColorStop(1, backgroundGradient.to);
        ctx.fillStyle = grd;
        ctx.fillRect(x, y, w, h);
      } else if (backgroundType === 'blur') {
        if (origImgRef.current) {
          const blurred = getBlurredBg(iw, ih, backgroundBlur);
          ctx.drawImage(blurred, x, y, w, h);
        }
      }
      ctx.restore();

      // ── Shadow ──
      const { shadowType, shadowOpacity, shadowBlur: sBl, shadowOffsetX, shadowOffsetY } = effects;
      const maskedFg = buildMaskedFg(iw, ih);

      if (shadowType !== 'none') {
        ctx.save();
        const shadowColor = `rgba(0,0,0,${shadowOpacity})`;
        if (shadowType === 'soft') {
          ctx.shadowColor = shadowColor;
          ctx.shadowBlur = sBl;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = sBl * 0.3;
          ctx.drawImage(maskedFg, x, y, w, h);
          ctx.shadowColor = 'transparent';
        } else if (shadowType === 'drop') {
          ctx.shadowColor = shadowColor;
          ctx.shadowBlur = sBl;
          ctx.shadowOffsetX = (shadowOffsetX / iw) * w;
          ctx.shadowOffsetY = (shadowOffsetY / ih) * h;
          ctx.drawImage(maskedFg, x, y, w, h);
          ctx.shadowColor = 'transparent';
        } else if (shadowType === 'float') {
          // Elliptical shadow at bottom
          ctx.beginPath();
          const ex = x + w * 0.15, ey = y + h - 8;
          const ew = w * 0.7, eh = 20;
          ctx.ellipse(ex + ew / 2, ey, ew / 2, eh / 2, 0, 0, Math.PI * 2);
          ctx.fillStyle = shadowColor;
          ctx.filter = `blur(${sBl}px)`;
          ctx.fill();
          ctx.filter = 'none';
        }
        ctx.restore();
      }

      // ── Foreground ──
      ctx.drawImage(maskedFg, x, y, w, h);

      ctx.restore();
    }, [imgSize, zoom, showOriginal, backgroundColor, backgroundType, backgroundGradient, backgroundBlur,
        effects, getDisplayRect, buildMaskedFg, getBlurredBg]);

    // Re-render when state changes
    useEffect(() => {
      if (canvasRef.current && containerRef.current) {
        const c = containerRef.current;
        canvasRef.current.width = c.clientWidth;
        canvasRef.current.height = c.clientHeight;
      }
      render();
    }, [render]);

    // Resize observer
    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const obs = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          canvas.width = entry.contentRect.width;
          canvas.height = entry.contentRect.height;
        }
        render();
      });
      obs.observe(container);
      return () => obs.disconnect();
    }, [render]);

    // Brush / pan helpers
    const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !imgSize.w) return null;
      const rect = canvas.getBoundingClientRect();
      const cx = (clientX - rect.left) * (canvas.width / rect.width);
      const cy = (clientY - rect.top) * (canvas.height / rect.height);
      const { x, y, scale } = getDisplayRect(canvas.width, canvas.height, imgSize.w, imgSize.h);
      return { x: (cx - x) / scale, y: (cy - y) / scale };
    }, [imgSize, getDisplayRect]);

    const paint = useCallback((clientX: number, clientY: number) => {
      const mc = maskCanvasRef.current;
      if (!mc) return;
      const coords = getCanvasCoords(clientX, clientY);
      if (!coords) return;
      const ctx = mc.getContext('2d')!;
      const r = (brushSize / 2) / zoom;

      const grad = ctx.createRadialGradient(coords.x, coords.y, 0, coords.x, coords.y, r);

      if (mode === 'background') {
        // ERASE: destination-out으로 마스크 알파를 제거 → 해당 영역 투명해짐
        grad.addColorStop(0,   'rgba(0,0,0,1)');
        grad.addColorStop(0.7, 'rgba(0,0,0,0.8)');
        grad.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        // RESTORE: source-over로 흰색(불투명) 복원 → 해당 영역 다시 보임
        grad.addColorStop(0,   'rgba(255,255,255,1)');
        grad.addColorStop(0.7, 'rgba(255,255,255,0.8)');
        grad.addColorStop(1,   'rgba(255,255,255,0)');
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over'; // reset
      render();
    }, [brushSize, mode, zoom, getCanvasCoords, render]);

    const saveSnapshot = useCallback(() => {
      const mc = maskCanvasRef.current;
      if (!mc) return;
      const snap = mc.getContext('2d')!.getImageData(0, 0, mc.width, mc.height);
      undoStackRef.current.push(snap);
      if (undoStackRef.current.length > MAX_UNDO) undoStackRef.current.shift();
      redoStackRef.current = [];
      setCanUndo(true); setCanRedo(false);
    }, []);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
      if (mode === 'view') {
        panStart.current = { x: e.clientX - panOffset.current.x, y: e.clientY - panOffset.current.y };
        return;
      }
      saveSnapshot(); isPainting.current = true; paint(e.clientX, e.clientY);
    }, [mode, paint, saveSnapshot]);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
      if (mode === 'view' && panStart.current) {
        panOffset.current = { x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y };
        render(); return;
      }
      if (isPainting.current) paint(e.clientX, e.clientY);
    }, [mode, paint, render]);

    const onMouseUp = useCallback(() => {
      isPainting.current = false; panStart.current = null;
    }, []);

    const onWheel = useCallback((e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      useEditorStore.getState().setZoom(Math.max(0.1, Math.min(5, zoom + delta)));
    }, [zoom]);

    // Export helpers
    const buildExportCanvas = useCallback((withBg: boolean, scale = 1): HTMLCanvasElement | null => {
      const mc = maskCanvasRef.current;
      const fg = fgImgRef.current;
      const { w: origW, h: origH } = imgSize;
      if (!mc || !fg || !origW) return null;

      const w = Math.round(origW * scale);
      const h = Math.round(origH * scale);

      const off = document.createElement('canvas');
      off.width = w; off.height = h;
      const ctx = off.getContext('2d')!;

      // Background
      if (withBg) {
        if (backgroundType === 'color') {
          ctx.fillStyle = backgroundColor; ctx.fillRect(0, 0, w, h);
        } else if (backgroundType === 'gradient') {
          const rad = (backgroundGradient.angle * Math.PI) / 180;
          const cx2 = w / 2, cy2 = h / 2;
          const len = Math.sqrt(w * w + h * h) / 2;
          const grd = ctx.createLinearGradient(
            cx2 - Math.cos(rad) * len, cy2 - Math.sin(rad) * len,
            cx2 + Math.cos(rad) * len, cy2 + Math.sin(rad) * len
          );
          grd.addColorStop(0, backgroundGradient.from);
          grd.addColorStop(1, backgroundGradient.to);
          ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
        } else if (backgroundType === 'blur') {
          const blurred = getBlurredBg(origW, origH, backgroundBlur);
          ctx.drawImage(blurred, 0, 0, w, h);
        } else {
          ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
        }
      }

      // Shadow
      const { shadowType, shadowOpacity, shadowBlur: sBl, shadowOffsetX, shadowOffsetY } = effects;
      const maskedFg = buildMaskedFg(w, h);

      if (shadowType !== 'none') {
        const shadowColor = `rgba(0,0,0,${shadowOpacity})`;
        if (shadowType === 'soft') {
          ctx.shadowColor = shadowColor; ctx.shadowBlur = sBl; ctx.shadowOffsetY = sBl * 0.3;
        } else if (shadowType === 'drop') {
          ctx.shadowColor = shadowColor; ctx.shadowBlur = sBl;
          ctx.shadowOffsetX = shadowOffsetX; ctx.shadowOffsetY = shadowOffsetY;
        } else if (shadowType === 'float') {
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(w * 0.5, h - 10, w * 0.35, 15, 0, 0, Math.PI * 2);
          ctx.fillStyle = shadowColor;
          ctx.filter = `blur(${sBl}px)`; ctx.fill();
          ctx.filter = 'none'; ctx.restore();
        }
      }

      ctx.drawImage(maskedFg, 0, 0);
      ctx.shadowColor = 'transparent';
      return off;
    }, [imgSize, backgroundColor, backgroundType, backgroundGradient, backgroundBlur,
        effects, buildMaskedFg, getBlurredBg]);

    useImperativeHandle(ref, () => ({
      canUndo, canRedo,
      undo() {
        const mc = maskCanvasRef.current;
        if (!mc || !undoStackRef.current.length) return;
        const ctx = mc.getContext('2d')!;
        redoStackRef.current.push(ctx.getImageData(0, 0, mc.width, mc.height));
        ctx.putImageData(undoStackRef.current.pop()!, 0, 0);
        setCanUndo(undoStackRef.current.length > 0); setCanRedo(true);
        render();
      },
      redo() {
        const mc = maskCanvasRef.current;
        if (!mc || !redoStackRef.current.length) return;
        const ctx = mc.getContext('2d')!;
        undoStackRef.current.push(ctx.getImageData(0, 0, mc.width, mc.height));
        ctx.putImageData(redoStackRef.current.pop()!, 0, 0);
        setCanUndo(true); setCanRedo(redoStackRef.current.length > 0);
        render();
      },
      async exportPng(scale = 1) {
        if (backgroundType === 'transparent') {
          const clean = buildExportCanvas(false, scale);
          if (!clean) return null;
          return new Promise<Blob | null>((res) => clean.toBlob(res, 'image/png'));
        }
        const off = buildExportCanvas(true, scale);
        if (!off) return null;
        return new Promise<Blob | null>((res) => off.toBlob(res, 'image/png'));
      },
      async exportJpeg(scale = 1) {
        const off = buildExportCanvas(true, scale);
        if (!off) return null;
        return new Promise<Blob | null>((res) => off.toBlob(res, 'image/jpeg', 0.92));
      },
    }), [canUndo, canRedo, render, buildExportCanvas, backgroundType]);

    return (
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-hidden"
        style={{ cursor: mode === 'view' ? 'grab' : 'crosshair' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
        <canvas ref={maskCanvasRef} style={{ display: 'none' }} />
      </div>
    );
  }
);

CanvasEditor.displayName = 'CanvasEditor';
export { CanvasEditor };
