// 배경제거 결과를 캔버스에 렌더링하고 브러시로 마스크를 편집하는 에디터
'use client';

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useEditorStore } from '@/store/editorStore';

export interface CanvasEditorHandle {
  undo: () => void;
  redo: () => void;
  exportPng: (scale?: number) => Promise<Blob | null>;
  exportJpeg: (scale?: number) => Promise<Blob | null>;
}

interface CanvasEditorProps {
  processedDataUrl: string;
  originalDataUrl: string;
}

interface MaskSnapshot {
  erase: ImageData;
  restore: ImageData;
}

const MAX_UNDO = 20;

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
    const eraseMaskRef = useRef<HTMLCanvasElement>(null);
    const restoreMaskRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const mode = useEditorStore((s) => s.mode);
    const brushSize = useEditorStore((s) => s.brushSize);
    const zoom = useEditorStore((s) => s.zoom);
    const showOriginal = useEditorStore((s) => s.showOriginal);
    const backgroundColor = useEditorStore((s) => s.backgroundColor);
    const backgroundType = useEditorStore((s) => s.backgroundType);
    const backgroundImageUrl = useEditorStore((s) => s.backgroundImageUrl);
    const backgroundGradient = useEditorStore((s) => s.backgroundGradient);
    const backgroundBlur = useEditorStore((s) => s.backgroundBlur);
    const effects = useEditorStore((s) => s.effects);
    // canUndo/canRedo는 Zustand에서 관리 — 구독하는 모든 컴포넌트가 자동 리렌더링됨
    const setCanUndo = useEditorStore((s) => s.setCanUndo);
    const setCanRedo = useEditorStore((s) => s.setCanRedo);

    const undoStackRef = useRef<MaskSnapshot[]>([]);
    const redoStackRef = useRef<MaskSnapshot[]>([]);

    const fgImgRef = useRef<HTMLImageElement | null>(null);
    const origImgRef = useRef<HTMLImageElement | null>(null);
    const blurredCacheRef = useRef<HTMLCanvasElement | null>(null);
    const bgImgRef = useRef<HTMLImageElement | null>(null);
    const isPainting = useRef(false);
    const panStart = useRef<{ x: number; y: number } | null>(null);
    const panOffset = useRef({ x: 0, y: 0 });
    const imgSizeRef = useRef({ w: 0, h: 0 });
    // imgSize를 ref로 관리하면 render()가 state 변경에 의존하지 않아도 됨
    // 대신 orig.onload 시 강제 렌더를 직접 호출

    useEffect(() => {
      blurredCacheRef.current = null;

      const fg = new Image();
      fg.crossOrigin = 'anonymous';
      fg.onload = () => { fgImgRef.current = fg; };
      fg.src = processedDataUrl;

      const orig = new Image();
      orig.crossOrigin = 'anonymous';
      orig.onload = () => {
        origImgRef.current = orig;
        imgSizeRef.current = { w: orig.naturalWidth, h: orig.naturalHeight };

        const em = eraseMaskRef.current;
        if (em) {
          em.width = orig.naturalWidth;
          em.height = orig.naturalHeight;
          em.getContext('2d')!.fillStyle = 'white';
          em.getContext('2d')!.fillRect(0, 0, em.width, em.height);
        }

        const rm = restoreMaskRef.current;
        if (rm) {
          rm.width = orig.naturalWidth;
          rm.height = orig.naturalHeight;
          // 기본값 투명 — 복원 없음
        }

        // undo/redo 스택 초기화
        undoStackRef.current = [];
        redoStackRef.current = [];
        setCanUndo(false);
        setCanRedo(false);

        renderNow();
      };
      orig.src = originalDataUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [processedDataUrl, originalDataUrl]);

    const buildMaskedFg = useCallback((w: number, h: number): HTMLCanvasElement => {
      const em = eraseMaskRef.current!;
      const rm = restoreMaskRef.current!;
      const fg = fgImgRef.current!;
      const orig = origImgRef.current!;

      const layer1 = document.createElement('canvas');
      layer1.width = w; layer1.height = h;
      const ctx1 = layer1.getContext('2d')!;
      ctx1.drawImage(orig, 0, 0, w, h);
      ctx1.globalCompositeOperation = 'destination-in';
      ctx1.drawImage(rm, 0, 0, w, h);
      ctx1.globalCompositeOperation = 'source-over';

      const layer2 = document.createElement('canvas');
      layer2.width = w; layer2.height = h;
      const ctx2 = layer2.getContext('2d')!;
      const { brightness, contrast, saturation } = effects;
      const hasFilter = brightness !== 100 || contrast !== 100 || saturation !== 100;
      if (hasFilter) {
        ctx2.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      }
      ctx2.drawImage(fg, 0, 0, w, h);
      ctx2.filter = 'none';
      ctx2.globalCompositeOperation = 'destination-in';
      ctx2.drawImage(em, 0, 0, w, h);
      ctx2.globalCompositeOperation = 'source-over';

      const off = document.createElement('canvas');
      off.width = w; off.height = h;
      const ctx = off.getContext('2d')!;
      ctx.drawImage(layer1, 0, 0);
      ctx.drawImage(layer2, 0, 0);
      return off;
    }, [effects]);

    const getBlurredBg = useCallback((w: number, h: number, blurPx: number): HTMLCanvasElement => {
      if (blurredCacheRef.current?.width === w && blurredCacheRef.current?.height === h) {
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

    useEffect(() => { blurredCacheRef.current = null; }, [backgroundBlur]);

    const getDisplayRect = useCallback((cw: number, ch: number, iw: number, ih: number) => {
      const baseScale = Math.min(cw / iw, ch / ih) * 0.9;
      const scale = baseScale * zoom;
      const x = panOffset.current.x + (cw - iw * scale) / 2;
      const y = panOffset.current.y + (ch - ih * scale) / 2;
      return { x, y, w: iw * scale, h: ih * scale, scale };
    }, [zoom]);

    // renderNow는 ref 값을 직접 읽으므로 useCallback 의존성이 가변적인 state를 피함
    const renderNow = useCallback(() => {
      const canvas = canvasRef.current;
      const em = eraseMaskRef.current;
      const { w: iw, h: ih } = imgSizeRef.current;
      if (!canvas || !fgImgRef.current || !origImgRef.current || !em || !iw || !ih) return;

      const ctx = canvas.getContext('2d')!;
      const cw = canvas.width, ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      ctx.save();

      const { x, y, w, h } = getDisplayRect(cw, ch, iw, ih);

      if (showOriginal && origImgRef.current) {
        ctx.drawImage(origImgRef.current, x, y, w, h);
        ctx.restore();
        return;
      }

      ctx.save();
      ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();

      if (backgroundType === 'transparent') {
        drawCheckerboard(ctx, x, y, w, h);
      } else if (backgroundType === 'color') {
        ctx.fillStyle = backgroundColor; ctx.fillRect(x, y, w, h);
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
        ctx.fillStyle = grd; ctx.fillRect(x, y, w, h);
      } else if (backgroundType === 'blur' && origImgRef.current) {
        ctx.drawImage(getBlurredBg(iw, ih, backgroundBlur), x, y, w, h);
      } else if (backgroundType === 'image' && bgImgRef.current) {
        const bi = bgImgRef.current;
        const ir = bi.naturalWidth / bi.naturalHeight;
        const rr = w / h;
        const [sx, sy, sw, sh] = ir > rr
          ? [(bi.naturalWidth - bi.naturalHeight * rr) / 2, 0, bi.naturalHeight * rr, bi.naturalHeight]
          : [0, (bi.naturalHeight - bi.naturalWidth / rr) / 2, bi.naturalWidth, bi.naturalWidth / rr];
        ctx.drawImage(bi, sx, sy, sw, sh, x, y, w, h);
      }
      ctx.restore();

      const { shadowType, shadowOpacity, shadowBlur: sBl, shadowOffsetX, shadowOffsetY } = effects;
      const maskedFg = buildMaskedFg(iw, ih);

      if (shadowType !== 'none') {
        ctx.save();
        const sc = `rgba(0,0,0,${shadowOpacity})`;
        if (shadowType === 'soft') {
          ctx.shadowColor = sc; ctx.shadowBlur = sBl; ctx.shadowOffsetY = sBl * 0.3;
          ctx.drawImage(maskedFg, x, y, w, h); ctx.shadowColor = 'transparent';
        } else if (shadowType === 'drop') {
          ctx.shadowColor = sc; ctx.shadowBlur = sBl;
          ctx.shadowOffsetX = (shadowOffsetX / iw) * w; ctx.shadowOffsetY = (shadowOffsetY / ih) * h;
          ctx.drawImage(maskedFg, x, y, w, h); ctx.shadowColor = 'transparent';
        } else if (shadowType === 'float') {
          ctx.beginPath();
          ctx.ellipse(x + w * 0.65, y + h - 8, w * 0.35, 10, 0, 0, Math.PI * 2);
          ctx.fillStyle = sc; ctx.filter = `blur(${sBl}px)`; ctx.fill(); ctx.filter = 'none';
        }
        ctx.restore();
      }

      ctx.drawImage(maskedFg, x, y, w, h);
      ctx.restore();
    }, [zoom, showOriginal, backgroundColor, backgroundType, backgroundImageUrl, backgroundGradient, backgroundBlur,
        effects, getDisplayRect, buildMaskedFg, getBlurredBg]);

    useEffect(() => {
      if (!backgroundImageUrl) {
        bgImgRef.current = null;
        renderNow();
        return;
      }
      const img = new Image();
      img.onload = () => {
        bgImgRef.current = img;
        renderNow();
      };
      img.src = backgroundImageUrl;
    }, [backgroundImageUrl, renderNow]);

    useEffect(() => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
      renderNow();
    }, [renderNow]);

    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const obs = new ResizeObserver((entries) => {
        const e = entries[0];
        if (e) { canvas.width = e.contentRect.width; canvas.height = e.contentRect.height; }
        renderNow();
      });
      obs.observe(container);
      return () => obs.disconnect();
    }, [renderNow]);

    // 터치 이벤트용 passive:false 리스너 — React 합성 이벤트는 passive 해제 불가
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        const t = e.touches[0];
        if (!t) return;
        if (useEditorStore.getState().mode === 'view') {
          panStart.current = { x: t.clientX - panOffset.current.x, y: t.clientY - panOffset.current.y };
          return;
        }
        saveSnapshotFn();
        isPainting.current = true;
        paintFn(t.clientX, t.clientY);
      };

      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const t = e.touches[0];
        if (!t) return;
        if (useEditorStore.getState().mode === 'view' && panStart.current) {
          panOffset.current = { x: t.clientX - panStart.current.x, y: t.clientY - panStart.current.y };
          renderNow(); return;
        }
        if (isPainting.current) paintFn(t.clientX, t.clientY);
      };

      const handleTouchEnd = () => {
        isPainting.current = false; panStart.current = null;
      };

      container.addEventListener('touchstart', handleTouchStart, { passive: false });
      container.addEventListener('touchmove', handleTouchMove, { passive: false });
      container.addEventListener('touchend', handleTouchEnd);
      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [renderNow]);

    const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      const { w: iw, h: ih } = imgSizeRef.current;
      if (!canvas || !iw) return null;
      const rect = canvas.getBoundingClientRect();
      const cx = (clientX - rect.left) * (canvas.width / rect.width);
      const cy = (clientY - rect.top) * (canvas.height / rect.height);
      const { x, y, scale } = getDisplayRect(canvas.width, canvas.height, iw, ih);
      return { x: (cx - x) / scale, y: (cy - y) / scale };
    }, [getDisplayRect]);

    // 터치 핸들러에서 최신 클로저를 참조할 수 있도록 ref로 래핑
    const paintFnRef = useRef<(cx: number, cy: number) => void>(() => {});
    const saveSnapshotFnRef = useRef<() => void>(() => {});

    const paint = useCallback((clientX: number, clientY: number) => {
      const coords = getCanvasCoords(clientX, clientY);
      if (!coords) return;
      const { mode: currentMode, brushSize: bs, zoom: z } = useEditorStore.getState();
      const r = (bs / 2) / z;

      if (currentMode === 'background') {
        // eraseMask에서 AI 배경제거 레이어 지우기
        const em = eraseMaskRef.current;
        if (!em) return;
        const emCtx = em.getContext('2d')!;
        const grad = emCtx.createRadialGradient(coords.x, coords.y, 0, coords.x, coords.y, r);
        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(0.7, 'rgba(0,0,0,0.8)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        emCtx.globalCompositeOperation = 'destination-out';
        emCtx.fillStyle = grad;
        emCtx.beginPath(); emCtx.arc(coords.x, coords.y, r, 0, Math.PI * 2); emCtx.fill();
        emCtx.globalCompositeOperation = 'source-over';

        // restoreMask에서 복원된 영역도 함께 지우기 — 이것이 없으면 복원 레이어가 계속 표시됨
        const rm = restoreMaskRef.current;
        if (rm) {
          const rmCtx = rm.getContext('2d')!;
          const grad2 = rmCtx.createRadialGradient(coords.x, coords.y, 0, coords.x, coords.y, r);
          grad2.addColorStop(0, 'rgba(0,0,0,1)');
          grad2.addColorStop(0.7, 'rgba(0,0,0,0.8)');
          grad2.addColorStop(1, 'rgba(0,0,0,0)');
          rmCtx.globalCompositeOperation = 'destination-out';
          rmCtx.fillStyle = grad2;
          rmCtx.beginPath(); rmCtx.arc(coords.x, coords.y, r, 0, Math.PI * 2); rmCtx.fill();
          rmCtx.globalCompositeOperation = 'source-over';
        }
      } else if (currentMode === 'foreground') {
        const rm = restoreMaskRef.current;
        if (!rm) return;
        const ctx = rm.getContext('2d')!;
        const grad = ctx.createRadialGradient(coords.x, coords.y, 0, coords.x, coords.y, r);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.7, 'rgba(255,255,255,0.8)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(coords.x, coords.y, r, 0, Math.PI * 2); ctx.fill();
      }
      renderNow();
    }, [getCanvasCoords, renderNow]);

    const saveSnapshot = useCallback(() => {
      const em = eraseMaskRef.current;
      const rm = restoreMaskRef.current;
      if (!em || !rm) return;
      const snap: MaskSnapshot = {
        erase:   em.getContext('2d')!.getImageData(0, 0, em.width, em.height),
        restore: rm.getContext('2d')!.getImageData(0, 0, rm.width, rm.height),
      };
      undoStackRef.current.push(snap);
      if (undoStackRef.current.length > MAX_UNDO) undoStackRef.current.shift();
      redoStackRef.current = [];
      setCanUndo(true); setCanRedo(false);
    }, [setCanUndo, setCanRedo]);

    // 터치 핸들러 useEffect에서 stale closure 방지용 ref
    const paintFn = useCallback((cx: number, cy: number) => paintFnRef.current(cx, cy), []);
    const saveSnapshotFn = useCallback(() => saveSnapshotFnRef.current(), []);
    useEffect(() => { paintFnRef.current = paint; }, [paint]);
    useEffect(() => { saveSnapshotFnRef.current = saveSnapshot; }, [saveSnapshot]);

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
        renderNow(); return;
      }
      if (isPainting.current) paint(e.clientX, e.clientY);
    }, [mode, paint, renderNow]);

    const onMouseUp = useCallback(() => {
      isPainting.current = false; panStart.current = null;
    }, []);

    const onWheel = useCallback((e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const { zoom: z, setZoom } = useEditorStore.getState();
      setZoom(Math.max(0.1, Math.min(5, z + delta)));
    }, []);

    const buildExportCanvas = useCallback((withBg: boolean, scale = 1): HTMLCanvasElement | null => {
      const em = eraseMaskRef.current;
      const rm = restoreMaskRef.current;
      const fg = fgImgRef.current;
      const { w: origW, h: origH } = imgSizeRef.current;
      if (!em || !rm || !fg || !origW) return null;

      const w = Math.round(origW * scale);
      const h = Math.round(origH * scale);
      const off = document.createElement('canvas');
      off.width = w; off.height = h;
      const ctx = off.getContext('2d')!;

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
          ctx.drawImage(getBlurredBg(origW, origH, backgroundBlur), 0, 0, w, h);
        } else if (backgroundType === 'image' && bgImgRef.current) {
          const bi = bgImgRef.current;
          const ir = bi.naturalWidth / bi.naturalHeight;
          const rr = w / h;
          const [sx, sy, sw, sh] = ir > rr
            ? [(bi.naturalWidth - bi.naturalHeight * rr) / 2, 0, bi.naturalHeight * rr, bi.naturalHeight]
            : [0, (bi.naturalHeight - bi.naturalWidth / rr) / 2, bi.naturalWidth, bi.naturalWidth / rr];
          ctx.drawImage(bi, sx, sy, sw, sh, 0, 0, w, h);
        } else {
          ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
        }
      }

      const { shadowType, shadowOpacity, shadowBlur: sBl, shadowOffsetX, shadowOffsetY } = effects;
      const maskedFg = buildMaskedFg(w, h);

      if (shadowType !== 'none') {
        const sc = `rgba(0,0,0,${shadowOpacity})`;
        if (shadowType === 'soft') {
          ctx.shadowColor = sc; ctx.shadowBlur = sBl; ctx.shadowOffsetY = sBl * 0.3;
        } else if (shadowType === 'drop') {
          ctx.shadowColor = sc; ctx.shadowBlur = sBl;
          ctx.shadowOffsetX = shadowOffsetX; ctx.shadowOffsetY = shadowOffsetY;
        } else if (shadowType === 'float') {
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(w * 0.5, h - 10, w * 0.35, 15, 0, 0, Math.PI * 2);
          ctx.fillStyle = sc; ctx.filter = `blur(${sBl}px)`; ctx.fill();
          ctx.filter = 'none'; ctx.restore();
        }
      }

      ctx.drawImage(maskedFg, 0, 0);
      ctx.shadowColor = 'transparent';
      return off;
    }, [backgroundColor, backgroundType, backgroundImageUrl, backgroundGradient, backgroundBlur,
        effects, buildMaskedFg, getBlurredBg]);

    useImperativeHandle(ref, () => ({
      undo() {
        const em = eraseMaskRef.current;
        const rm = restoreMaskRef.current;
        if (!em || !rm || !undoStackRef.current.length) return;
        const emCtx = em.getContext('2d')!;
        const rmCtx = rm.getContext('2d')!;
        redoStackRef.current.push({
          erase:   emCtx.getImageData(0, 0, em.width, em.height),
          restore: rmCtx.getImageData(0, 0, rm.width, rm.height),
        });
        const prev = undoStackRef.current.pop()!;
        emCtx.putImageData(prev.erase, 0, 0);
        rmCtx.putImageData(prev.restore, 0, 0);
        setCanUndo(undoStackRef.current.length > 0); setCanRedo(true);
        renderNow();
      },
      redo() {
        const em = eraseMaskRef.current;
        const rm = restoreMaskRef.current;
        if (!em || !rm || !redoStackRef.current.length) return;
        const emCtx = em.getContext('2d')!;
        const rmCtx = rm.getContext('2d')!;
        undoStackRef.current.push({
          erase:   emCtx.getImageData(0, 0, em.width, em.height),
          restore: rmCtx.getImageData(0, 0, rm.width, rm.height),
        });
        const next = redoStackRef.current.pop()!;
        emCtx.putImageData(next.erase, 0, 0);
        rmCtx.putImageData(next.restore, 0, 0);
        setCanUndo(true); setCanRedo(redoStackRef.current.length > 0);
        renderNow();
      },
      async exportPng(scale = 1) {
        const canvas = backgroundType === 'transparent'
          ? buildExportCanvas(false, scale)
          : buildExportCanvas(true, scale);
        if (!canvas) return null;
        return new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
      },
      async exportJpeg(scale = 1) {
        const off = buildExportCanvas(true, scale);
        if (!off) return null;
        return new Promise<Blob | null>((res) => off.toBlob(res, 'image/jpeg', 0.92));
      },
    }), [setCanUndo, setCanRedo, renderNow, buildExportCanvas, backgroundType]);

    return (
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-hidden"
        style={{ cursor: mode === 'view' ? 'grab' : 'crosshair', touchAction: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
        <canvas ref={eraseMaskRef} style={{ display: 'none' }} />
        <canvas ref={restoreMaskRef} style={{ display: 'none' }} />
      </div>
    );
  }
);

CanvasEditor.displayName = 'CanvasEditor';
export { CanvasEditor };
