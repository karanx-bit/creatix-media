"use client";

import React, { useEffect, useRef } from "react";

interface LiquidImageProps {
    src: string;
    alt?: string;
    className?: string;
}

export default function LiquidImage({ src, alt = "", className = "" }: LiquidImageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number>();
    const mouseRef = useRef({ x: -10, y: -10, targetX: -10, targetY: -10, active: false });

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
        if (!gl) {
            console.error("WebGL not supported");
            return;
        }

        let width = container.clientWidth;
        let height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;

        // --- WebGL Shaders ---
        const vsSource = `
            attribute vec2 a_position;
            varying vec2 v_uv;
            void main() {
                v_uv = a_position * 0.5 + 0.5;
                v_uv.y = 1.0 - v_uv.y; // Flip Y for WebGL texture
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fsSource = `
            precision highp float;
            varying vec2 v_uv;
            uniform sampler2D u_image;
            uniform vec2 u_mouse;
            uniform float u_time;
            uniform vec2 u_resolution;

            void main() {
                vec2 uv = v_uv;
                
                // Liquid math
                if (u_mouse.x >= 0.0 && u_mouse.x <= 1.0 && u_mouse.y >= 0.0 && u_mouse.y <= 1.0) {
                    float dist = distance(uv, u_mouse);
                    // Create a ripple effect based on distance and time
                    float ripple = sin(32.0 * dist - u_time * 8.0 * 0.14) * 0.04;
                    // Fade ripple out as distance increases
                    float effect = exp(-dist * 12.0);
                    // Displace UVs
                    uv += normalize(uv - u_mouse) * ripple * 0.075 * effect * 2.0;
                }

                uv = clamp(uv, 0.0, 1.0);
                vec4 color = texture2D(u_image, uv);
                gl_FragColor = color;
            }
        `;

        // Shader Compilation Utility
        const compileShader = (type: number, source: string) => {
            const shader = (gl as WebGLRenderingContext).createShader(type);
            if (!shader) return null;
            (gl as WebGLRenderingContext).shaderSource(shader, source);
            (gl as WebGLRenderingContext).compileShader(shader);
            return shader;
        };

        const vShader = compileShader(gl.VERTEX_SHADER, vsSource);
        const fShader = compileShader(gl.FRAGMENT_SHADER, fsSource);
        if (!vShader || !fShader) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        // --- Geometry (Full screen quad) ---
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            1.0, 1.0,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const posLocation = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(posLocation);
        gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

        // --- Uniforms ---
        const uTime = gl.getUniformLocation(program, "u_time");
        const uMouse = gl.getUniformLocation(program, "u_mouse");
        const uResolution = gl.getUniformLocation(program, "u_resolution");
        const uImage = gl.getUniformLocation(program, "u_image");

        // --- Texture Loading & Object-Fit Cover Logic ---
        const texture = gl.createTexture();
        const img = new Image();
        img.src = src;
        let imgLoaded = false;

        img.onload = () => {
            imgLoaded = true;
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // Set up texture parameters
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            updateTextureCover();
        };

        // Crop image onto a temporary canvas to simulate CSS object-fit: cover before feeding to WebGL
        const updateTextureCover = () => {
            if (!imgLoaded) return;

            const offCanvas = document.createElement('canvas');
            offCanvas.width = width;
            offCanvas.height = height;
            const ctx = offCanvas.getContext('2d');
            if (!ctx) return;

            const imgRatio = img.width / img.height;
            const canvasRatio = width / height;

            let drawW = width;
            let drawH = height;
            let drawX = 0;
            let drawY = 0;

            if (imgRatio > canvasRatio) {
                drawW = height * imgRatio;
                drawX = (width - drawW) / 2;
            } else {
                drawH = width / imgRatio;
                drawY = (height - drawH) / 2;
            }

            ctx.drawImage(img, drawX, drawY, drawW, drawH);

            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); // Already flipped in vertex shader
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, offCanvas);
        };

        // --- Mouse Tracking ---
        const updateMouse = (e: MouseEvent | TouchEvent) => {
            const rect = canvas.getBoundingClientRect();
            let clientX, clientY;

            if ('touches' in e) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = (e as MouseEvent).clientX;
                clientY = (e as MouseEvent).clientY;
            }

            // Normalize to 0 -> 1 mapped to canvas
            const x = (clientX - rect.left) / width;
            const y = (clientY - rect.top) / height;

            mouseRef.current.targetX = x;
            mouseRef.current.targetY = y;
            mouseRef.current.active = true;
        };

        const leaveMouse = () => {
            mouseRef.current.active = false;
        };

        container.addEventListener('mousemove', updateMouse);
        container.addEventListener('touchmove', updateMouse);
        container.addEventListener('mouseleave', leaveMouse);
        container.addEventListener('touchend', leaveMouse);

        // --- Render Loop ---
        const startTime = Date.now();

        const render = () => {
            if (!imgLoaded) {
                requestRef.current = requestAnimationFrame(render);
                return;
            }

            gl.viewport(0, 0, width, height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            const now = (Date.now() - startTime) / 1000.0;
            gl.uniform1f(uTime, now);
            gl.uniform2f(uResolution, width, height);

            // Lerp mouse for smoothness
            if (mouseRef.current.active) {
                mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
                mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;
            } else {
                // Move mouse far offscreen to kill the ripple effect smoothly
                mouseRef.current.x += (-10 - mouseRef.current.x) * 0.05;
                mouseRef.current.y += (-10 - mouseRef.current.y) * 0.05;
            }

            gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(uImage, 0);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            requestRef.current = requestAnimationFrame(render);
        };

        render();

        // --- Resize Handler ---
        const handleResize = () => {
            width = container.clientWidth;
            height = container.clientHeight;
            canvas.width = width;
            canvas.height = height;
            updateTextureCover();
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            container.removeEventListener('mousemove', updateMouse);
            container.removeEventListener('touchmove', updateMouse);
            container.removeEventListener('mouseleave', leaveMouse);
            container.removeEventListener('touchend', leaveMouse);
            window.removeEventListener('resize', handleResize);
        };
    }, [src]);

    return (
        <div ref={containerRef} className={`relative overflow-hidden w-full h-full ${className}`}>
            <canvas ref={canvasRef} className="block w-full h-full" aria-label={alt} />
        </div>
    );
}
