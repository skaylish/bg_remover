'use client';

import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import type { BackgroundType, ShadowType } from '@/types';

// ─── Slider ────────────────────────────────────────────────────────────────
function Slider({ label, value, min, max, unit = '', onChange }: {
  label: string; value: number; min: number; max: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span style={{ color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ color: 'var(--accent-glow)' }}>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: 'var(--accent-primary)' }}
      />
    </div>
  );
}

// ─── Section header ─────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest mb-2"
      style={{ color: 'var(--text-subtle)' }}>
      {children}
    </p>
  );
}

// ─── Color presets ──────────────────────────────────────────────────────────
const BG_COLORS = [
  '#ffffff','#f8f8f8','#000000','#1a1a2e','#16213e',
  '#ff6b6b','#feca57','#48dbfb','#ff9ff3','#54a0ff',
  '#5f27cd','#00d2d3','#ff9f43','#10ac84','#ee5a24',
];

const GRADIENTS = [
  { from: '#6366f1', to: '#a855f7', angle: 135, labelKey: 'grad_purple', label: '퍼플' },
  { from: '#f59e0b', to: '#ef4444', angle: 135, labelKey: 'grad_sunset', label: '선셋' },
  { from: '#06b6d4', to: '#6366f1', angle: 135, labelKey: 'grad_ocean', label: '오션' },
  { from: '#22d3a0', to: '#06b6d4', angle: 135, labelKey: 'grad_mint', label: '민트' },
  { from: '#f97316', to: '#eab308', angle: 90, labelKey: 'grad_gold', label: '골드' },
  { from: '#ec4899', to: '#f43f5e', angle: 135, labelKey: 'grad_pink', label: '핑크' },
  { from: '#1a1a2e', to: '#16213e', angle: 180, labelKey: 'grad_dark', label: '다크' },
  { from: '#0f0c29', to: '#302b63', angle: 135, labelKey: 'grad_navy', label: '네이비' },
];

