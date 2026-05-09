i---
name: Velvet Audio
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d0c2d5'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#998d9e'
  outline-variant: '#4d4353'
  surface-tint: '#e0b6ff'
  primary: '#e0b6ff'
  on-primary: '#4c007d'
  primary-container: '#9d4edd'
  on-primary-container: '#fffdff'
  inverse-primary: '#8433c4'
  secondary: '#c8c6c5'
  on-secondary: '#303030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#c8c6c5'
  on-tertiary: '#313030'
  tertiary-container: '#767575'
  on-tertiary-container: '#fbfeff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f2daff'
  primary-fixed-dim: '#e0b6ff'
  on-primary-fixed: '#2e004e'
  on-primary-fixed-variant: '#6a0baa'
  secondary-fixed: '#e4e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  h1:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
  metadata:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 24px
  gutter: 16px
  sidebar-width: 280px
  player-height: 96px
---

## Brand & Style

The design system is engineered for a premium, immersive audio management experience. It targets power users and enthusiasts who value a focused, low-distraction environment. The brand personality is "Sophisticated, Electric, and Cinematic."

The visual style leverages **Minimalism** with subtle **Glassmorphism** accents. It relies on deep blacks and charcoal tones to make the content—specifically podcast cover art—the centerpiece. A vibrant purple accent provides a sense of energy and modern tech-forwardness. The aesthetic avoids harsh lines, opting for soft transitions and depth created through tonal layering rather than heavy shadows.

## Colors

The palette is strictly dark-mode, utilizing high-end neutrals to create a sense of infinite depth. 

- **Background (#121212):** The base canvas for the entire application.
- **Surface (#181818):** Used for persistent structural elements like the sidebar and the bottom playback bar.
- **Surface-Elevated (#282828):** Used for interactive cards, hover states, and modal backgrounds.
- **Electric Purple (#9D4EDD):** The high-contrast accent color reserved for primary actions, progress bars, and active states.
- **Text:** High-contrast white for primary headers; muted slate-grey (#B3B3B3) for secondary metadata and descriptions.

## Typography

This design system uses **Inter** for its exceptional legibility and neutral, modern character. 

Hierarchy is established through weight and color rather than drastic size changes. Headings should be tight and bold to feel authoritative. Metadata (durations, dates, episode numbers) uses the `metadata` or `label-caps` styles to provide clear information architecture without competing with episode titles. All text is set with anti-aliasing for a smooth, high-fidelity look on dark backgrounds.

## Layout & Spacing

The layout follows a **Fluid Grid** model with fixed structural containers. 

- **Sidebar:** A persistent 280px left-hand column for navigation and library management.
- **Main View:** A fluid area that uses a 12-column grid for episode listings and show overviews.
- **Playback Bar:** A persistent bottom-docked container (96px height) that spans the full width of the viewport.

Spacing follows an 8px base unit. Card layouts should utilize 16px gutters to maintain a clean, airy feel despite the dark palette.

## Elevation & Depth

Depth is achieved through **Tonal Layers** and **Subtle Outlines**. 

1. **Floor:** The main background (#121212).
2. **Elevated:** Sidebars and players (#181818).
3. **Floating:** Cards and popovers (#282828).

To add a premium touch, interactive cards should feature a very thin (1px) border with a low-opacity white (approx 5-10%) to define their edges against the dark background. Subtle gradients (dark-to-slightly-less-dark) can be applied to cards to give them a convex, tactile feel.

## Shapes

The design system utilizes a **Rounded** shape language to evoke a friendly yet professional feel. 

- **Standard Elements:** 8px (0.5rem) radius for buttons and input fields.
- **Cards:** 16px (1rem) radius for episode and show cards to soften the overall grid.
- **Images:** Cover art should always match the card radius (16px) or be fully circular for profile/artist icons.
- **Interactive States:** Hovering over list items should trigger a background pill-shape highlight with an 8px radius.

## Components

### Buttons
- **Primary:** Solid #9D4EDD background with white text. Rounded (8px) or Pill-shaped.
- **Secondary:** Ghost style with a 1px white or purple border.
- **Icon Buttons:** No background, thin stroke icons (1.5px weight), transitioning to a subtle white-transparency circle on hover.

### Episode Cards
- Feature a prominent "Play" button that appears only on hover.
- Use a vertical layout for grids and horizontal layout for search results.
- Include a "Time Remaining" progress bar at the bottom of the card using the accent color.

### Sidebar & Navigation
- Active links should be indicated by a high-contrast white text and a 4px vertical purple "indicator" on the far left.
- Icons should be thin-line style (e.g., Lucide or Feather) to maintain a modern, lightweight look.

### Playback Bar
- Centered play/pause controls. 
- The progress bar should be a thin 4px line that expands to 6px on hover, with a #9D4EDD fill and a semi-transparent white track.
- Volume and device controls tucked to the right.

### Input Fields
- Darker-than-surface background (#121212) with a subtle 1px border (#282828).
- Focus state triggers a #9D4EDD border glow.