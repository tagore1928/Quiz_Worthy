import React from 'react';

// Page backdrop: a faint engineering grid fixed to the viewport, plus a
// planet-horizon arc with a signal-coloured rim that sits behind the top of the
// page and scrolls away with the content.
export const Backdrop: React.FC = () => (
  <>
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          backgroundPosition: 'center top',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>

    <div className="absolute inset-x-0 top-0 h-[980px] z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Atmospheric bloom above the horizon */}
      <div
        className="absolute left-1/2 top-[60px] -translate-x-1/2 w-[1100px] h-[420px]"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(120, 190, 40, 0.16), transparent 65%)' }}
      />
      {/* Planet body with a thin lit rim */}
      <div
        className="hidden lg:block absolute left-1/2 top-[480px] -translate-x-1/2 w-[2200px] h-[2200px] rounded-full"
        style={{
          background: 'radial-gradient(circle at 50% 0%, #0f1310 0%, #070908 18%)',
          borderTop: '1px solid rgba(200, 241, 53, 0.45)',
          boxShadow: '0 -1px 30px rgba(200, 241, 53, 0.18), 0 -40px 120px rgba(120, 190, 40, 0.12)',
        }}
      />
    </div>
  </>
);

export default Backdrop;
