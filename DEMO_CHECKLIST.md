# 🎬 Demo Recording Checklist

## Pre-Recording Setup

### Environment
- [ ] All API keys configured in .env
- [ ] Redis running
- [ ] Database migrated and seeded
- [ ] All dependencies installed
- [ ] Project builds successfully

### Recording Tools
- [ ] Screen recording software ready (OBS, QuickTime, etc.)
- [ ] Microphone tested and working
- [ ] Audio levels checked
- [ ] Camera positioned (if doing picture-in-picture)
- [ ] Notifications disabled (Do Not Disturb mode)
- [ ] Close unnecessary applications

### Terminal Setup
- [ ] Font size increased (16-18pt)
- [ ] High contrast theme enabled
- [ ] Window size set to 1920x1080 or 1280x720
- [ ] Clear terminal history
- [ ] Navigate to project root

### Browser Setup
- [ ] Clear browser cache and cookies
- [ ] Close unnecessary tabs
- [ ] Zoom level at 100% or 125%
- [ ] Developer tools closed (unless showing)
- [ ] Bookmark bar hidden for clean look

### VS Code Setup
- [ ] Font size increased (14-16pt)
- [ ] Minimap hidden (View → Show Minimap)
- [ ] Activity bar visible
- [ ] Explorer sidebar open
- [ ] Close unnecessary editor tabs
- [ ] Zen mode ready (Cmd+K Z)

## Recording Checklist

### Part 1: Introduction (30s)
- [ ] Show HauntedAI landing page
- [ ] Introduce yourself and project
- [ ] Mention "Built with Kiro AI IDE"

### Part 2: Kiro Integration (1m)
- [ ] Open VS Code
- [ ] Show .kiro folder structure
- [ ] Navigate: specs → steering → hooks
- [ ] Explain each component briefly

### Part 3: Spec-Driven Development (2m)
- [ ] Open requirements.md
- [ ] Scroll through acceptance criteria
- [ ] Open design.md
- [ ] Show correctness properties
- [ ] Open tasks.md
- [ ] Run: `npx kiro spec coverage haunted-ai`
- [ ] Show 100% coverage result

### Part 4: Property-Based Testing (1.5m)
- [ ] Open tokens.property.test.ts
- [ ] Highlight fc.assert with numRuns: 100
- [ ] Open testing-standards.md
- [ ] Show on-save.sh hook
- [ ] Demonstrate: Save a file → Tests run automatically

### Part 5: Live Demo (2m)
- [ ] Split screen: Terminal + Browser
- [ ] Run: `./start-dev.sh`
- [ ] Wait for all services to start
- [ ] Open browser: http://localhost:3001
- [ ] Login with MetaMask
- [ ] Create new room with horror prompt
- [ ] Show real-time SSE logs
- [ ] Wait for story generation
- [ ] Show asset generation
- [ ] Show final deployed experience
- [ ] Show blockchain rewards

### Part 6: Results & Impact (30s)
- [ ] Show metrics summary
- [ ] Highlight key achievements
- [ ] Call to action (GitHub, docs)

## Post-Recording

- [ ] Review footage for errors
- [ ] Check audio quality
- [ ] Add subtitles if needed
- [ ] Add intro/outro graphics
- [ ] Export in high quality (1080p minimum)
- [ ] Upload to platform
- [ ] Share with team for feedback

## Emergency Backup Plans

### If services don't start:
1. Check Redis: `redis-cli ping`
2. Check ports: `lsof -i :3000,3001`
3. Restart: `./start-dev.sh`

### If demo fails:
1. Have pre-recorded backup footage
2. Use screenshots as fallback
3. Explain the concept without live demo

### If time runs over:
1. Skip detailed code walkthrough
2. Focus on live demo
3. Mention documentation for details

## Time Markers (for editing)

- 0:00 - Introduction
- 0:30 - Kiro Integration Overview
- 1:30 - Spec-Driven Development
- 3:30 - Property-Based Testing
- 5:00 - Live Demo
- 7:00 - Results & Closing

---

**Good luck! 🎬🚀**
