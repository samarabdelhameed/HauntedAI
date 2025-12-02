# HauntedAI Frontend - Quick Start Guide

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd apps/web
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` if needed (default values should work):
```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_APP_NAME=HauntedAI
VITE_ENABLE_SOUNDS=true
```

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 4. Install MetaMask

If you don't have MetaMask:
1. Go to https://metamask.io
2. Install the browser extension
3. Create a wallet or import existing one

### 5. Connect Wallet

1. Click "Connect Wallet" on the landing page
2. Approve MetaMask connection
3. Sign the authentication message
4. You're in! 🎉

## 📱 Features to Test

### Landing Page (/)
- ✅ Animated background with particles
- ✅ Floating ghosts
- ✅ Connect Wallet button
- ✅ Navigation buttons

### Dashboard (/dashboard)
- ✅ Agent status cards
- ✅ Recent rooms list
- ✅ Token balance
- ✅ Create new session

### Live Room (/room/:id)
- ✅ Real-time logs via SSE
- ✅ Start workflow button
- ✅ Asset preview
- ✅ CID copy functionality

### Explore (/explore)
- ✅ Browse all assets
- ✅ Filter by type
- ✅ Search functionality
- ✅ Asset details modal

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### MetaMask Not Detected

1. Make sure MetaMask extension is installed
2. Refresh the page
3. Check browser console for errors

### API Connection Failed

Make sure the backend is running:
```bash
cd apps/api
npm run start:dev
```

### SSE Not Working

1. Check backend is running
2. Check CORS is enabled
3. Check browser console for errors

## 🎨 UI Components

### Buttons
- Primary: Orange glow (#FF6B00)
- Accent: Red glow (#FF0040)
- Glass: Transparent with blur

### Colors
- Background: #0B0B0B
- Primary: #FF6B00
- Accent: #FF0040
- Text: #E5E5E5

### Fonts
- Body: Inter
- Headings: Creepster (spooky font)

## 🔊 Sound Effects

Sounds play on:
- Hover: Subtle whisper
- Click: Ghost sound
- Success: Success chime
- Error: Thunder sound

Toggle sounds: Click sound icon (if implemented)

## 📝 Development Tips

### Hot Reload

Vite provides instant hot reload. Just save your files and see changes immediately.

### TypeScript

The project uses TypeScript. Check types with:
```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

### Building

```bash
npm run build
```

Output will be in `dist/` folder.

## 🐛 Common Issues

### Issue: White screen on load

**Solution**: Check browser console for errors. Usually missing environment variables.

### Issue: Wallet connection fails

**Solution**: 
1. Make sure MetaMask is unlocked
2. Check you're on the correct network
3. Try refreshing the page

### Issue: API requests fail

**Solution**:
1. Check backend is running
2. Check API URL in `.env`
3. Check CORS settings in backend

### Issue: SSE connection drops

**Solution**:
1. Check network tab in browser dev tools
2. Verify backend SSE endpoint is working
3. Check for proxy/firewall issues

## 📚 Next Steps

1. ✅ Test all pages and features
2. ✅ Create a room and start workflow
3. ✅ Watch real-time logs
4. ✅ Explore generated assets
5. ✅ Check token balance

## 🎯 Testing Checklist

- [ ] Landing page loads
- [ ] Connect wallet works
- [ ] Dashboard shows data
- [ ] Can create new room
- [ ] Live room shows logs
- [ ] Can start workflow
- [ ] Explore page shows assets
- [ ] Can filter and search
- [ ] Sounds play correctly
- [ ] Animations work smoothly

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

## 📞 Need Help?

- Check the main README.md
- Check backend API documentation
- Check browser console for errors
- Check network tab for API calls

---

**Managed by Kiro** | HauntedAI Platform
