---
title: Designing a system, not a style
category: ENGINEERING
date: 2026-03-12
type: writing
---

When I joined Mojo in late 2024, the product had four dashboards, three date
pickers, and two opinions about what "small" meant for a button. Nothing was
broken. Every screen worked. But each new feature cost more than the last,
because every feature started from scratch.

Eighteen months later we ship most screens in under a day. The difference is
not taste. It is that we stopped maintaining a style and started maintaining
a system with three layers: tokens, primitives, and recipes.

## Tokens first

Color, spacing, radius, type scale, and motion durations live as named
tokens before any component exists. A token is just a variable, but the
naming carries the argument:

```
--color-surface-raised   not  --gray-100
--space-4                not  --pad-md
--radius-control         not  --rounded
```

Two rules made this work:

1. **Semantic names only.** `--gray-400` tells you nothing when dark mode
   arrives. `--color-border-muted` survives it.
2. **A bounded scale.** We allow exactly five spacing steps (4, 8, 12, 16,
   24) and one fluid type ramp. If a designer needs a sixth step, that is a
   design conversation, not a CSS edit.

The payoff showed up where we did not expect it. When we added a high
contrast theme for accessibility review, it took an afternoon, because the
theme was forty token overrides instead of four hundred component patches.

## Primitives stay dumb

Primitives are Button, Input, Dialog, Table. They know nothing about the
product. They translate tokens into layout and expose behavior:
focus management, keyboard handling, ARIA wiring.

We enforce dumbness with one blunt rule: **a primitive may not import
anything from the app layer.** No feature flags, no store access, no copy.
If a primitive needs to know something about the domain, the design is
wrong.

This rule hurt once. Our Table wanted row-level permissions baked in. We
said no, moved permissions into a recipe, and later reused the same Table in
the admin tool with completely different rules. That reuse paid back the
argument within a quarter.

## Recipes compose

Recipes are thin, product-level wrappers: `InviteMemberDialog`, `PlanCard`,
`FilterBar`. They combine primitives, hold product copy, and own the
domain decisions primitives refuse to make.

Recipes are disposable by intent. The system's health lives in tokens and
primitives; recipes are allowed to die. When a feature gets cut, its recipe
goes with it and nothing else notices.

One smell we now watch for: **a recipe past roughly one screen of code has
usually become a hidden primitive.** When `TeamSettingsForm` crossed 200
lines, we pulled its field patterns down into primitives and the recipe
shrank by half. This happened three times before we wrote the number down.

## What it costs

Honest numbers, because design system posts usually skip them:

- Two engineers spent about 30% of their time on the system for six months.
  That was the whole investment.
- Migration of existing screens ran alongside feature work and took a full
  quarter. We migrated screen by screen, never behind a flag branch.
- The token file changes maybe twice a month now. The primitives change
  rarely. Most churn happens in recipes, which is exactly where churn
  should be.

## The part nobody tells you

The system did not reduce the number of decisions. It moved them earlier.
Arguments about spacing now happen once, at the token layer, instead of
forty times across forty screens. That is the entire trick: a design system
is a decision cache, and like any cache, it works only if it has a clear
place to invalidate.
