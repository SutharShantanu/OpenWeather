"use client";

import React, { useEffect, useRef } from "react";

interface WeatherParticlesProps {
  condition: string;
}

export const WeatherParticles: React.FC<WeatherParticlesProps> = ({ condition }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    // Particle class definition with canvas-physics
    class Particle {
      x: number = 0;
      y: number = 0;
      size: number = 0;
      speedX: number = 0;
      speedY: number = 0;
      opacity: number = 0;
      fadeSpeed: number = 0;
      angle: number = 0;
      spin: number = 0;
      color: string = "";
      isAccent: boolean = false;

      constructor(type: string) {
        this.reset(type, true);
      }

      reset(type: string, initRandomY = false) {
        this.x = Math.random() * width;
        this.y = initRandomY ? Math.random() * height : -10;
        this.opacity = Math.random() * 0.35 + 0.1;
        this.fadeSpeed = Math.random() * 0.004 + 0.002;
        this.isAccent = Math.random() < 0.15; // 15% high fidelity accent glow nodes

        // Physics setup per weather scenario
        if (type === "rain" || type === "storm") {
          this.size = Math.random() * 1.5 + 1;
          this.speedY = Math.random() * 9 + 7;
          this.speedX = -1.5 - Math.random() * 1.5; // Wind blow angle
          this.color = this.isAccent ? "rgba(91, 155, 246, " : "rgba(255, 255, 255, ";
        } else if (type === "snow") {
          this.size = Math.random() * 3.5 + 1.5;
          this.speedY = Math.random() * 1.0 + 0.5;
          this.speedX = Math.sin(Math.random() * Math.PI * 2) * 0.4;
          this.angle = Math.random() * Math.PI * 2;
          this.spin = Math.random() * 0.015 - 0.007;
          this.color = this.isAccent ? "rgba(165, 243, 252, " : "rgba(255, 255, 255, ";
        } else if (type === "clear" || type === "sun") {
          this.size = Math.random() * 10 + 5;
          this.speedY = -(Math.random() * 0.3 + 0.1); // Slowly float upwards
          this.speedX = Math.random() * 0.4 - 0.2;
          this.color = this.isAccent ? "rgba(245, 166, 35, " : "rgba(229, 26, 36, ";
        } else {
          // Cloudy or foggy default
          this.size = Math.random() * 50 + 25; // Big volumetric creeping mist blobs
          this.speedY = 0;
          this.speedX = Math.random() * 0.2 + 0.05; // Creep right
          this.opacity = Math.random() * 0.05 + 0.01;
          this.color = "rgba(255, 255, 255, ";
        }
      }

      update(type: string) {
        if (type === "rain" || type === "storm") {
          this.y += this.speedY;
          this.x += this.speedX;
          if (this.y > height || this.x < -10) {
            this.reset(type);
          }
        } else if (type === "snow") {
          this.y += this.speedY;
          this.angle += this.spin;
          this.x += this.speedX + Math.sin(this.angle) * 0.25;
          if (this.y > height) {
            this.reset(type);
          }
        } else if (type === "clear" || type === "sun") {
          this.y += this.speedY;
          this.x += this.speedX;
          this.opacity -= this.fadeSpeed;
          if (this.opacity <= 0 || this.y < -20) {
            this.reset(type);
          }
        } else {
          // Cloudy mist
          this.x += this.speedX;
          if (this.x > width + this.size) {
            this.x = -this.size;
            this.y = Math.random() * height;
          }
        }
      }

      draw(c: CanvasRenderingContext2D, type: string) {
        c.fillStyle = `${this.color}${this.opacity})`;
        c.beginPath();

        if (type === "rain" || type === "storm") {
          // Draw glassy falling streaks
          c.strokeStyle = `${this.color}${this.opacity * 0.85})`;
          c.lineWidth = this.size;
          c.beginPath();
          c.moveTo(this.x, this.y);
          c.lineTo(this.x + this.speedX * 1.3, this.y + this.speedY * 1.3);
          c.stroke();
        } else if (type === "snow") {
          c.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
          c.fill();
        } else if (type === "clear" || type === "sun") {
          // Heat shimmers with smooth edge decay
          const gradient = c.createRadialGradient(
            this.x,
            this.y,
            0,
            this.x,
            this.y,
            this.size
          );
          gradient.addColorStop(0, `${this.color}${this.opacity * 1.2})`);
          gradient.addColorStop(0.5, `${this.color}${this.opacity * 0.3})`);
          gradient.addColorStop(1, `${this.color}0)`);
          c.fillStyle = gradient;
          c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          c.fill();
        } else {
          // Volumetric clouds
          const gradient = c.createRadialGradient(
            this.x,
            this.y,
            0,
            this.x,
            this.y,
            this.size
          );
          gradient.addColorStop(0, `${this.color}${this.opacity})`);
          gradient.addColorStop(0.6, `${this.color}${this.opacity * 0.25})`);
          gradient.addColorStop(1, `${this.color}0)`);
          c.fillStyle = gradient;
          c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          c.fill();
        }
      }
    }

    const getParticleType = (): string => {
      const type = condition.toLowerCase();
      if (type.includes("clear") || type.includes("sun")) return "clear";
      if (type.includes("rain") || type.includes("drizzle") || type.includes("sleet")) return "rain";
      if (type.includes("storm") || type.includes("thunder")) return "storm";
      if (type.includes("snow") || type.includes("ice") || type.includes("freeze")) return "snow";
      return "cloudy";
    };

    const particleType = getParticleType();
    const particlesArray: Particle[] = [];
    const maxParticles = particleType === "rain" || particleType === "storm" 
      ? 110 
      : particleType === "snow" 
        ? 75 
        : particleType === "clear" 
          ? 30 
          : 20;

    for (let i = 0; i < maxParticles; i++) {
      particlesArray.push(new Particle(particleType));
    }

    let stormLightningChance = 0.0035; // Sheet lightning triggers
    let flashOpacity = 0;

    const handleResize = () => {
      if (canvasRef.current) {
        width = canvas.width = canvasRef.current.offsetWidth;
        height = canvas.height = canvasRef.current.offsetHeight;
      }
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      if (particleType === "storm") {
        if (Math.random() < stormLightningChance && flashOpacity <= 0) {
          flashOpacity = Math.random() * 0.22 + 0.12;
        }
        if (flashOpacity > 0) {
          ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
          ctx.fillRect(0, 0, width, height);
          flashOpacity -= 0.015;
        }
      }

      particlesArray.forEach((particle) => {
        particle.update(particleType);
        particle.draw(ctx, particleType);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [condition]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 mix-blend-screen"
    />
  );
};
