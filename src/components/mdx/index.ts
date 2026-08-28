import type { ComponentType } from 'react';

import { MdxAccordion as Accordion } from '@/components/ui/accordion';
import { Callout } from './callout';
import { CodeBlock } from './code-block';
import { Image } from './image';
import { Steps } from './steps';
import { Tab, Tabs } from './tabs';
import { TOC } from './toc';

/**
 * Loose component type for the MDX `components` prop. MDX passes arbitrary
 * JSX props, so every entry accepts `never` (i.e. any prop shape).
 */
export type MdxComponents = Record<string, ComponentType<never>>;

/**
 * Global component map handed to every `.mdx` article via the MDX
 * `components` prop, so authors can use `<Callout>` etc. without imports.
 */
export const mdxComponents: MdxComponents = {
  Callout,
  CodeBlock,
  Image,
  TOC,
  Steps,
  Accordion,
  Tabs,
  Tab,
};

export { Accordion, Callout, CodeBlock, Image, Steps, Tab, Tabs, TOC };
