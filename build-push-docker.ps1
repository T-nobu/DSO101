#!/usr/bin/env powershell
# Docker Build and Push Script
# Builds and pushes both backend and frontend images to Docker Hub

param(
    [ValidateSet("build", "push", "buildpush", "all")]
    [string]$Action = "buildpush"
)

$DOCKER_USERNAME = "tnobu"
$BACKEND_IMAGE = "$DOCKER_USERNAME/app-backend:latest"
$FRONTEND_IMAGE = "$DOCKER_USERNAME/app-frontend:latest"

function Build-Images {
    Write-Host "=== Building Docker Images ===" -ForegroundColor Cyan
    
    # Build Backend
    Write-Host "`nBuilding backend image..." -ForegroundColor Yellow
    Push-Location backend
    npm run docker:build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Backend build failed!" -ForegroundColor Red
        Pop-Location
        return $false
    }
    Pop-Location
    
    # Build Frontend
    Write-Host "`nBuilding frontend image..." -ForegroundColor Yellow
    Push-Location frontend
    npm run docker:build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Frontend build failed!" -ForegroundColor Red
        Pop-Location
        return $false
    }
    Pop-Location
    
    Write-Host "`n✓ All images built successfully!" -ForegroundColor Green
    return $true
}

function Push-Images {
    Write-Host "`n=== Pushing Docker Images to Hub ===" -ForegroundColor Cyan
    
    # Push Backend
    Write-Host "`nPushing backend image..." -ForegroundColor Yellow
    Push-Location backend
    npm run docker:push
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Backend push failed!" -ForegroundColor Red
        Pop-Location
        return $false
    }
    Pop-Location
    
    # Push Frontend
    Write-Host "`nPushing frontend image..." -ForegroundColor Yellow
    Push-Location frontend
    npm run docker:push
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Frontend push failed!" -ForegroundColor Red
        Pop-Location
        return $false
    }
    Pop-Location
    
    Write-Host "`n✓ All images pushed successfully!" -ForegroundColor Green
    return $true
}

function List-Images {
    Write-Host "`n=== Local Docker Images ===" -ForegroundColor Cyan
    docker images | grep tnobu/app-
    Write-Host "`nTo view on Docker Hub, visit: https://hub.docker.com/u/tnobu" -ForegroundColor Blue
}

# Main logic
switch ($Action) {
    "build" {
        Build-Images
    }
    "push" {
        Push-Images
    }
    "buildpush" {
        if (Build-Images) {
            Push-Images
        }
    }
    "all" {
        if (Build-Images) {
            Push-Images
            List-Images
        }
    }
}
