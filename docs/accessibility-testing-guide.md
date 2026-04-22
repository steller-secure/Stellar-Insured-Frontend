# Accessibility Testing Guide

**Last Updated:** April 22, 2026  
**Version:** 1.0

---

## Overview

This guide provides step-by-step instructions for testing the accessibility of the Stellar Insured Frontend application. It covers keyboard-only testing, screen reader testing, and automated tools.

---

## Table of Contents

1. [Keyboard-Only Testing](#1-keyboard-only-testing)
2. [Screen Reader Testing](#2-screen-reader-testing)
3. [Browser Developer Tools](#3-browser-developer-tools)
4. [Automated Testing Tools](#4-automated-testing-tools)
5. [Manual Testing Checklist](#5-manual-testing-checklist)
6. [Common Issues & Solutions](#6-common-issues--solutions)

---

## 1. Keyboard-Only Testing

### Why Test with Keyboard?

Many users with motor disabilities or visual impairments rely solely on keyboard navigation. Testing ensures all functionality is accessible without a mouse.

### How to Test

#### Basic Keyboard Navigation

1. **Disconnect your mouse** or commit to not using it
2. **Press `Tab`** to move forward through interactive elements
3. **Press `Shift + Tab`** to move backward
4. **Press `Enter` or `Space`** to activate buttons and links
5. **Press `Escape`** to close modals and dropdowns
6. **Use `Arrow Keys`** to navigate within components (dropdowns, radio groups)

#### What to Check

- [ ] Can you reach all interactive elements?
- [ ] Is the focus order logical?
- [ ] Is the focus indicator visible at all times?
- [ ] Can you operate all dropdowns and menus?
- [ ] Can you close all modals with Escape?
- [ ] Are there any keyboard traps (can't exit a component)?

### Component-Specific Keyboard Tests

#### Navigation Bar
```
1. Tab to menu button (mobile view)
2. Press Enter to open menu
3. Use Arrow keys to navigate links
4. Press Escape to close menu
5. Verify focus returns to menu button
```

#### Filter Dropdown
```
1. Tab to dropdown button
2. Press Enter or Space to open
3. Use Arrow Down to move through options
4. Use Arrow Up to move backward
5. Press Enter to select an option
6. Press Escape to close without selecting
```

#### File Upload
```
1. Tab to upload zone
2. Press Enter or Space to open file picker
3. Verify keyboard users can upload files
```

#### Modal Dialog
```
1. Open modal with button
2. Verify focus moves to modal
3. Tab through modal content
4. Verify focus is trapped inside modal
5. Press Escape to close
6. Verify focus returns to trigger button
```

### Quick Keyboard Test Command

```javascript
// Open browser console and paste:
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    console.log('Focus:', document.activeElement);
  }
});
```

---

## 2. Screen Reader Testing

### VoiceOver (macOS)

#### Enable VoiceOver

1. Press `Command + F5` to toggle VoiceOver
2. Or go to: System Preferences → Accessibility → VoiceOver → Enable VoiceOver

#### Basic VoiceOver Commands

| Action | Command |
|--------|---------|
| Start/Stop | `Command + F5` |
| Read from top | `Control + Option + A` |
| Read current item | `Control + Option + Left Arrow` |
| Next item | `Control + Option + Right Arrow` |
| Previous item | `Control + Option + Left Arrow` |
| Activate item | `Control + Option + Space` |
| Stop speaking | `Control` |

#### Testing Steps

1. **Enable VoiceOver**
2. **Navigate to homepage**
3. **Use `Control + Option + Right Arrow`** to move through elements
4. **Listen for:**
   - Are all images announced with descriptions?
   - Are buttons clearly labeled?
   - Are form fields associated with labels?
   - Are errors announced when they occur?
   - Is the navigation structure clear?

5. **Test a form:**
   - Navigate to Claim Form
   - Try to fill out the form using only VoiceOver
   - Submit with errors
   - Verify errors are announced

#### Common VoiceOver Gestures

- **Rotor:** `Control + Option + U` (opens navigation menu)
- **Heading Navigation:** `Control + Option + Command + H`
- **Landmark Navigation:** `Control + Option + Command + M`

---

### NVDA (Windows) - Free

#### Install NVDA

1. Download from: https://www.nvaccess.org/download/
2. Install and launch NVDA
3. Press `Insert + Q` to quit NVDA

#### Basic NVDA Commands

| Action | Command |
|--------|---------|
| Start/Stop | `Insert + Q` (quit), launch to start |
| Read current line | `Up Arrow` |
| Read current word | `Control + Left Arrow` |
| Read current character | `Left Arrow` |
| Next item | `Down Arrow` |
| Previous item | `Up Arrow` |
| Activate item | `Enter` |
| Toggle speech | `Control` |

#### NVDA Testing Steps

1. **Launch NVDA**
2. **Navigate through the application**
3. **Check:**
   - Are all interactive elements announced?
   - Are ARIA labels read correctly?
   - Are live regions announced (notifications, errors)?
   - Is the page structure clear?

---

### JAWS (Windows) - Commercial

#### Note

JAWS is the most popular screen reader in enterprise environments. If your target audience includes enterprise users, test with JAWS.

#### Basic JAWS Commands

| Action | Command |
|--------|---------|
| Start/Stop | `Insert + J` (toggle) |
| Read all | `Insert + Down Arrow` (twice) |
| Next item | `Down Arrow` |
| Previous item | `Up Arrow` |
| Read current | `Insert + Tab` |

---

## 3. Browser Developer Tools

### Chrome DevTools Accessibility Panel

#### How to Access

1. Open Chrome DevTools (`F12` or `Command + Option + I`)
2. Go to **Elements** tab
3. Click on an element
4. Look at the **Accessibility** section in the right panel

#### What to Check

- **Name:** Is the accessible name correct?
- **Role:** Is the ARIA role correct?
- **Value:** Is the current value announced?
- **Description:** Is there a helpful description?
- **Keyboard:** Is the element keyboard accessible?

### Lighthouse Accessibility Audit

#### Run Lighthouse

1. Open Chrome DevTools
2. Go to **Lighthouse** tab
3. Check only **Accessibility**
4. Click **Analyze page load**
5. Review the report

#### Common Lighthouse Checks

- [ ] Buttons have an accessible name
- [ ] Image elements have `[alt]` attributes
- [ ] Form elements have associated labels
- [ ] Links have discernible names
- [ ] `[aria-*]` attributes match their roles
- [ ] Elements use only valid ARIA attributes
- [ ] ARIA input fields have accessible names

### axe DevTools Extension

#### Install

1. Chrome Web Store: Search for "axe DevTools"
2. Install the extension
3. Pin it to your toolbar

#### Use axe DevTools

1. Navigate to any page
2. Click the axe icon
3. Click **Scan All of My Page**
4. Review violations, passes, and incomplete tests

#### Fix Violations

Each violation includes:
- **Description** of the issue
- **WCAG criterion** it violates
- **How to fix** it
- **Code snippet** showing the issue

---

## 4. Automated Testing Tools

### jest-axe (Recommended)

#### Install

```bash
npm install --save-dev jest-axe @types/jest-axe
```

#### Usage

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### eslint-plugin-jsx-a11y

#### Already Included

This project already includes `eslint-plugin-jsx-a11y` as part of the ESLint configuration.

#### Common Rules

```javascript
// .eslintrc.js
{
  "extends": ["plugin:jsx-a11y/recommended"],
  "rules": {
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-role": "error",
    "jsx-a11y/role-has-required-aria-props": "error"
  }
}
```

### Run ESLint for Accessibility

```bash
npm run lint
```

---

## 5. Manual Testing Checklist

### Pre-Launch Checklist

#### General
- [ ] Page has a `<title>` element
- [ ] Language is set in `<html lang="en">`
- [ ] Skip navigation link is present
- [ ] Focus order is logical
- [ ] No keyboard traps exist

#### Images & Media
- [ ] All images have meaningful `alt` text
- [ ] Decorative images have `alt=""` or `aria-hidden="true"`
- [ ] Videos have captions
- [ ] Audio has transcripts

#### Forms
- [ ] All inputs have associated `<label>` elements
- [ ] Required fields are indicated
- [ ] Error messages are clear and helpful
- [ ] Form validation works with keyboard
- [ ] Error messages are announced to screen readers

#### Navigation
- [ ] Navigation is consistent across pages
- [ ] Current page is indicated in navigation
- [ ] Breadcrumbs are present (if applicable)
- [ ] Search functionality is accessible

#### Interactive Elements
- [ ] All buttons have accessible names
- [ ] Links are descriptive (not "click here")
- [ ] Dropdowns are keyboard accessible
- [ ] Modals trap focus correctly
- [ ] Tooltips are keyboard accessible

#### Dynamic Content
- [ ] Loading states are announced
- [ ] Error messages are announced
- [ ] Success notifications are announced
- [ ] Content updates use `aria-live` regions

#### Color & Contrast
- [ ] Text contrast ratio is at least 4.5:1
- [ ] Color is not the only indicator
- [ ] Focus indicators are visible
- [ ] Links are distinguishable from text

#### Responsive Design
- [ ] Accessible on mobile devices
- [ ] Touch targets are at least 44x44px
- [ ] Zoom to 200% doesn't break layout
- [ ] Orientation changes don't lose content

---

## 6. Common Issues & Solutions

### Issue 1: Missing Alt Text

**Problem:**
```jsx
<img src="logo.png" />
```

**Solution:**
```jsx
<img src="logo.png" alt="Stellar Insured Logo" />
```

---

### Issue 2: Form Input Without Label

**Problem:**
```jsx
<input type="text" placeholder="Enter name" />
```

**Solution:**
```jsx
<label htmlFor="name">Name</label>
<input id="name" type="text" aria-required="true" />
```

---

### Issue 3: Button Without Accessible Name

**Problem:**
```jsx
<button>
  <svg>...</svg>
</button>
```

**Solution:**
```jsx
<button aria-label="Close modal">
  <svg aria-hidden="true">...</svg>
</button>
```

---

### Issue 4: Div Used as Button

**Problem:**
```jsx
<div onClick={handleClick}>Click me</div>
```

**Solution:**
```jsx
<button onClick={handleClick} type="button">
  Click me
</button>
```

Or if styling requires div:
```jsx
<div 
  role="button" 
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

---

### Issue 5: Modal Not Trapping Focus

**Problem:** User can tab outside the modal

**Solution:**
```typescript
useEffect(() => {
  const modal = document.getElementById('modal');
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  const trapFocus = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      } else if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };
  
  modal.addEventListener('keydown', trapFocus);
  return () => modal.removeEventListener('keydown', trapFocus);
}, []);
```

---

### Issue 6: Error Not Announced

**Problem:** Error appears but screen reader doesn't announce it

**Solution:**
```jsx
<div role="alert" aria-live="polite">
  {error && <p className="error">{error.message}</p>}
</div>
```

---

## Quick Reference Card

### Essential Keyboard Shortcuts

| Action | Mac | Windows |
|--------|-----|---------|
| Tab forward | `Tab` | `Tab` |
| Tab backward | `Shift + Tab` | `Shift + Tab` |
| Activate | `Enter` or `Space` | `Enter` or `Space` |
| Close modal | `Escape` | `Escape` |
| VoiceOver on/off | `Cmd + F5` | N/A |
| NVDA on/off | N/A | `Insert + Q` |

### Essential ARIA Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `aria-label` | Accessible name | `<button aria-label="Close">` |
| `aria-labelledby` | Reference to label | `<div aria-labelledby="heading">` |
| `aria-describedby` | Reference to description | `<input aria-describedby="error">` |
| `aria-expanded` | Expanded state | `<button aria-expanded="false">` |
| `aria-hidden` | Hide from AT | `<span aria-hidden="true">` |
| `aria-live` | Live region | `<div aria-live="polite">` |
| `role` | Semantic role | `<div role="dialog">` |

---

## Reporting Accessibility Issues

When you find an accessibility issue:

1. **Document the issue:**
   - Page URL
   - Component name
   - Description of the problem
   - WCAG criterion violated
   - Screenshot (if applicable)

2. **Create a GitHub issue:**
   - Label: `accessibility`
   - Priority: Based on impact
   - Assign to: Development team

3. **Include:**
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Assistive technology used

---

## Resources

- [WebAIM](https://webaim.org/)
- [W3C WAI](https://www.w3.org/WAI/)
- [A11y Project](https://www.a11yproject.com/)
- [Deque University](https://dequeuniversity.com/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

---

**Maintained By:** Development Team  
**Review Schedule:** Quarterly  
**Last Review:** April 22, 2026
