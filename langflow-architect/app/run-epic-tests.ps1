#!/usr/bin/env pwsh

<#
.SYNOPSIS
Epic 6.4.3 Testing Quick Start Script

.DESCRIPTION
Automated test runner for Epic 6.4.3 Advanced Socratic Questioning System
Runs both automated Playwright tests and provides manual testing guidance

.PARAMETER TestType
Type of test to run: 'auto', 'manual', or 'both' (default: 'both')

.PARAMETER Browser
Browser to use for testing: 'chromium', 'firefox', 'webkit', or 'all' (default: 'chromium')

.PARAMETER UI
Whether to run tests in UI mode (default: false)

.EXAMPLE
.\run-epic-tests.ps1
Runs both automated and manual testing

.EXAMPLE
.\run-epic-tests.ps1 -TestType auto -Browser all
Runs automated tests on all browsers

.EXAMPLE
.\run-epic-tests.ps1 -TestType auto -UI
Runs automated tests in interactive UI mode
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('auto', 'manual', 'both')]
    [string]$TestType = 'both',
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('chromium', 'firefox', 'webkit', 'all')]
    [string]$Browser = 'chromium',
    
    [Parameter(Mandatory=$false)]
    [switch]$UI
)

# Color functions for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Info { Write-Host $args -ForegroundColor Cyan }

Write-Host "🎯 Epic 6.4.3 Testing Suite" -ForegroundColor Magenta
Write-Host "=============================" -ForegroundColor Magenta
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "❌ Error: package.json not found. Please run this script from the app directory."
    Write-Info "Expected location: a:\langflow\langflow-architect\app\"
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Warning "⚠️  node_modules not found. Running npm install..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "❌ npm install failed"
        exit 1
    }
}

# Function to check if dev server is running
function Test-DevServer {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

# Function to start dev server
function Start-DevServer {
    Write-Info "🚀 Starting development server..."
    
    if (Test-DevServer) {
        Write-Success "✅ Development server already running at http://localhost:3000"
        return
    }
    
    # Start dev server in background
    $devJob = Start-Job -ScriptBlock { 
        Set-Location $using:PWD
        npm run dev 2>&1
    }
    
    Write-Info "⏳ Waiting for development server to start..."
    
    # Wait up to 60 seconds for server to start
    $timeout = 60
    $elapsed = 0
    while ($elapsed -lt $timeout) {
        Start-Sleep -Seconds 2
        $elapsed += 2
        
        if (Test-DevServer) {
            Write-Success "✅ Development server ready at http://localhost:3000"
            return $devJob
        }
        
        Write-Host "." -NoNewline
    }
    
    Write-Error "❌ Development server failed to start within $timeout seconds"
    Stop-Job $devJob -ErrorAction SilentlyContinue
    Remove-Job $devJob -ErrorAction SilentlyContinue
    exit 1
}

# Function to run automated tests
function Invoke-AutomatedTests {
    Write-Info "🤖 Running Automated E2E Tests..."
    Write-Host ""
    
    $testCommand = "npx playwright test tests/epic-6-4-3-e2e.spec.ts"
    
    if ($Browser -ne "all") {
        $testCommand += " --project=$Browser"
    }
    
    if ($UI) {
        $testCommand += " --ui"
        Write-Info "🖥️  Opening Playwright UI..."
    }
    
    Write-Info "Command: $testCommand"
    Write-Host ""
    
    Invoke-Expression $testCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✅ Automated tests completed successfully!"
        
        # Check for test results
        if (Test-Path "test-results") {
            Write-Info "📊 Test results available in test-results/ directory"
            
            if (Test-Path "test-results/epic-6-4-3-results.json") {
                Write-Info "📋 JSON report: test-results/epic-6-4-3-results.json"
            }
            
            if (Test-Path "playwright-report") {
                Write-Info "🌐 HTML report: playwright-report/index.html"
            }
        }
    } else {
        Write-Error "❌ Automated tests failed with exit code $LASTEXITCODE"
        
        if (Test-Path "test-results") {
            Write-Info "🔍 Check test-results/ directory for failure details"
        }
    }
    
    return $LASTEXITCODE -eq 0
}

