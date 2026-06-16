"use client";

import { useEffect, useRef } from "react";

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface GlassSphere {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  speedY: number;
  amplitudeX: number;
  frequencyX: number;
  phase: number;
  parallaxFactor: number;
}

export function ThreeDBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic Blobs for the Mesh Gradient background
    const blobs: Blob[] = [
      {
        x: width * 0.2,
        y: height * 0.2,
        vx: 0.8,
        vy: 0.6,
        radius: Math.min(width, height) * 0.45,
        color: "rgba(99, 102, 241, 0.18)", // Indigo-500
      },
      {
        x: width * 0.8,
        y: height * 0.3,
        vx: -0.6,
        vy: 0.7,
        radius: Math.min(width, height) * 0.4,
        color: "rgba(59, 130, 246, 0.15)", // Blue-500
      },
      {
        x: width * 0.3,
        y: height * 0.8,
        vx: 0.5,
        vy: -0.5,
        radius: Math.min(width, height) * 0.35,
        color: "rgba(168, 85, 247, 0.15)", // Purple-500
      },
      {
        x: width * 0.7,
        y: height * 0.7,
        vx: -0.7,
        vy: -0.6,
        radius: Math.min(width, height) * 0.25,
        color: "rgba(159, 232, 112, 0.08)", // Lime Accent
      },
    ];

    // Floating 3D Projected Glass Spheres
    const spheres: GlassSphere[] = [
      {
        x: width * 0.15,
        y: height * 0.45,
        baseX: width * 0.15,
        baseY: height * 0.45,
        radius: 75,
        speedY: 0.25,
        amplitudeX: 25,
        frequencyX: 0.001,
        phase: 0,
        parallaxFactor: 0.04,
      },
      {
        x: width * 0.85,
        y: height * 0.25,
        baseX: width * 0.85,
        baseY: height * 0.25,
        radius: 120,
        speedY: 0.18,
        amplitudeX: 40,
        frequencyX: 0.0008,
        phase: Math.PI / 3,
        parallaxFactor: -0.05,
      },
      {
        x: width * 0.75,
        y: height * 0.8,
        baseX: width * 0.75,
        baseY: height * 0.8,
        radius: 50,
        speedY: 0.35,
        amplitudeX: 20,
        frequencyX: 0.0015,
        phase: Math.PI,
        parallaxFactor: 0.03,
      },
      {
        x: width * 0.3,
        y: height * 0.85,
        baseX: width * 0.3,
        baseY: height * 0.85,
        radius: 95,
        speedY: 0.22,
        amplitudeX: 35,
        frequencyX: 0.0007,
        phase: Math.PI * 1.5,
        parallaxFactor: -0.03,
      },
    ];

    // Dust/Star Particles
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedY: -(Math.random() * 0.3 + 0.1),
      opacity: Math.random() * 0.5 + 0.2,
    }));

    // Handle mouse movements
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      // Adjust positions and sizes based on screen scaling
      const baseMin = Math.min(width, height);
      blobs[0].radius = baseMin * 0.45;
      blobs[1].radius = baseMin * 0.4;
      blobs[2].radius = baseMin * 0.35;
      blobs[3].radius = baseMin * 0.25;

      spheres[0].baseX = width * 0.15;
      spheres[1].baseX = width * 0.85;
      spheres[2].baseX = width * 0.75;
      spheres[3].baseX = width * 0.3;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    // Initial mouse targets in the center
    mouseRef.current.targetX = width / 2;
    mouseRef.current.targetY = height / 2;
    mouseRef.current.x = width / 2;
    mouseRef.current.y = height / 2;

    const render = () => {
      // Clear canvas with dark gradient base
      ctx.fillStyle = "#02040a";
      ctx.fillRect(0, 0, width, height);

      // Smooth mouse interpolation (lag for smooth motion)
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Draw mesh background blobs
      ctx.globalCompositeOperation = "screen";
      blobs.forEach((blob) => {
        // Update positions
        blob.x += blob.vx;
        blob.y += blob.vy;

        // Bounce off canvas boundaries
        if (blob.x - blob.radius < 0 || blob.x + blob.radius > width) {
          blob.vx *= -1;
        }
        if (blob.y - blob.radius < 0 || blob.y + blob.radius > height) {
          blob.vy *= -1;
        }

        // Draw radial gradient for smooth cloud look
        const gradient = ctx.createRadialGradient(
          blob.x,
          blob.y,
          0,
          blob.x,
          blob.y,
          blob.radius
        );
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw dust particles (in normal blend mode)
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      particles.forEach((p) => {
        p.y += p.speedY;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });

      // Draw floating 3D glass spheres with lighting refractions
      spheres.forEach((sphere) => {
        // Floating wave math
        sphere.phase += sphere.speedY * 0.02;
        sphere.baseY -= sphere.speedY;
        if (sphere.baseY + sphere.radius < 0) {
          sphere.baseY = height + sphere.radius;
        }

        // Calculate dynamic coordinate with parallax based on mouse
        const deltaX = (mouse.x - width / 2) * sphere.parallaxFactor;
        const deltaY = (mouse.y - height / 2) * sphere.parallaxFactor;

        sphere.x =
          sphere.baseX +
          Math.sin(sphere.phase) * sphere.amplitudeX +
          deltaX;
        sphere.y = sphere.baseY + deltaY;

        // 1. Draw sphere drop shadow
        ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = 24;
        ctx.shadowOffsetX = 10;
        ctx.shadowOffsetY = 15;

        // 2. Base semi-translucent glass circle
        ctx.beginPath();
        ctx.arc(sphere.x, sphere.y, sphere.radius, 0, Math.PI * 2);
        const glassGrad = ctx.createRadialGradient(
          sphere.x - sphere.radius * 0.2,
          sphere.y - sphere.radius * 0.2,
          sphere.radius * 0.1,
          sphere.x,
          sphere.y,
          sphere.radius
        );
        glassGrad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
        glassGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.02)");
        glassGrad.addColorStop(1, "rgba(255, 255, 255, 0.05)");
        ctx.fillStyle = glassGrad;
        ctx.fill();

        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // 3. Inner shadow for refraction thickness
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 4. Draw specular highlight (primary light reflection)
        const highlightGrad = ctx.createRadialGradient(
          sphere.x - sphere.radius * 0.35,
          sphere.y - sphere.radius * 0.35,
          0,
          sphere.x - sphere.radius * 0.35,
          sphere.y - sphere.radius * 0.35,
          sphere.radius * 0.35
        );
        highlightGrad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
        highlightGrad.addColorStop(0.2, "rgba(255, 255, 255, 0.2)");
        highlightGrad.addColorStop(1, "rgba(255, 255, 255, 0)");

        ctx.fillStyle = highlightGrad;
        ctx.beginPath();
        ctx.arc(
          sphere.x - sphere.radius * 0.35,
          sphere.y - sphere.radius * 0.35,
          sphere.radius * 0.35,
          0,
          Math.PI * 2
        );
        ctx.fill();

        // 5. Draw secondary backlight bounce (bottom-right edge)
        const backlightGrad = ctx.createRadialGradient(
          sphere.x + sphere.radius * 0.4,
          sphere.y + sphere.radius * 0.4,
          0,
          sphere.x + sphere.radius * 0.4,
          sphere.y + sphere.radius * 0.4,
          sphere.radius * 0.4
        );
        backlightGrad.addColorStop(0, "rgba(159, 232, 112, 0.12)"); // Subtle lime glow backlight
        backlightGrad.addColorStop(1, "rgba(159, 232, 112, 0)");

        ctx.fillStyle = backlightGrad;
        ctx.beginPath();
        ctx.arc(
          sphere.x + sphere.radius * 0.4,
          sphere.y + sphere.radius * 0.4,
          sphere.radius * 0.4,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none h-screen w-screen"
      style={{ backfaceVisibility: "hidden" }}
    />
  );
}
