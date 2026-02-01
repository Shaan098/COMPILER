# Quick Deployment Script for Vercel
# Run this from PowerShell in the COMPILER directory

Write-Host "🚀 Online Compiler - Quick Deploy to Vercel" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path ".\client")) {
    Write-Host "❌ Error: client directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the COMPILER directory" -ForegroundColor Yellow
    exit 1
}

# Step 1: Commit changes
Write-Host "📦 Step 1/4: Committing changes to Git..." -ForegroundColor Green
git add .
git commit -m "Prepare for deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin main

# Step 2: Check if Vercel CLI is installed
Write-Host "`n🔍 Step 2/4: Checking Vercel CLI..." -ForegroundColor Green
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "Installing Vercel CLI globally..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
        exit 1
    }
}

# Step 3: Login to Vercel
Write-Host "`n🔐 Step 3/4: Vercel Login..." -ForegroundColor Green
Write-Host "A browser window will open for authentication" -ForegroundColor Yellow
vercel login

# Step 4: Deploy
Write-Host "`n🚀 Step 4/4: Deploying to Vercel..." -ForegroundColor Green
cd client
vercel --prod

Write-Host "`n✅ Deployment initiated!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Copy your Vercel URL from the output above" -ForegroundColor White
Write-Host "2. Set VITE_API_URL in Vercel dashboard to your Render backend URL" -ForegroundColor White
Write-Host "3. Update FRONTEND_URL in Render with your Vercel URL" -ForegroundColor White
Write-Host "`n📖 See deployment_guide.md for detailed instructions" -ForegroundColor Yellow
