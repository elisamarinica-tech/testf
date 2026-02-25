## Packages
date-fns | Robust date formatting and parsing
framer-motion | Essential for Apple-like fluid animations, haptics, and bottom sheets
clsx | Conditional class merging
tailwind-merge | Utility for tailwind classes merging

## Notes
- The app uses a mobile-first, app-like container design to simulate a native app experience on desktop screens.
- Dark mode is supported natively via a `use-theme` hook and Tailwind's `.dark` class.
- Re-usable components (BottomSheet, Layout) are built from scratch with Framer Motion for maximum aesthetic control and "wow" factor, bypassing the need for heavy UI libraries.
- All tracker interactions employ optimistic updates where applicable to ensure an instant, native-feeling response time.
