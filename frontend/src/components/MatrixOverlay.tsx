import React, { useEffect, useRef } from 'react';

interface MatrixOverlayProps {
  onClose: () => void;
}

const MatrixOverlay: React.FC<MatrixOverlayProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const terms = [
      "ESAS NUMARASI", "KARAR", "MÜZEKKERE", "TEBLİGAT", "BİLİRKİŞİ", "KALEM", 
      "KATİP", "MÜDÜR", "HAKİM", "DURUŞMA", "TUTANAK", "İLAM", "DERKENAR",
      "DAVACI", "DAVALI", "VEKİL", "GEREKÇELİ KARAR", "ADALET", "HUKUK", "UYAP"
    ];

    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }

    const draw = () => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#D4AF37'; // Gold matrix for premium feel
        ctx.font = fontSize + 'px Outfit';

        for (let i = 0; i < drops.length; i++) {
            const text = terms[Math.floor(Math.random() * terms.length)];
            ctx.fillText(text, i * fontSize * 6, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    };

    const interval = setInterval(draw, 33);

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
        clearInterval(interval);
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center cursor-pointer"
      onClick={onClose}
    >
      <canvas ref={canvasRef} className="absolute inset-0 opacity-40" />
      <div className="relative z-[101] text-center animate-pulse">
        <h1 className="text-gold text-4xl md:text-6xl font-bold mb-4 tracking-widest drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]">
          TASARIM VE KODLAMA : SEMİH ÇETİN
        </h1>
        <p className="text-gold/80 text-xl md:text-2xl font-light tracking-wide uppercase">
          Bursa 4. İş Mahkemesi Yazı İşleri Müdürü
        </p>
      </div>
      <div className="absolute bottom-10 text-gold/40 text-sm animate-bounce">
        Kapatmak için herhangi bir yere tıklayın
      </div>
    </div>
  );
};

export default MatrixOverlay;