// ─── Background Tab ──────────────────────────────────────────────────────────
function BackgroundTab({ dict }: { dict?: any }) {
  const backgroundType = useEditorStore((s) => s.backgroundType);
  const setBackgroundType = useEditorStore((s) => s.setBackgroundType);
  const backgroundColor = useEditorStore((s) => s.backgroundColor);
  const setBackgroundColor = useEditorStore((s) => s.setBackgroundColor);
  const backgroundGradient = useEditorStore((s) => s.backgroundGradient);
  const setBackgroundGradient = useEditorStore((s) => s.setBackgroundGradient);
  const backgroundBlur = useEditorStore((s) => s.backgroundBlur);
  const setBackgroundBlur = useEditorStore((s) => s.setBackgroundBlur);
  const removalSensitivity = useEditorStore((s) => s.removalSensitivity);
  const setRemovalSensitivity = useEditorStore((s) => s.setRemovalSensitivity);
  const backgroundImageUrl = useEditorStore((s) => s.backgroundImageUrl);
  const setBackgroundImageUrl = useEditorStore((s) => s.setBackgroundImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setBackgroundImageUrl(url);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const t = dict?.editor?.panel || {
    bg_transparent: '투명', bg_color: '단색', bg_gradient: '그라디언트', bg_blur: '블러', bg_image: '이미지',
    save_transparent_png: '투명 배경으로 PNG 저장', select_color: '색상 선택', presets: '프리셋',
    gradient_presets: '그라디언트 프리셋', custom: '커스텀', start: '시작', end: '끝', angle: '각도',
    blur_desc: '원본 이미지를 흐릿하게 블러 처리하여 배경으로 사용합니다.', blur_strength: '블러 강도', preview_canvas: '미리보기는 캔버스에서 확인',
    removal_sensitivity: '배경제거 민감도', sensitivity_hint_low: '전경 보존', sensitivity_hint_high: '배경 제거',
    removal_sensitivity_title: 'AI 배경제거 정밀도', removal_sensitivity_desc: '배경 제거 강도를 조절해 텍스트·세밀한 전경 요소를 보호하세요.',
    bg_image_title: '배경 이미지', bg_image_upload: '이미지 업로드', bg_image_replace: '이미지 교체',
  };

  const types: { id: BackgroundType; label: string; emoji: string }[] = [
    { id: 'transparent', label: t.bg_transparent, emoji: '⬜' },
    { id: 'color', label: t.bg_color, emoji: '🎨' },
    { id: 'gradient', label: t.bg_gradient, emoji: '🌈' },
    { id: 'blur', label: t.bg_blur, emoji: '🌫️' },
    { id: 'image', label: t.bg_image || '이미지', emoji: '🖼️' },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* 배경제거 민감도 — 특화 기능 강조 */}
      <div
        className="flex flex-col gap-2.5 p-3 rounded-xl relative"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.07))',
          border: '1.5px solid rgba(99,102,241,0.45)',
          boxShadow: '0 0 18px rgba(99,102,241,0.14), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <span style={{ color: '#a78bfa', fontSize: '11px' }}>✦</span>
          <span className="text-xs font-semibold" style={{ color: '#c4b5fd' }}>
            {t.removal_sensitivity_title || 'AI 배경제거 정밀도'}
          </span>
          <span
            className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(99,102,241,0.25)', color: '#a78bfa', border: '1px solid rgba(99,102,241,0.35)' }}
          >
            AI
          </span>
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {t.removal_sensitivity_desc || '배경 제거 강도를 조절해 텍스트·세밀한 전경 요소를 보호하세요.'}
        </p>
        <Slider
          label=""
          value={removalSensitivity}
          min={0}
          max={100}
          onChange={setRemovalSensitivity}
        />
        <div className="flex justify-between text-[10px]" style={{ color: 'rgba(167,139,250,0.6)' }}>
          <span>{t.sensitivity_hint_high || '배경 제거 강화'}</span>
          <span>{t.sensitivity_hint_low || '전경 보존'}</span>
        </div>
      </div>

      {/* Type selector */}
      <div>
        <div className="grid grid-cols-2 gap-1.5 mb-1.5">
          {types.filter((tp) => tp.id !== 'image').map((tp) => (
            <button
              key={tp.id}
              onClick={() => setBackgroundType(tp.id)}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: backgroundType === tp.id ? 'rgba(99,102,241,0.2)' : 'var(--bg-raised)',
                border: `1px solid ${backgroundType === tp.id ? 'rgba(99,102,241,0.5)' : 'var(--bg-border)'}`,
                color: backgroundType === tp.id ? 'var(--accent-glow)' : 'var(--text-muted)',
              }}
            >
              <span>{tp.emoji}</span>
              {tp.label}
            </button>
          ))}
        </div>
        {/* 이미지 버튼 — 전체 너비 */}
        {(() => {
          const imgType = types.find((tp) => tp.id === 'image')!;
          return (
            <button
              onClick={() => setBackgroundType('image')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: backgroundType === 'image' ? 'rgba(99,102,241,0.2)' : 'var(--bg-raised)',
                border: `1px solid ${backgroundType === 'image' ? 'rgba(99,102,241,0.5)' : 'var(--bg-border)'}`,
                color: backgroundType === 'image' ? 'var(--accent-glow)' : 'var(--text-muted)',
              }}
            >
              <span>{imgType.emoji}</span>
              {imgType.label}
            </button>
          );
        })()}
      </div>

      {/* Transparent preview */}
      {backgroundType === 'transparent' && (
        <div className="flex flex-col gap-2">
          <div className="w-full h-16 rounded-xl checker-bg" style={{ border: '1px solid var(--bg-border)' }} />
          <p className="text-xs text-center" style={{ color: 'var(--text-subtle)' }}>
            {t.save_transparent_png}
          </p>
        </div>
      )}

      {/* Solid color */}
      {backgroundType === 'color' && (
        <div className="flex flex-col gap-3">
          <SectionTitle>{t.select_color}</SectionTitle>
          <div
            className="w-full h-14 rounded-xl"
            style={{ background: backgroundColor, border: '1px solid var(--bg-border)' }}
          />
          <input
            type="color" value={backgroundColor}
            onChange={(e) => setBackgroundColor(e.target.value)}
            className="w-full h-9 rounded-lg cursor-pointer"
            style={{ border: '1px solid var(--bg-border)' }}
          />
          <SectionTitle>{t.presets}</SectionTitle>
          <div className="grid grid-cols-5 gap-1.5">
            {BG_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setBackgroundColor(c)}
                className="aspect-square rounded-lg transition-all hover:scale-110"
                style={{
                  background: c,
                  border: backgroundColor === c ? '2px solid var(--accent-glow)' : '1px solid var(--bg-border)',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Gradient */}
      {backgroundType === 'gradient' && (
        <div className="flex flex-col gap-3">
          <SectionTitle>{t.gradient_presets}</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {GRADIENTS.map((g) => (
              <button
                key={g.label}
                onClick={() => setBackgroundGradient(g)}
                className="h-14 rounded-xl flex items-end p-1.5 transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})`,
                  border: backgroundGradient.from === g.from && backgroundGradient.to === g.to
                    ? '2px solid var(--accent-glow)'
                    : '1px solid transparent',
                }}
              >
                <span className="text-[10px] font-semibold text-white drop-shadow">
                  {g.labelKey ? t[g.labelKey] : g.label}
                </span>
              </button>
            ))}
          </div>
          <SectionTitle>{t.custom}</SectionTitle>
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.start}</span>
              <input
                type="color" value={backgroundGradient.from}
                onChange={(e) => setBackgroundGradient({ ...backgroundGradient, from: e.target.value })}
                className="w-full h-9 rounded-lg cursor-pointer"
                style={{ border: '1px solid var(--bg-border)' }}
              />
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.end}</span>
              <input
                type="color" value={backgroundGradient.to}
                onChange={(e) => setBackgroundGradient({ ...backgroundGradient, to: e.target.value })}
                className="w-full h-9 rounded-lg cursor-pointer"
                style={{ border: '1px solid var(--bg-border)' }}
              />
            </div>
          </div>
          <Slider label={t.angle} value={backgroundGradient.angle} min={0} max={360} unit="°"
            onChange={(v) => setBackgroundGradient({ ...backgroundGradient, angle: v })} />
        </div>
      )}

      {/* Blur */}
      {backgroundType === 'blur' && (
        <div className="flex flex-col gap-3">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {t.blur_desc}
          </p>
          <Slider label={t.blur_strength} value={backgroundBlur} min={1} max={40} unit="px"
            onChange={setBackgroundBlur} />
          <div
            className="w-full h-16 rounded-xl overflow-hidden relative"
            style={{ border: '1px solid var(--bg-border)' }}
          >
            <div className="absolute inset-0 flex items-center justify-center text-xs" style={{ color: 'var(--text-muted)' }}>
              {t.preview_canvas}
            </div>
          </div>
        </div>
      )}

      {/* Image background */}
      {backgroundType === 'image' && (
        <div className="flex flex-col gap-3">
          <SectionTitle>{t.bg_image_title || '배경 이미지'}</SectionTitle>

          {backgroundImageUrl ? (
            <div
              className="relative w-full rounded-xl overflow-hidden group cursor-pointer"
              style={{ height: '100px', border: '1px solid var(--bg-border)' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <img src={backgroundImageUrl} alt="bg" className="w-full h-full object-cover" />
              <div
                className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.5)' }}
              >
                {t.bg_image_replace || '이미지 교체'}
              </div>
            </div>
          ) : (
            <button
              className="w-full flex flex-col items-center justify-center gap-2 rounded-xl transition-all"
              style={{
                height: '100px',
                border: '1.5px dashed rgba(99,102,241,0.35)',
                background: 'rgba(99,102,241,0.04)',
                color: 'var(--text-muted)',
              }}
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.65)'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}
            >
              <Upload size={20} style={{ color: '#a78bfa', opacity: 0.8 }} />
              <span className="text-xs font-medium" style={{ color: '#c4b5fd' }}>
                {t.bg_image_upload || '이미지 업로드'}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>
                PNG · JPG · WEBP
              </span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
        </div>
      )}
    </div>
  );
}

