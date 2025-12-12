# Ionic Framework Review Rules (Quick Level)

**Version**: 2025-01-12
**Official Sources**:
- https://github.com/ionic-team/ionic-framework
- https://ionicframework.com/docs/

**Last Checked**: 2025-01-12

---

## 🔴 CRITICAL ISSUES (Must Fix)

### Component Usage
- [ ] Use Ionic components instead of native HTML where available
- [ ] Standalone Ionic components require proper imports
- [ ] All interactive elements have accessible labels (aria-label)

### Navigation
- [ ] Use Ionic navigation components (ion-tabs, ion-nav, etc.)
- [ ] Navigation uses Angular Router with Ionic configuration
- [ ] Configure router with `withPreloading(PreloadAllModules)`

### Platform-Specific Code
- [ ] Use Platform service for platform detection (not navigator.userAgent)
- [ ] Handle iOS/Android differences with Platform.is()

### Icons
- [ ] Use Ionicons with proper naming convention
- [ ] Provide fallback for custom icons

### Theming
- [ ] Use CSS variables for theming (not hardcoded colors)
- [ ] Define custom colors in theme variables with full color set (base, rgb, contrast, shade, tint)
- [ ] Support dark mode with CSS variable overrides

---

## 🟡 WARNINGS (Should Fix)

### Performance
- [ ] Use virtual scrolling (ion-virtual-scroll) for long lists (100+ items)

### Lifecycle
- [ ] Use Ionic lifecycle events (ionViewWillEnter, ionViewDidEnter, etc.) for page logic
- [ ] Don't rely only on Angular lifecycle hooks for navigation-related logic

### Gestures
- [ ] Use GestureController for swipe/drag interactions

### Capacitor Integration
- [ ] Use Capacitor plugins for native features (not Cordova)

---

## 🟢 BEST PRACTICES
- [ ] Use proper heading hierarchy in ion-content
- [ ] Use ion-skeleton-text for loading states
- [ ] Test on both iOS and Android platforms

---

## 📋 Auto-Fix Available (--fix flag)
1. Replace native HTML with Ionic components
2. Add missing Ionic component imports
3. Convert hardcoded colors to CSS variables
4. Add aria-labels to icon-only buttons

---

## 📚 References
- [Ionic Documentation](https://ionicframework.com/docs/)
- [GitHub: ionic-team/ionic-framework](https://github.com/ionic-team/ionic-framework)
- [Ionic Components](https://ionicframework.com/docs/components)
