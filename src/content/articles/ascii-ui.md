---
title: Rendering UI from a character grid
category: EXPERIMENTS
date: 2026-02-04
type: project
link: https://github.com/leonardopetrucci
---

Every border on this page lands on a whole monospace cell. Here is the
measurement trick that makes it honest.

## Measure, do not guess

A hidden probe span reports the exact glyph width and line height. The frame
is then drawn from single characters snapped to that grid.

## One shared animation loop

The scramble-reveal effect runs on a single requestAnimationFrame loop shared
by every box on the page, so many boxes at once stay cheap.
