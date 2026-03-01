"use client";

import React, { useEffect, useRef } from "react";

interface LiquidChromeProps {
    className?: string;
    speed?: number;
    hueShift?: number;
    noiseIntensity?: number;
    warpAmount?: number;
}

export default function LiquidChromeBackground({
    className = "",
    speed = 0.5,
    hueShift = 0.0,
    noiseIntensity = 0.02,
    warpAmount = 0.2
}: LiquidChromeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;
        if (!parent) return;

        const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
        if (!gl) {
            console.error("WebGL not supported");
            return;
        }

        const vsSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

        const fsSource = `
            precision highp float;
            uniform float uTime;
            uniform vec2 uResolution;
            uniform float uHueShift;
            uniform float uNoise;
            uniform float uWarp;
            uniform vec3 uBaseColor; // Chrome Base Color

            // Basic noise function
            float rand(vec2 n) { 
                return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
            }

            // Hue Shift Function
            vec3 hueShiftRGB(vec3 color, float hueAdjust) {
                const vec3 k = vec3(0.57735, 0.57735, 0.57735);
                float cosAngle = cos(hueAdjust);
                return vec3(color * cosAngle + cross(k, color) * sin(hueAdjust) + k * dot(k, color) * (1.0 - cosAngle));
            }

            vec3 getLiquidChrome(vec2 uv, float t) {
                // Liquid warp math
                vec2 q = vec2(0.);
                q.x = sin(uv.x * 3.0 + t) * 0.5;
                q.y = cos(uv.y * 3.0 + t) * 0.5;

                vec2 r = vec2(0.);
                r.x = sin(uv.x * 2.0 + q.x * 5.0 + t * 1.5);
                r.y = cos(uv.y * 2.0 + q.y * 5.0 + t * 1.5);

                float intensity = sin(r.x + r.y + t) * 0.5 + 0.5;
                
                // Chrome-like metallic gradient based on intensity
                // Adjusting colors here towards a silver/dark liquid chrome aesthetic
                vec3 col1 = vec3(0.1, 0.1, 0.15); // Dark shadow
                vec3 col2 = vec3(0.5, 0.55, 0.6); // Mids
                vec3 col3 = vec3(0.9, 0.95, 1.0); // Highlight shine
                
                vec3 color = mix(col1, col2, smoothstep(0.0, 0.5, intensity));
                color = mix(color, col3, smoothstep(0.5, 1.0, intensity));

                // Add liquid warp banding
                color += vec3(0.1) * sin(intensity * 20.0);

                return color;
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / uResolution.xy;
                uv.y = 1.0 - uv.y; // Flip Y

                // Add spatial warp
                uv += uWarp * vec2(sin(uv.y * 6.283 + uTime * 0.5), cos(uv.x * 6.283 + uTime * 0.5)) * 0.05;

                // Base chromatic liquid calculation
                vec4 col = vec4(getLiquidChrome(uv, uTime), 1.0);

                // Apply hue shift
                col.rgb = hueShiftRGB(col.rgb, uHueShift);

                // Apply noise
                col.rgb += (rand(gl_FragCoord.xy + uTime) - 0.5) * uNoise;

                gl_FragColor = vec4(clamp(col.rgb, 0.0, 1.0), 1.0);
            }
        `;

        const compileShader = (type: number, source: string) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error("Shader syntax error", gl.getShaderInfoLog(shader));
                return null;
            }
            return shader;
        };

        const vertexShader = compileShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fsSource);
        if (!vertexShader || !fragmentShader) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        const positions = new Float32Array([
            -1.0, -1.0,
            3.0, -1.0,
            -1.0, 3.0,
        ]); // Single massive triangle to cover screen (more efficient than quad)

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(program, "position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const uniforms = {
            uTime: gl.getUniformLocation(program, "uTime"),
            uResolution: gl.getUniformLocation(program, "uResolution"),
            uHueShift: gl.getUniformLocation(program, "uHueShift"),
            uNoise: gl.getUniformLocation(program, "uNoise"),
            uWarp: gl.getUniformLocation(program, "uWarp")
        };

        const handleResize = () => {
            const w = parent.clientWidth;
            const h = parent.clientHeight;
            // High DPI support
            const dpr = window.devicePixelRatio || 1;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        let reqId: number;
        const startTime = performance.now();

        const render = () => {
            const currentTime = (performance.now() - startTime) / 1000;

            gl.uniform1f(uniforms.uTime, currentTime * speed);
            gl.uniform1f(uniforms.uHueShift, hueShift);
            gl.uniform1f(uniforms.uNoise, noiseIntensity);
            gl.uniform1f(uniforms.uWarp, warpAmount);

            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            reqId = requestAnimationFrame(render);
        };
        render();

        return () => {
            cancelAnimationFrame(reqId);
            window.removeEventListener('resize', handleResize);
            gl.deleteProgram(program);
        };
    }, [speed, hueShift, noiseIntensity, warpAmount]);

    return (
        <canvas
            ref={canvasRef}
            className={`block w-full h-full ${className}`}
            style={{ pointerEvents: 'none' }} // Ensure it acts purely as a background
        />
    );
}
