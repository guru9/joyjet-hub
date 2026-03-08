/**
 * JOYJET DESIGN SYSTEM
 * Central theme tokens — import these instead of hardcoding hex values.
 */

export const COLORS = {
  // Backgrounds
  bg:        '#0F172A',   // Primary screen background (OLED-safe dark navy)
  surface:   '#1E293B',   // Card / panel surface
  elevated:  '#0B0F19',   // Modals, overlays — deepest layer
  border:    '#334155',   // Default border
  borderFaint:'#1E293B',  // Subtle inner border

  // Brand / Signal colors (Traffic Light System)
  cyan:    '#38BDF8',   // Primary accent — links, active tabs, icons
  green:   '#10B981',   // ACTIVE / SUCCESS / ONLINE
  amber:   '#F59E0B',   // PAUSED / WARNING
  red:     '#EF4444',   // OFFLINE / DANGER / BURN

  // Text
  textPrimary:   '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted:     '#64748B',
};

export const FONT = {
  mono: 'monospace', // terminal/hacker typeface
};

export const RADIUS = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  pill: 100,
};

export const SHADOW = {
  cyan: { shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  red:  { shadowColor: '#EF4444', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12 },
  card: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
};
