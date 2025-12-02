# 🚀 Get FREE Groq API Key (5 Minutes!)

## Why Groq?
- ✅ **100% FREE** - No credit card required
- ✅ **Super Fast** - 500+ tokens/second
- ✅ **14,400 requests/day** - More than enough
- ✅ **Better than HuggingFace** - More reliable

## Steps:

### 1. Visit Groq Console
Go to: **https://console.groq.com**

### 2. Sign Up (FREE)
- Click "Sign Up" 
- Use your email or GitHub
- **No credit card needed!**

### 3. Create API Key
1. Once logged in, go to: **https://console.groq.com/keys**
2. Click "Create API Key"
3. Name it: "HauntedAI"
4. Copy the key (starts with `gsk_`)

### 4. Add to Project
```bash
cd apps/agents/story-agent
echo "GROQ_API_KEY=your_key_here" >> .env
```

## Test It:
```bash
curl https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-8b-instant",
    "messages": [{"role": "user", "content": "Say hello"}]
  }'
```

## Available Models:
- `llama-3.1-8b-instant` ⚡ **Fastest** (recommended)
- `llama-3.1-70b-versatile` 🎯 **Best quality**
- `mixtral-8x7b-32768` 📚 **Long context**

---

**Once you have the key, restart StoryAgent and test!**

```bash
GROQ_API_KEY=your_key npm run dev
```
