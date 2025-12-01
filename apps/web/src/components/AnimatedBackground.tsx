import { useEffect, useRef } from 'react';

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const bats: Array<{
      x: number;
      y: number;
      speed: number;
      size: number;
    }> = [];

    for (let i = 0; i < 8; i++) {
      bats.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.5,
        speed: Math.random() * 2 + 1,
        size: Math.random() * 20 + 15,
      });
    }

    function animate() {
      if (!ctx || !canvas) return;

      ctx.fillStyle = '#0B0B0B';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        ctx.fillStyle = `rgba(255, 107, 0, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
      });

      bats.forEach((bat) => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.moveTo(bat.x, bat.y);
        ctx.lineTo(bat.x - bat.size / 2, bat.y - bat.size / 4);
        ctx.lineTo(bat.x - bat.size, bat.y);
        ctx.lineTo(bat.x - bat.size / 2, bat.y + bat.size / 4);
        ctx.lineTo(bat.x, bat.y);
        ctx.lineTo(bat.x + bat.size / 2, bat.y + bat.size / 4);
        ctx.lineTo(bat.x + bat.size, bat.y);
        ctx.lineTo(bat.x + bat.size / 2, bat.y - bat.size / 4);
        ctx.closePath();
        ctx.fill();

        bat.x += bat.speed;
        if (bat.x > canvas.width + bat.size) {
          bat.x = -bat.size;
          bat.y = Math.random() * canvas.height * 0.5;
        }
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}
