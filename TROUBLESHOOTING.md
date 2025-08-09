# OpenAI API Connection Troubleshooting

## Current Issue: ECONNRESET Error
The app consistently gets connection reset errors when trying to reach OpenAI's API.

## Troubleshooting Steps:

### 1. Test Basic Connectivity
```bash
# Test if you can reach OpenAI at all
curl -I https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

### 2. Check DNS Resolution
```bash
# See if DNS resolves properly
nslookup api.openai.com
dig api.openai.com
```

### 3. Test with Different Tools
```bash
# Try with wget
wget --spider https://api.openai.com/v1/models

# Try with a simple curl request
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

### 4. Check System Settings

#### macOS Network Settings:
- **Firewall**: System Preferences → Security & Privacy → Firewall
- **Proxy Settings**: System Preferences → Network → Advanced → Proxies
- **DNS**: Try switching to 8.8.8.8 or 1.1.1.1

#### Potential Blockers:
- Corporate firewall/proxy
- Antivirus software blocking HTTPS requests
- VPN interfering with connections
- ISP blocking certain domains

### 5. Alternative Solutions

#### Option A: Use a different API service
- Switch to Deepgram API
- Use AssemblyAI
- Try Azure Speech Services

#### Option B: Local transcription
- Use OpenAI Whisper locally (no API needed)
- Install: `pip install openai-whisper`

#### Option C: File-based workflow
1. Record audio on your phone
2. Use online transcription services
3. Copy/paste the text into the app

## Current Workarounds That Work:
✅ **Manual typing** - Direct text input  
✅ **Load Demo** - Sample interview data  
✅ **File upload** - For pre-recorded audio (when API works)

## Next Steps to Try:
1. Restart backend server with the new alternative HTTP method
2. Test the connectivity commands above
3. Check if your network admin is blocking api.openai.com