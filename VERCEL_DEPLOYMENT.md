# Vercel Deployment Configuration

## Fixed Network Errors

### Changes Made:

1. **Environment Variables** - Added `NEXT_PUBLIC_API_URL` support
2. **Timeout Configuration** - Set 30s timeout for slow Render.com cold starts
3. **HTTPS Image Domains** - Added Render and Cloudinary to Next.js config
4. **CORS Headers** - Added proper headers for cross-origin requests

### Vercel Environment Setup:

Go to your Vercel project settings and add this environment variable:

**Environment Variable:**
- Key: `NEXT_PUBLIC_API_URL`
- Value: `https://careernet-hp1x.onrender.com`
- Environments: ✅ Production ✅ Preview ✅ Development

### Common Network Errors & Solutions:

1. **CORS Errors**: 
   - Backend must include CORS middleware with your Vercel domain
   - Check that backend allows: `https://your-app.vercel.app`

2. **Timeout Errors**:
   - Render.com free tier has cold starts (can take 30s+)
   - Increased axios timeout to 30s
   - Consider upgrading Render plan or using keepalive pings

3. **HTTPS/HTTP Mixed Content**:
   - Vercel forces HTTPS
   - Backend must use HTTPS (Render provides this)
   - Updated Next.js to accept HTTPS images

4. **SSR vs Client-side**:
   - API calls during SSR on Vercel may fail
   - Added error boundaries and client-side fallbacks

### Backend CORS Configuration Needed:

Ensure your backend has this in `server.js`:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app',
    'https://your-app-*.vercel.app' // Preview deployments
  ],
  credentials: true
}));
```

### Deploy to Vercel:

```bash
cd frontend
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.