# Function to show manual testing guide
function Show-ManualTesting {
    Write-Info "📋 Manual Testing Guide"
    Write-Host ""
    
    if (Test-Path "EPIC-6-4-3-TESTING-SCRIPT.md") {
        Write-Success "✅ Comprehensive testing script available:"
        Write-Info "📄 File: EPIC-6-4-3-TESTING-SCRIPT.md"
        Write-Host ""
        
        $choice = Read-Host "Would you like to open the testing script? (y/N)"
        if ($choice -eq "y" -or $choice -eq "Y") {
            if (Get-Command "code" -ErrorAction SilentlyContinue) {
                code "EPIC-6-4-3-TESTING-SCRIPT.md"
                Write-Info "📖 Testing script opened in VS Code"
            } else {
                Start-Process "EPIC-6-4-3-TESTING-SCRIPT.md"
                Write-Info "📖 Testing script opened in default editor"
            }
        }
        
        Write-Host ""
        Write-Info "Manual Testing Quick Reference:"
        Write-Host "1. Navigate to http://localhost:3000" -ForegroundColor White
        Write-Host "2. Locate CopilotKit chat interface" -ForegroundColor White
        Write-Host "3. Test each of the 4 core actions:" -ForegroundColor White
        Write-Host "   • generate_adaptive_question" -ForegroundColor Gray
        Write-Host "   • analyze_user_expertise" -ForegroundColor Gray
        Write-Host "   • start_questioning_session" -ForegroundColor Gray
        Write-Host "   • update_question_sophistication" -ForegroundColor Gray
        Write-Host "4. Complete user journey scenarios" -ForegroundColor White
        Write-Host "5. Report results using the provided forms" -ForegroundColor White
        
    } else {
        Write-Warning "⚠️  Testing script not found: EPIC-6-4-3-TESTING-SCRIPT.md"
        Write-Info "Please ensure you're in the correct directory"
    }
}

# Main execution
try {
    # Start development server if needed
    if ($TestType -eq 'auto' -or $TestType -eq 'both') {
        $devJob = Start-DevServer
    }
    
    $automatedSuccess = $true
    
    # Run automated tests
    if ($TestType -eq 'auto' -or $TestType -eq 'both') {
        $automatedSuccess = Invoke-AutomatedTests
    }
    
    # Show manual testing guide
    if ($TestType -eq 'manual' -or $TestType -eq 'both') {
        Write-Host ""
        Show-ManualTesting
    }
    
    # Final summary
    Write-Host ""
    Write-Host "🎯 Epic 6.4.3 Testing Summary" -ForegroundColor Magenta
    Write-Host "==============================" -ForegroundColor Magenta
    
    if ($TestType -eq 'auto' -or $TestType -eq 'both') {
        if ($automatedSuccess) {
            Write-Success "✅ Automated Tests: PASSED"
        } else {
            Write-Error "❌ Automated Tests: FAILED"
        }
    }
    
    if ($TestType -eq 'manual' -or $TestType -eq 'both') {
        Write-Info "📋 Manual Testing: See EPIC-6-4-3-TESTING-SCRIPT.md"
    }
    
    Write-Host ""
    Write-Info "Next Steps:"
    Write-Host "1. Review test results and reports" -ForegroundColor White
    Write-Host "2. Complete any remaining manual testing" -ForegroundColor White
    Write-Host "3. Report findings using the provided templates" -ForegroundColor White
    Write-Host "4. Assess Epic 6.4.3 completion percentage" -ForegroundColor White
    
} catch {
    Write-Error "❌ Testing script encountered an error: $_"
    exit 1
} finally {
    # Cleanup: Stop dev server job if we started it
    if ($devJob) {
        Write-Info "🧹 Cleaning up development server..."
        Stop-Job $devJob -ErrorAction SilentlyContinue
        Remove-Job $devJob -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Success "🎉 Epic 6.4.3 testing script completed!"
