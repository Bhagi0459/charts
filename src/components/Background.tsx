import { useEffect, useRef } from 'react';
import './Background.css';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
}

const Background = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const colors = [
            'rgba(100, 108, 255, 0.5)', // Vite Purple
            'rgba(56, 189, 248, 0.5)',  // Sky Blue
            'rgba(232, 121, 249, 0.5)', // Pink/Purple
            'rgba(167, 139, 250, 0.5)'  // Soft Purple
        ];

        const initParticles = () => {
            particles = [];
            const particleCount = 40;

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: (Math.random() - 0.5) * 1.5,
                    size: Math.random() * 4 + 1, // Base radius
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Nice blending mode for glowing effect
            ctx.globalCompositeOperation = 'screen';

            particles.forEach((p) => {
                // Update position based on velocity
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off walls
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Mouse interaction
                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 300;

                if (distance < maxDistance) {
                    // Gentle attraction to mouse
                    const force = (maxDistance - distance) / maxDistance;
                    p.x += dx * force * 0.05;
                    p.y += dy * force * 0.05;
                }

                // Draw particle
                ctx.beginPath();

                // Dynamic size based on proximity to mouse (rich interaction)
                let dynamicSize = p.size;
                if (distance < maxDistance) {
                    dynamicSize += (maxDistance - distance) * 0.05;
                }

                // Draw as a glowing orb (radial gradient)
                // Be careful with performance of gradients in loop, but for 40 particles it's fine
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, dynamicSize * 4);
                gradient.addColorStop(0, p.color);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.fillStyle = gradient;
                ctx.arc(p.x, p.y, dynamicSize * 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
            });

            // Connect particles with lines if close (optional, maybe too busy? let's stick to glow)
            // Actually, let's add connection lines for that "tech" feel if they are close
            ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - dist / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);

        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="background-canvas" />;
};

export default Background;
