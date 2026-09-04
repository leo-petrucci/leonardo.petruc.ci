import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform float u_angle;
uniform float u_noise;
uniform vec3 u_color;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  v += 0.5 * noise(p);
  v += 0.25 * noise(p * 2.03 + 17.1);
  v += 0.125 * noise(p * 4.01 - 9.7);
  return v;
}

float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}

float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

void main() {
  vec2 cell = gl_FragCoord.xy;
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float rad = radians(u_angle);
  float gradient = dot(uv - 0.5, vec2(cos(rad), sin(rad))) + 0.5;
  vec2 drift = vec2(u_time * u_speed, u_time * u_speed * 0.6);
  float n = fbm(cell * 0.08 + drift) - 0.5;
  float field = clamp(gradient + n * u_noise, 0.0, 1.0);
  float threshold = bayer4(cell);
  gl_FragColor = field > threshold ? vec4(u_color, 1.0) : vec4(0.0);
}
`;

function compile(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

type DitherGLState = {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  buffer: WebGLBuffer;
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
  uTime: WebGLUniformLocation | null;
};

type DitherFieldProps = {
  className?: string;
  color?: string;
  angle?: number;
  noise?: number;
  pixelSize?: number;
  speed?: number;
  /** Stops the render loop entirely. The WebGL context is created lazily on first unpause. */
  paused?: boolean;
};

export function DitherField({
  className,
  color = '#262626',
  angle = 90,
  noise = 0.25,
  pixelSize = 3,
  speed = 0.15,
  paused = false,
}: DitherFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<DitherGLState | null>(null);
  const observersRef = useRef<{
    resize?: ResizeObserver;
    intersection?: IntersectionObserver;
  }>({});
  const rafRef = useRef(0);
  const runningRef = useRef(false);
  const visibleRef = useRef(true);
  const pausedRef = useRef(paused);
  const lastFrameRef = useRef(0);
  const startTimeRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const propsRef = useRef({ color, angle, noise, pixelSize, speed });
  propsRef.current = { color, angle, noise, pixelSize, speed };

  const stopLoop = () => {
    cancelAnimationFrame(rafRef.current);
    runningRef.current = false;
  };

  const startLoop = () => {
    const state = stateRef.current;
    if (!state || runningRef.current || pausedRef.current) return;
    runningRef.current = true;
    const frameInterval = 1000 / 30;
    const draw = (now: number) => {
      if (!pausedRef.current && visibleRef.current) {
        if (now - lastFrameRef.current >= frameInterval) {
          lastFrameRef.current = now;
          const t = (now - startTimeRef.current) / 1000;
          state.gl.uniform1f(
            state.uTime,
            reducedMotionRef.current ? 10 : t,
          );
          state.gl.drawArrays(state.gl.TRIANGLES, 0, 3);
          if (reducedMotionRef.current) {
            stopLoop();
            return;
          }
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
  };

  const initGL = () => {
    if (stateRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const { color, angle, noise, pixelSize, speed } = propsRef.current;

    const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(
      gl.getUniformLocation(program, 'u_resolution'),
      canvas.width,
      canvas.height,
    );
    gl.uniform1f(gl.getUniformLocation(program, 'u_speed'), speed);
    gl.uniform1f(gl.getUniformLocation(program, 'u_angle'), angle);
    gl.uniform1f(gl.getUniformLocation(program, 'u_noise'), noise);
    gl.uniform3fv(gl.getUniformLocation(program, 'u_color'), hexToRgb(color));

    stateRef.current = {
      gl,
      program,
      buffer,
      vertexShader,
      fragmentShader,
      uTime: gl.getUniformLocation(program, 'u_time'),
    };

    const resize = () => {
      const width = Math.max(1, Math.ceil(canvas.clientWidth / pixelSize));
      const height = Math.max(1, Math.ceil(canvas.clientHeight / pixelSize));
      if (canvas.width === width && canvas.height === height) return;
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), width, height);
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    observersRef.current.resize = observer;

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting) startLoop();
    });
    intersectionObserver.observe(canvas);
    observersRef.current.intersection = intersectionObserver;
  };

  useEffect(() => {
    pausedRef.current = paused;
    if (paused) {
      stopLoop();
    } else {
      initGL();
      startTimeRef.current = performance.now();
      startLoop();
    }
  }, [paused]);

  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;
    const { gl, program } = state;
    const { color, angle, noise, speed } = propsRef.current;
    gl.useProgram(program);
    gl.uniform1f(gl.getUniformLocation(program, 'u_speed'), speed);
    gl.uniform1f(gl.getUniformLocation(program, 'u_angle'), angle);
    gl.uniform1f(gl.getUniformLocation(program, 'u_noise'), noise);
    gl.uniform3fv(gl.getUniformLocation(program, 'u_color'), hexToRgb(color));
    if (!pausedRef.current) {
      startTimeRef.current = performance.now();
      startLoop();
    }
  }, [color, angle, noise, speed]);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    startTimeRef.current = performance.now();
    if (!pausedRef.current) {
      initGL();
      startLoop();
    }
    return () => {
      stopLoop();
      observersRef.current.resize?.disconnect();
      observersRef.current.intersection?.disconnect();
      const state = stateRef.current;
      if (!state) return;
      state.gl.deleteProgram(state.program);
      state.gl.deleteBuffer(state.buffer);
      state.gl.deleteShader(state.vertexShader);
      state.gl.deleteShader(state.fragmentShader);
      stateRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ imageRendering: 'pixelated' }}
      aria-hidden="true"
    >
      Your browser does not support this visual effect.
    </canvas>
  );
}
