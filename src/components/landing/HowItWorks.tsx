import { Upload, Cpu, Download } from 'lucide-react';

const ICONS = [Upload, Cpu, Download];
const COLORS = ['#c799ff', '#a0fff0', '#aa8aff'];

export function HowItWorks({ dict }: { dict?: any }) {
  const t = dict?.howItWorks || {
    title_1: 'Frictionless ', title_2: 'Workflow',
    subtitle: 'No accounts. No installations. Three steps to flawless background synthesis.',
    steps: [
      { title: 'Initialize Workspace', description: 'Drop any high-resolution image into the synthesis zone. Compatible with JPG, PNG, and next-gen WEBP formats.' },
      { title: 'Neural Processing', description: 'Our proprietary deep learning architecture analyzes structural depth and edge coherence in real-time.' },
      { title: 'Deploy Masterpiece', description: 'Download the pristine, artifact-free asset with perfect alpha channels, or continue editing.' }
    ]
  };

  const stepsData = t.steps.map((step: any, i: number) => ({
    ...step,
    icon: ICONS[i],
    color: COLORS[i],
    num: `0${i + 1}`
  }));

  return (
    <section className="py-32 px-6 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Subtle ambient light */}
      <div className="absolute top-1/2 left-0 w-full h-[500px] -translate-y-1/2 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at center, rgba(32,32,31,0.5) 0%, transparent 70%)' }} />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            <span className="gradient-text">{t.title_1}</span>{t.title_2}
          </h2>
          <p className="text-xl max-w-2xl mx-auto font-light" style={{ color: 'var(--text-muted)', wordBreak: 'keep-all' }}>
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Neon connector lines */}
          <div
            className="hidden md:block absolute top-[4.5rem] left-[16%] right-[16%] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(170,138,255,0.3) 50%, transparent)' }}
          />

          {stepsData.map((step: any, i: number) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center relative group">
                <div
                  className="w-24 h-24 rounded-[32px] flex items-center justify-center mb-8 relative z-10 glass-card"
                  style={{
                    background: `linear-gradient(135deg, ${step.color}15, transparent)`,
                    borderTop: `1px solid ${step.color}40`,
                    boxShadow: `0 0 40px ${step.color}10`,
                  }}
                >
                  <Icon size={36} style={{ color: step.color }} className="transition-transform duration-500 group-hover:scale-110" />
                  
                  <div
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
                    style={{ background: step.color, color: '#0e0e0e' }}
                  >
                    {step.num}
                  </div>
                </div>
                
                <h3 className="font-bold text-2xl mb-4 tracking-wide" style={{ color: 'var(--text-primary)' }}>
                  {step.title}
                </h3>
                
                <p className="text-base font-light leading-relaxed" style={{ color: 'var(--text-muted)', wordBreak: 'keep-all' }}>
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
