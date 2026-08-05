import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, X, Sparkles, AlertCircle } from 'lucide-react';
import { playNotificationSound } from '../../utils/notificationSound';

export const NotificationToastAnimation = ({ notification, onClose }) => {
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState(true);

  if (!notification) return null;

  const type = notification.type; // 'approved' or 'rejected'
  const isApproved = type === 'approved';

  // Play sound on mount
  useEffect(() => {
    playNotificationSound(type);

    // Auto dismiss after 4 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Allow fade-out animation
    }, 4000);

    return () => clearTimeout(timer);
  }, [type, onClose]);

  // Particle Canvas Animation (Fireworks/Confetti for Approved, Crying/Sad Emojis & Rain for Rejected)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    canvas.width = canvas.offsetWidth || 340;
    canvas.height = canvas.offsetHeight || 120;

    const particles = [];
    const particleCount = isApproved ? 40 : 18;

    const colors = isApproved
      ? ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6', '#10B981']
      : ['#EF4444', '#F97316', '#64748B'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: isApproved ? Math.random() * canvas.width : Math.random() * canvas.width,
        y: isApproved ? canvas.height : Math.random() * (canvas.height / 2),
        vx: (Math.random() - 0.5) * (isApproved ? 6 : 2),
        vy: isApproved ? -Math.random() * 5 - 2 : Math.random() * 2 + 1,
        radius: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.015 + 0.008,
        emoji: !isApproved ? (Math.random() > 0.4 ? '😢' : '💧') : null
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);

        if (p.emoji) {
          ctx.font = '16px serif';
          ctx.fillText(p.emoji, p.x, p.y);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      if (particles.some((p) => p.alpha > 0)) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isApproved]);

  return (
    <div className="fixed top-5 right-5 z-50 pointer-events-none max-w-sm w-full p-2 animate-in slide-in-from-top-5 duration-300">
      <div
        className={`pointer-events-auto relative rounded-2xl shadow-2xl border p-4 overflow-hidden backdrop-blur-md transition-all duration-300 ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        } ${
          isApproved
            ? 'bg-emerald-900/95 text-white border-emerald-500/50 ring-4 ring-emerald-500/20'
            : 'bg-rose-950/95 text-white border-rose-500/50 ring-4 ring-rose-500/20'
        }`}
      >
        {/* Background Canvas Effect */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />

        <div className="relative z-10 flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isApproved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}
          >
            {isApproved ? (
              <Sparkles className="w-6 h-6 text-emerald-300 animate-pulse" />
            ) : (
              <span className="text-2xl leading-none select-none">😢</span>
            )}
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${
                  isApproved ? 'bg-emerald-400/20 text-emerald-200' : 'bg-rose-400/20 text-rose-200'
                }`}
              >
                {isApproved ? 'Leave Approved 🎉' : 'Leave Rejected 😢'}
              </span>
            </div>
            <p className="text-xs font-bold leading-snug">
              {notification.message}
            </p>
          </div>

          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 200);
            }}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar Timer */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
          <div
            className={`h-full ${isApproved ? 'bg-emerald-400' : 'bg-rose-400'} animate-shrink-progress`}
            style={{ animationDuration: '4000ms' }}
          />
        </div>
      </div>
    </div>
  );
};
