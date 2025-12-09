# Troubleshooting Mapbox Map Not Appearing

## Common Issues and Solutions

### 1. Environment Variable Not Loaded

**Problem**: The map doesn't appear even though the token is set in `.env.local`

**Solution**: 
- **Restart the Next.js dev server** after adding/changing `.env.local`
- Stop the server (Ctrl+C) and run `npm run dev` again
- Environment variables are only loaded when the server starts

### 2. Check Browser Console

Open your browser's developer console (F12) and check for:
- ✅ "Mapbox token found, initializing map..." - Token is loaded
- ✅ "Mapbox map loaded successfully" - Map initialized
- ❌ Any error messages about the token or map initialization

### 3. Verify Token Format

Your token should:
- Start with `pk.` (public token)
- Be set in `.env.local` as: `NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here`
- NOT start with `sk.` (secret tokens won't work)

### 4. Check Map Container

The map container should:
- Have a defined height (600px in this case)
- Be visible (not hidden by CSS)
- Not be blocked by other elements

### 5. Network Issues

- Check if Mapbox CDN is accessible
- Verify your internet connection
- Check browser console for network errors

### 6. Token Permissions

Make sure your Mapbox token has:
- `styles:read` scope
- `fonts:read` scope
- Public access enabled

## Quick Debug Steps

1. **Restart dev server**: `npm run dev`
2. **Check browser console** for errors
3. **Verify token** in `.env.local` starts with `pk.`
4. **Check network tab** for failed requests to mapbox.com
5. **Try hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

## Still Not Working?

1. Check the browser console for specific error messages
2. Verify the token is valid at https://account.mapbox.com/access-tokens/
3. Try creating a new public token
4. Make sure `.env.local` is in the project root (same level as `package.json`)