// ─── Effects Tab ─────────────────────────────────────────────────────────────
function EffectsTab({ dict }: { dict?: any }) {
  const effects = useEditorStore((s) => s.effects);
  const setEffects = useEditorStore((s) => s.setEffects);

  const t = dict?.editor?.panel || {
    shadow: '그림자', shadow_none: '없음', shadow_none_desc: '—', shadow_soft: '소프트',
    shadow_soft_desc: '부드러운 그림자', shadow_drop: '드롭', shadow_drop_desc: '선명한 그림자',
    shadow_float: '플로팅', shadow_float_desc: '하단 타원 그림자', opacity: '불투명도',
    x_offset: 'X 오프셋', y_offset: 'Y 오프셋', color_adjust: '색상 조정', brightness: '밝기',
    contrast: '대비', saturation: '채도', reset: '초기화'
  };

  const shadows: { id: ShadowType; label: string; desc: string }[] = [
    { id: 'none', label: t.shadow_none, desc: t.shadow_none_desc },
    { id: 'soft', label: t.shadow_soft, desc: t.shadow_soft_desc },
    { id: 'drop', label: t.shadow_drop, desc: t.shadow_drop_desc },
    { id: 'float', label: t.shadow_float, desc: t.shadow_float_desc },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Shadow */}
      <div>
        <SectionTitle>{t.shadow}</SectionTitle>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {shadows.map((s) => (
            <button
              key={s.id}
              onClick={() => setEffects({ shadowType: s.id })}
              className="flex flex-col gap-0.5 p-2.5 rounded-xl text-xs transition-all"
              style={{
                background: effects.shadowType === s.id ? 'rgba(99,102,241,0.2)' : 'var(--bg-raised)',
                border: `1px solid ${effects.shadowType === s.id ? 'rgba(99,102,241,0.5)' : 'var(--bg-border)'}`,
                color: effects.shadowType === s.id ? 'var(--accent-glow)' : 'var(--text-muted)',
              }}
            >
              <span className="font-semibold">{s.label}</span>
              <span className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>{s.desc}</span>
            </button>
          ))}
        </div>

        {effects.shadowType !== 'none' && (
          <div className="flex flex-col gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-raised)', border: '1px solid var(--bg-border)' }}>
            <Slider label={t.opacity} value={Math.round(effects.shadowOpacity * 100)} min={0} max={100} unit="%"
              onChange={(v) => setEffects({ shadowOpacity: v / 100 })} />
            <Slider label={t.bg_blur || '블러'} value={effects.shadowBlur} min={0} max={60} unit="px"
              onChange={(v) => setEffects({ shadowBlur: v })} />
            {effects.shadowType === 'drop' && (
              <>
                <Slider label={t.x_offset} value={effects.shadowOffsetX} min={-50} max={50} unit="px"
                  onChange={(v) => setEffects({ shadowOffsetX: v })} />
                <Slider label={t.y_offset} value={effects.shadowOffsetY} min={-50} max={50} unit="px"
                  onChange={(v) => setEffects({ shadowOffsetY: v })} />
              </>
            )}
          </div>
        )}
      </div>

      <div className="h-px" style={{ background: 'var(--bg-border)' }} />

      {/* Color adjustments */}
      <div>
        <SectionTitle>{t.color_adjust}</SectionTitle>
        <div className="flex flex-col gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-raised)', border: '1px solid var(--bg-border)' }}>
          <Slider label={t.brightness} value={effects.brightness} min={0} max={200} unit="%"
            onChange={(v) => setEffects({ brightness: v })} />
          <Slider label={t.contrast} value={effects.contrast} min={0} max={200} unit="%"
            onChange={(v) => setEffects({ contrast: v })} />
          <Slider label={t.saturation} value={effects.saturation} min={0} max={200} unit="%"
            onChange={(v) => setEffects({ saturation: v })} />
          <button
            onClick={() => setEffects({ brightness: 100, contrast: 100, saturation: 100 })}
            className="text-xs py-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-surface)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            {t.reset}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main RightPanel ──────────────────────────────────────────────────────────
export function RightPanel({ dict }: { dict?: any }) {
  const [activeTab, setActiveTab] = useState<'background' | 'effects'>('background');

  const t = dict?.editor?.panel || {
    tab_bg: '배경', tab_effects: '효과'
  };

  const tabs = [
    { id: 'background' as const, label: t.tab_bg },
    { id: 'effects' as const, label: t.tab_effects },
  ];

  return (
    <aside
      className="flex flex-col shrink-0 overflow-hidden"
      style={{
        width: '220px',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--bg-border)',
      }}
    >
      {/* Tabs */}
      <div className="flex" style={{ borderBottom: '1px solid var(--bg-border)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-3 text-sm font-medium transition-all"
            style={{
              color: activeTab === tab.id ? 'var(--accent-glow)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              background: 'transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'background' ? <BackgroundTab dict={dict} /> : <EffectsTab dict={dict} />}
      </div>
    </aside>
  );
}
