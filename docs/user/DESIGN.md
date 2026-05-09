---
name: Diary ~Do It and Review Yourself~
colors:
  surface: '#faf9f7'
  surface-dim: '#dadad8'
  surface-bright: '#faf9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f1'
  surface-container: '#efeeec'
  surface-container-high: '#e9e8e6'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1b'
  on-surface-variant: '#414843'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#717973'
  outline-variant: '#c1c8c1'
  surface-tint: '#406651'
  primary: '#406651'
  on-primary: '#ffffff'
  primary-container: '#7da68d'
  on-primary-container: '#143b28'
  inverse-primary: '#a6d0b5'
  secondary: '#4a6176'
  on-secondary: '#ffffff'
  secondary-container: '#cee5ff'
  on-secondary-container: '#50677c'
  tertiary: '#795741'
  on-tertiary: '#ffffff'
  tertiary-container: '#bd947b'
  on-tertiary-container: '#4a2e1b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1edd1'
  primary-fixed-dim: '#a6d0b5'
  on-primary-fixed: '#002112'
  on-primary-fixed-variant: '#284e3a'
  secondary-fixed: '#cee5ff'
  secondary-fixed-dim: '#b2c9e2'
  on-secondary-fixed: '#041d30'
  on-secondary-fixed-variant: '#33495d'
  tertiary-fixed: '#ffdbc7'
  tertiary-fixed-dim: '#eabda3'
  on-tertiary-fixed: '#2d1605'
  on-tertiary-fixed-variant: '#5f402c'
  background: '#faf9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e3e2e0'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  body-md:
    fontFamily: Newsreader
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 20px
---

## Brand & Style

The brand personality is grounded, empathetic, and organized. It serves as a digital sanctuary for self-reflection and habit formation, moving away from high-energy "productivity" tropes toward a more mindful "rhythm of life." The target audience consists of individuals seeking clarity, mental wellness, and steady personal growth without the pressure of aggressive gamification.

The design style is **Soft Minimalism**. It prioritizes heavy whitespace and a restricted, nature-inspired color palette to lower cognitive load. The UI feels airy and breathable, utilizing subtle depth and organic shapes to create a sense of calm. Every interaction is designed to feel intentional and encouraging, fostering a safe space for honest self-expression.

## Colors

The palette is rooted in botanical and atmospheric tones to evoke tranquility.
- **Primary (Sage Green):** Used for primary actions, success states, and habit completion. It represents growth and vitality.
- **Secondary (Soft Blue):** Used for reflective elements, mood tracking, and secondary navigation. It represents clarity and calm.
- **Tertiary (Warm Neutral/Dusty Rose):** Used sparingly for highlights, reminders, or emotional markers to add warmth without urgency.
- **Neutrals:** A range of off-whites and warm grays replace harsh blacks and pure whites, reducing eye strain during long-form journaling.

## Typography

This design system uses a dual-font strategy to balance functional utility with the intimacy of a physical diary.
- **UI Elements:** **Manrope** is used for all navigational elements, labels, and buttons. Its geometric yet friendly proportions provide a modern, organized feel.
- **Journaling Content:** **Newsreader** is used for diary entries and long-form reflection. The serif typeface provides a literary, "bookish" quality that encourages deeper thought and makes reading back through entries more pleasurable.
- **Hierarchy:** Use generous line heights for the serif body text to maintain a premium, editorial feel. Labels should use slightly increased letter spacing for clarity at small sizes.

## Layout & Spacing

The layout philosophy is based on a **Fluid Grid** with intentional "quiet zones."
- **Mobile:** A 4-column grid with 20px side margins. Elements should be vertically stacked with 16-24px of breathing room between functional groups.
- **Desktop/Tablet:** A 12-column grid. Content-heavy areas (like the diary editor) should be centered with wide gutters to prevent line lengths from becoming too long for comfortable reading.
- **Rhythm:** Use a base-8 increment system. Generous padding within cards and containers is required to ensure that even with multiple input fields, the interface never feels "dense" or overwhelming.

## Elevation & Depth

Depth is conveyed through **Tonal Layers** and **Ambient Shadows**. 
- **Surface Strategy:** The main background is the lowest layer. Content rests on white "cards" or "sheets."
- **Shadows:** Use extremely soft, diffused shadows with a slight tint of the primary color (Sage) to make elements feel like they are gently resting on the surface rather than floating high above it. 
- **Interaction:** On hover or tap, shadows should slightly deepen or the element should subtly scale, providing a tactile, "squishy" response that feels organic and non-mechanical.
- **Glassmorphism:** Use subtle backdrop blurs for sticky headers or navigation bars to maintain a sense of context and depth without breaking the clean aesthetic.

## Shapes

The shape language is defined by **Rounded** geometry to avoid the "sharpness" of traditional productivity apps.
- **Buttons and Inputs:** Use a 0.5rem (8px) radius for a soft, approachable feel.
- **Cards and Containers:** Use a 1.5rem (24px) radius for large surface areas to mimic the rounded corners of a physical notebook.
- **Icons:** Icons should feature rounded caps and corners to match the UI's softness.

## Components

- **Buttons:** Primary buttons use a solid Sage Green fill with white text. Secondary buttons use a Soft Blue tint with 10% opacity and Blue text.
- **Input Fields:** Inputs should have a subtle warm neutral background (`#F9F8F6`) rather than a hard border. On focus, they transition to a thin Sage Green outline.
- **Journaling Cards:** Large, white containers with soft shadows. They should feature plenty of internal padding (min 32px) to frame the Newsreader serif text beautifully.
- **Habit Chips:** Small, pill-shaped indicators. When "done," they fill with a soft Sage Green. When "pending," they use a dashed stroke and no fill.
- **Mood Selector:** A horizontal scroll of soft-colored circles or custom organic shapes representing different emotional states.
- **Progress Indicators:** Use soft, thick-stroke circular loaders or linear bars with rounded ends in Sage Green to track habit streaks and completion.
