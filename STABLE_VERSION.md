# School Flight Sync - Stable Version

**Version**: Commit `527ca60` - August 15, 2025  
**Status**: ✅ **STABLE - DO NOT MODIFY**

## 🚀 Current Features (All Working)

### ✅ **Authentication**
- Family secret phrase login ("cullinan")
- Client-side authentication (no server dependencies)
- 7-day login persistence via localStorage

### ✅ **Flight Management**
- Add/edit/remove flights for school terms
- Support for both Benenden and Wycombe Abbey
- Automatic date validation and term association
- Real-time database sync with Supabase

### ✅ **Flight Status**
- One-click flight status check
- Opens FlightAware in new tab for detailed tracking
- No API rate limiting issues
- Works for all airlines and flight numbers

### ✅ **User Experience**
- Responsive design for all devices
- Loading states and error handling
- Intuitive flight card interface
- Term-based organization of travel

### ✅ **Deployment**
- Deployed on Railway with auto-sync from GitHub
- Environment variables configured
- Stable build process

## 🏗️ **Technical Architecture**

### **Frontend**: 
- React 18 + TypeScript
- Vite build system
- Tailwind CSS + Radix UI components
- React Query for data management

### **Backend**: 
- Supabase PostgreSQL database
- Row Level Security disabled for family use
- Real-time data synchronization

### **Authentication**: 
- Client-side environment variable check
- No server-side authentication complexity
- Simple and reliable

### **Deployment**: 
- Railway platform
- Automatic deployments from GitHub main branch
- Simple railway.toml configuration

## ⚠️ **Important Notes**

### **DO NOT MODIFY**
This version is stable and working perfectly for the family's needs. Any changes risk breaking the deployment or functionality.

### **Environment Variables Required**
```
VITE_SUPABASE_URL=https://kwxbjjradsvtaguwdhag.supabase.co
VITE_SUPABASE_ANON_KEY=[anon key from Supabase]
VITE_FAMILY_SECRET=cullinan
```

### **Family Usage**
- Visit the deployed URL
- Login with "cullinan"
- Manage school flights for both children
- Click flight cards to check status via FlightAware

## 📞 **Support**

If any issues arise:
1. Check Railway deployment logs
2. Verify environment variables are set
3. Confirm Supabase database is accessible
4. For major issues, revert to this exact commit: `527ca60`

---

**Last Updated**: August 15, 2025  
**Commit**: `527ca60` - Replace API calls with FlightAware redirect for flight status