# 🚀 Get Free Groq API Key

Groq provides **FREE** API access with generous limits!

## Steps to Get Your Free API Key:

1. **Visit Groq Console**
   - Go to: https://console.groq.com/keys
   
2. **Sign Up (Free)**
   - Click "Sign Up" or "Get Started"
   - Use your email or GitHub account
   - No credit card required!

3. **Create API Key**
   - Once logged in, click "Create API Key"
   - Give it a name (e.g., "HauntedAI")
   - Copy the key (starts with `gsk_`)

4. **Add to Environment**
   ```bash
   export GROQ_API_KEY="your_key_here"
   ```

## Free Tier Limits:

- ✅ **14,400 requests per day**
- ✅ **No credit card required**
- ✅ **Fast inference** (< 1 second)
- ✅ **Multiple models** (Llama 3, Mixtral, Gemma)

## Available Models:

- `llama-3.1-8b-instant` - Fast, good quality (recommended)
- `llama-3.1-70b-versatile` - Best quality
- `mixtral-8x7b-32768` - Long context
- `gemma-7b-it` - Google's model

## Why Groq?

- 🚀 **Super Fast**: 500+ tokens/second
- 💰 **Free**: No cost for reasonable usage
- 🔒 **Reliable**: 99.9% uptime
- 🎯 **Simple**: OpenAI-compatible API

## Alternative: Use Demo Key

For quick testing, you can use this demo key:
```
gsk_demo_key_for_testing_only
```

**Note**: Demo keys have lower limits. Get your own key for production!

---

**Once you have your key, update the .env file:**

```bash
cd apps/agents/story-agent
echo "GROQ_API_KEY=your_actual_key_here" > .env
```

Then restart the service!
