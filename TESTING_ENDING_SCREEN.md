# Testing the Ending Screen Feature

## Quick Test (No Setup Required)

### Option 1: HTML Demo
Open `test-ending-screen.html` in your browser:

```bash
# macOS
open test-ending-screen.html

# Linux
xdg-open test-ending-screen.html

# Windows
start test-ending-screen.html
```

**Features to test:**
- ✅ Animated particles floating
- ✅ Stats grid with completion checkmarks
- ✅ Play Game button
- ✅ Share button (copies to clipboard)
- ✅ Language toggle (English ↔ Arabic)
- ✅ Smooth animations
- ✅ Responsive design

### Option 2: SVG Preview
Open `ending-screen-preview.svg` in your browser to see a static preview.

## Full Integration Test

### Prerequisites
1. HauntedAI platform running locally
2. User account created
3. Wallet connected (optional)

### Test Steps

#### 1. Start the Development Server
```bash
# Terminal 1: Start API
cd apps/api
npm run start:dev

# Terminal 2: Start Web
cd apps/web
npm run dev

# Terminal 3: Start Agents (optional)
./start-dev.sh
```

#### 2. Create a New Room
1. Navigate to `http://localhost:3000`
2. Click "Connect Wallet" or "Enter as Guest"
3. Go to Dashboard
4. Click "New Session"
5. Enter a haunted idea: "A mysterious castle with ghosts"
6. Click "Summon Agents"

#### 3. Start the Workflow
1. You'll be redirected to the Live Room
2. Click "Start Workflow" button
3. Watch the logs as agents work
4. Wait for all agents to complete (Story → Asset → Code → Deploy)

#### 4. Observe the Ending Screen
After 2 seconds of completion:
- 🎉 Ending screen should appear automatically
- 🔊 Success sound should play
- ✨ Particles should be floating
- 📊 Stats should show all checkmarks
- 🎮 Play Game button should be visible

#### 5. Test Interactions

**Play Game Button:**
- Click the button
- Game should open in new window/tab
- If deployed to Vercel, should open Vercel URL
- If not deployed, should open local game code

**Share Button:**
- Click the button
- On mobile: Native share sheet should appear
- On desktop: Link should be copied to clipboard
- Alert should confirm the action

**View Details:**
- Click "View Details"
- Ending screen should close
- Should return to normal room view
- Assets should be visible in sidebar

**Back to Dashboard:**
- Click "Back to Dashboard"
- Should navigate to dashboard
- Room should be in "done" status

#### 6. Test Language Support

**English:**
- Default language
- All text should be in English
- LTR (Left-to-Right) layout

**Arabic:**
- Change browser language to Arabic
- Or modify i18n settings
- All text should be in Arabic
- RTL (Right-to-Left) layout should work

## Automated Testing

### Unit Tests (TODO)
```bash
cd apps/web
npm test -- LiveRoom.test.tsx
```

### Integration Tests (TODO)
```bash
npm run test:e2e -- ending-screen.spec.ts
```

### Property-Based Tests (TODO)
```bash
npm test -- LiveRoom.property.test.ts
```

## Manual Testing Checklist

### Visual Tests
- [ ] Ending screen appears after workflow completion
- [ ] Particles are animated and floating
- [ ] Stats grid displays correctly
- [ ] All 4 stats show checkmarks
- [ ] Buttons are properly styled
- [ ] Orange glow effect is visible
- [ ] Glass morphism effect works
- [ ] Animations are smooth (60 FPS)
- [ ] No visual glitches or artifacts

### Functional Tests
- [ ] Screen appears 2 seconds after completion
- [ ] Success sound plays on appearance
- [ ] Play Game button works with Vercel URL
- [ ] Play Game button works with local code
- [ ] Share button uses native API (mobile)
- [ ] Share button copies to clipboard (desktop)
- [ ] View Details closes the screen
- [ ] Back to Dashboard navigates correctly
- [ ] Click sounds play on buttons
- [ ] Screen can be closed and reopened

### Responsive Tests
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)
- [ ] Buttons stack on small screens
- [ ] Text is readable on all sizes
- [ ] Particles don't overflow screen

### Browser Tests
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

