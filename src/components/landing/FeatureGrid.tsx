'use client';

import { Zap, Wand2, Layers, Download, Shield, Cpu } from 'lucide-react';

const ICONS = [Zap, Wand2, Layers, Download, Shield, Cpu];
const COLORS = ['#a0fff0', '#c799ff', '#aa8aff', '#bc87fe', '#ff6e84', '#8A2BE2'];

export function FeatureGrid({ dict }: { dict?: any }) {
  const t = dict?.features || {
    title_1: "The Architecture of ", title_2: "Perfection",
    subtitle: "Professional-grade segmentation made accessible. No subscriptions. No watermarks. Just pure, unadulterated power.",
    items: [
      { title: "Neural Velocity", description: "Execute state-of-the-art ONNX models directly in your browser. Complete segmentation in under 3 seconds." },
      { title: "Precision Tools", description: "Refine edges with magical foreground and background brushes. You are always in control of the final output." },
      { title: "Infinite Canvas", description: "Export as transparent PNGs, or drop in custom chromatic gradients and scenic backgrounds instantly." },
      { title: "Pristine Export", description: "Zero compression loss. Download your masterpieces in full native resolution without artifacts." },
      { title: "Absolute Privacy", description: "Your images never touch a server. All neural processing occurs securely on your local machine." },
      { title: "Offline Execution", description: "Works via service workers. Once loaded, our AI is available anytime, anywhere, completely offline." }
    ]
  };

  const featuresData = t.items.map((item: any, i: number) => ({
    ...item,
    icon: ICONS[i],
    color: COLORS[i]
  }));

  return (
    <section className="py-32 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgba(199,153,255,0.03)] to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {t.title_1}<span className="gradient-text">{t.title_2}</span>
          </h2>
          <p className="text-xl max-w-3xl mx-auto font-light" style={{ color: 'var(--text-muted)', wordBreak: 'keep-all' }}>
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature: any) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass-card p-8 group relative overflow-hidden"
              >
                {/* Subtle hover gradient inside card */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${feature.color}15 0%, transparent 70%)` }}
                />
                
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10"
                  style={{ 
                    background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}05)`, 
                    border: `1px solid ${feature.color}40`,
                    boxShadow: `0 8px 16px ${feature.color}15`
                  }}
                >
                  <Icon size={26} style={{ color: feature.color }} />
                </div>
                
                <h3 className="font-bold text-xl mb-3 relative z-10" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h3>
                
                <p className="text-base font-light leading-relaxed relative z-10" style={{ color: 'var(--text-muted)', wordBreak: 'keep-all' }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
