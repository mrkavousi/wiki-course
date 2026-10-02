import type { ShareTemplate } from '../types';
import { classicModern } from './classicModern';
import { cinematicImage } from './cinematicImage';
import { colorGradient } from './colorGradient';
import { darkEditorial } from './darkEditorial';
import { glassCard } from './glassCard';
import { infographicSummary } from './infographicSummary';
import { neumorphic } from './neumorphic';
import { ornamentalHeritage } from './ornamentalHeritage';
import { paperDocument } from './paperDocument';
import { softMinimal } from './softMinimal';

/** A new template: write one file with the ShareTemplate shape and add it here. */
export const TEMPLATES: ShareTemplate[] = [classicModern, cinematicImage, softMinimal, darkEditorial, paperDocument, colorGradient, glassCard, neumorphic, ornamentalHeritage, infographicSummary];
export const DEFAULT_TEMPLATE = TEMPLATES[0].id;
export const templateOf = (id: string) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
