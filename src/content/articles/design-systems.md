---
title: Designing a system, not a style
category: ENGINEERING
date: 2026-03-12
type: writing
---

How we split tokens, primitives and recipes at Mojo so the product could grow
without the UI fracturing.

## Tokens first

Color, spacing and type live as named tokens before any component exists.

## Primitives stay dumb

Primitives know nothing about the product. They only translate tokens into
layout.

## Recipes compose

Recipes are thin product-level wrappers. When a recipe grows past one screen,
it is a smell.