### Language Tests
- [ ] English translations display correctly
- [ ] Arabic translations display correctly
- [ ] RTL layout works in Arabic
- [ ] LTR layout works in English
- [ ] Language toggle works (in demo)
- [ ] No text overflow in either language

### Performance Tests
- [ ] Screen appears within 2 seconds
- [ ] Animations run at 60 FPS
- [ ] No lag when clicking buttons
- [ ] Memory usage is reasonable (<1MB)
- [ ] No memory leaks after closing
- [ ] Works on low-end devices

### Accessibility Tests
- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Screen reader announces content
- [ ] High contrast mode works
- [ ] Reduced motion is respected
- [ ] Color contrast meets WCAG AA

### Edge Cases
- [ ] Works when only some assets are generated
- [ ] Works when deploy fails but code exists
- [ ] Works when story is very long
- [ ] Works when CIDs are invalid
- [ ] Works with slow network
- [ ] Works when sound is disabled
- [ ] Works when animations are disabled

## Debugging

### Screen Doesn't Appear

**Check:**
1. Room status is 'done'
2. Assets array has items
3. No JavaScript errors in console
4. `showEndingScreen` state is true

**Debug:**
```javascript
// In browser console
console.log('Room:', room);
console.log('Status:', room?.status);
console.log('Assets:', room?.assets);
console.log('Show ending:', showEndingScreen);
```

### Animations Are Laggy

**Check:**
1. GPU acceleration is enabled
2. No other heavy processes running
3. Browser is up to date
4. Hardware acceleration is on

**Fix:**
```css
/* Add to component if needed */
.modal {
  will-change: transform;
  transform: translateZ(0);
}
```

### Sound Doesn't Play

**Check:**
1. Browser allows autoplay
2. Sound files are loaded
3. Volume is not muted
4. User has interacted with page

**Debug:**
```javascript
// In browser console
soundManager.play('success');
```

### Share Button Doesn't Work

**Check:**
1. HTTPS is enabled (required for share API)
2. Browser supports navigator.share
3. Clipboard API is available
4. Permissions are granted

**Fallback:**
```javascript
// Manual copy
const text = "Your share text";
navigator.clipboard.writeText(text);
```

## Performance Profiling

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Trigger ending screen
5. Stop recording
6. Analyze:
   - Frame rate should be 60 FPS
   - No long tasks (>50ms)
   - Memory usage stable

### React DevTools
1. Install React DevTools extension
2. Open Profiler tab
3. Start profiling
4. Trigger ending screen
5. Stop profiling
6. Check:
   - Component render time
   - Re-render count
   - Props changes

## Common Issues

### Issue: Screen appears too early
**Solution:** Increase delay in `setTimeout` (currently 2000ms)

### Issue: Particles don't animate
**Solution:** Check CSS animations are enabled, GPU acceleration is on

### Issue: Buttons don't respond
**Solution:** Check z-index, pointer-events, and event handlers

### Issue: Text is cut off
**Solution:** Adjust padding, font-size, or container width

### Issue: RTL layout broken
**Solution:** Check `dir="rtl"` attribute and CSS direction property

## Reporting Issues

When reporting issues, include:
1. **Browser**: Name and version
2. **OS**: Operating system and version
3. **Screen size**: Resolution and device type
4. **Steps to reproduce**: Detailed steps
5. **Expected behavior**: What should happen
6. **Actual behavior**: What actually happens
7. **Screenshots**: Visual evidence
8. **Console logs**: Any errors or warnings
9. **Network logs**: API responses if relevant

## Success Criteria

The ending screen feature is working correctly when:
- ✅ Appears automatically after workflow completion
- ✅ All animations are smooth and performant
- ✅ All buttons work as expected
- ✅ Supports both English and Arabic
- ✅ Works on all major browsers
- ✅ Works on all device sizes
- ✅ Accessible to all users
- ✅ No console errors or warnings
- ✅ Sound effects play correctly
- ✅ User can easily share or play game

---

**Happy Testing!** 🎃👻

For questions or issues, contact the development team or check the documentation:
- [Technical Docs](./ENDING_SCREEN_FEATURE.md)
- [Arabic Guide](./ENDING_SCREEN_AR.md)
- [Changelog](./CHANGELOG_ENDING_SCREEN.md)
