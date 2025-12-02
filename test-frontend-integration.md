# Frontend Integration Test Guide

## 🧪 Manual Testing Checklist

### Prerequisites
- [ ] Backend API running on http://localhost:3001
- [ ] MetaMask installed and configured
- [ ] Frontend running on http://localhost:5173

## Test 1: Landing Page
**URL**: http://localhost:5173/

### Steps:
1. [ ] Page loads without errors
2. [ ] Animated background visible
3. [ ] Floating ghosts visible
4. [ ] "Connect Wallet" button visible
5. [ ] Hover over buttons plays sound
6. [ ] Click buttons plays sound

**Expected**: All animations smooth, sounds play, no console errors

---

## Test 2: Wallet Connection
**URL**: http://localhost:5173/

### Steps:
1. [ ] Click "Connect Wallet"
2. [ ] MetaMask popup appears
3. [ ] Approve connection
4. [ ] Sign authentication message
5. [ ] Redirected to dashboard

**Expected**: Successful authentication, JWT stored, redirected to /dashboard

---

## Test 3: Dashboard
**URL**: http://localhost:5173/dashboard

### Steps:
1. [ ] Dashboard loads
2. [ ] Agent cards visible (4 agents)
3. [ ] Token balance displays
4. [ ] Recent rooms list shows (or "No rooms yet")
5. [ ] Click "New Session" button
6. [ ] Modal opens

**Expected**: All data loads from API, no errors

---

## Test 4: Create Room
**URL**: http://localhost:5173/dashboard

### Steps:
1. [ ] Click "New Session"
2. [ ] Enter text: "A haunted castle with mysterious whispers"
3. [ ] Click "Summon Agents"
4. [ ] Room created successfully
5. [ ] Redirected to /room/:id

**Expected**: Room created, redirected to live room page

---

## Test 5: Live Room
**URL**: http://localhost:5173/room/:id

### Steps:
1. [ ] Room loads
2. [ ] Room ID displayed
3. [ ] Status shows "idle"
4. [ ] Input text displayed
5. [ ] "Start Workflow" button visible
6. [ ] Click "Start Workflow"
7. [ ] Status changes to "running"
8. [ ] Logs start appearing in real-time

**Expected**: SSE connection established, logs stream in real-time

---

## Test 6: Real-time Logs (SSE)
**URL**: http://localhost:5173/room/:id (after starting workflow)

### Steps:
1. [ ] Logs appear in terminal
2. [ ] Timestamps visible
3. [ ] Agent types visible (story, asset, code, deploy)
4. [ ] Log levels colored correctly (info=gray, success=green, error=red)
5. [ ] Logs auto-scroll
6. [ ] Success sounds play on success logs

**Expected**: Real-time log streaming works, auto-scroll, sounds play

---

## Test 7: Asset Display
**URL**: http://localhost:5173/room/:id (after workflow completes)

### Steps:
1. [ ] Assets appear in right panel
2. [ ] CIDs displayed
3. [ ] Agent types shown
4. [ ] File types shown
5. [ ] Click "Copy" button
6. [ ] CID copied to clipboard
7. [ ] Alert shows "CID copied!"

**Expected**: Assets display correctly, copy works

---

## Test 8: Explore Page
**URL**: http://localhost:5173/explore

### Steps:
1. [ ] Page loads
2. [ ] Assets grid displays
3. [ ] Filter dropdown works
4. [ ] Search box works
5. [ ] Click on asset card
6. [ ] Modal opens with details
7. [ ] Click "Copy CID"
8. [ ] CID copied
9. [ ] Click "View on IPFS"
10. [ ] Opens IPFS gateway in new tab

**Expected**: All explore features work, filtering and search functional

---

## Test 9: Navigation
**URL**: Any page

### Steps:
1. [ ] Click sidebar "Dashboard" → Goes to /dashboard
2. [ ] Click sidebar "Live Rooms" → Goes to /room/demo
3. [ ] Click sidebar "Explore" → Goes to /explore
4. [ ] Click sidebar "Profile" → Goes to /profile
5. [ ] All navigation smooth
6. [ ] Sounds play on clicks

**Expected**: All navigation works, no broken links

---

## Test 10: Logout
**URL**: http://localhost:5173/dashboard

### Steps:
1. [ ] Click "Logout" button
2. [ ] JWT cleared from localStorage
3. [ ] User state cleared
4. [ ] Redirected to landing page
5. [ ] "Connect Wallet" button shows again

**Expected**: Clean logout, session cleared

---

## Test 11: API Error Handling
**URL**: Any page

### Steps:
1. [ ] Stop backend API
2. [ ] Try to create room
3. [ ] Error message shows
4. [ ] Start backend API
5. [ ] Try again
6. [ ] Works correctly

**Expected**: Graceful error handling, user feedback

---

## Test 12: SSE Reconnection
**URL**: http://localhost:5173/room/:id

### Steps:
1. [ ] Start workflow
2. [ ] Logs streaming
3. [ ] Stop backend API
4. [ ] SSE connection drops
5. [ ] Start backend API
6. [ ] Refresh page
7. [ ] SSE reconnects

**Expected**: SSE handles disconnection gracefully

---

## Test 13: Responsive Design
**URL**: Any page

### Steps:
1. [ ] Resize browser window
2. [ ] Test mobile view (375px)
3. [ ] Test tablet view (768px)
4. [ ] Test desktop view (1920px)
5. [ ] All elements responsive
6. [ ] No horizontal scroll

**Expected**: Responsive on all screen sizes

---

## Test 14: Browser Compatibility
**URL**: Any page

### Browsers to test:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Expected**: Works on all modern browsers

---

## Test 15: Performance
**URL**: Any page

### Steps:
1. [ ] Open DevTools → Network tab
2. [ ] Reload page
3. [ ] Check load time < 3s
4. [ ] Check no memory leaks
5. [ ] Check smooth animations (60fps)

**Expected**: Fast load, smooth performance

---

## 🐛 Common Issues & Solutions

### Issue: MetaMask not detected
**Solution**: Install MetaMask extension, refresh page

### Issue: API connection failed
**Solution**: Check backend is running on port 3001

### Issue: SSE not working
**Solution**: Check CORS enabled in backend, check network tab

### Issue: Sounds not playing
**Solution**: Check browser allows autoplay, check console for errors

### Issue: JWT expired
**Solution**: Logout and login again

### Issue: Room not found
**Solution**: Check room ID is valid, check backend database

---

## ✅ Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ All buttons working
- ✅ All API calls successful
- ✅ Real-time logs streaming
- ✅ Smooth animations
- ✅ Sounds playing
- ✅ Responsive design
- ✅ Error handling working

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Landing Page: ✅ / ❌
Wallet Connection: ✅ / ❌
Dashboard: ✅ / ❌
Create Room: ✅ / ❌
Live Room: ✅ / ❌
Real-time Logs: ✅ / ❌
Asset Display: ✅ / ❌
Explore Page: ✅ / ❌
Navigation: ✅ / ❌
Logout: ✅ / ❌
Error Handling: ✅ / ❌
SSE Reconnection: ✅ / ❌
Responsive Design: ✅ / ❌
Browser Compatibility: ✅ / ❌
Performance: ✅ / ❌

Overall: ✅ PASS / ❌ FAIL

Notes:
_________________________________
_________________________________
_________________________________
```

---

**Managed by Kiro** | HauntedAI Platform | Frontend Integration Tests
