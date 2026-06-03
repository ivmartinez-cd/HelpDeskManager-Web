"""
Epson Remote Services (ERS) Token Refresher for HelpDeskManager-Web.
Uses Playwright to log into ERS, capture the Bearer token and Incapsula cookies, and save them.
"""
import os
import sys
import json
import asyncio
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
from playwright.async_api import async_playwright

# Setup paths and environment
SERVICES_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SERVICES_DIR.parent

# Load .env from backend folder
load_dotenv(BACKEND_DIR / ".env")

ERS_USERNAME = os.getenv("EPSON_ERS_USERNAME") or "insumos@canaldirecto.com.ar"
ERS_PASSWORD = os.getenv("EPSON_ERS_PASSWORD") or "C@nal3160"
TOKEN_FILE = BACKEND_DIR / "data" / "ers_token.json"

async def main():
    print(f"Starting ERS login for: {ERS_USERNAME}...")
    
    async with async_playwright() as p:
        # Launch browser in headless mode
        browser = await p.chromium.launch(headless=True)
        # Set viewport to look like a standard desktop
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 800}
        )
        page = await context.new_page()

        captured_token = None

        # Listen to requests to capture the authorization header
        async def handle_request(request):
            nonlocal captured_token
            headers = request.headers
            auth = headers.get("authorization")
            if auth and auth.startswith("Bearer "):
                # Only capture the longest token (usually the ERS API token)
                if not captured_token or len(auth) > len(captured_token):
                    captured_token = auth
                    print("[Request Hook] Captured Bearer Token!")

        page.on("request", handle_request)

        # 1. Navigate to ERS home page
        url = "https://www.remote-services.epson.com/"
        await page.goto(url, wait_until="networkidle")

        # 2. Fill login form
        print("Filling credentials...")
        await page.fill('input[type="text"]', ERS_USERNAME)
        await page.fill('input[type="password"]', ERS_PASSWORD)

        # 3. Click submit
        print("Submitting login form...")
        await page.click('button:has-text("Iniciar sesión")')

        # 4. Wait for redirection / network activity
        try:
            print("Waiting for login authorization network activity...")
            for _ in range(30):
                if captured_token:
                    break
                await asyncio.sleep(0.5)
        except Exception as e:
            print(f"Warning during wait: {e}")

        # Check if we successfully got a token
        if captured_token:
            print("Login successful! Saving captured token and cookies...")
            cookies = await context.cookies()
            TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
            token_data = {
                "token": captured_token,
                "cookies": cookies,
                "updated_at": datetime.now().isoformat(),
                "username": ERS_USERNAME
            }
            with open(TOKEN_FILE, "w", encoding="utf-8") as f:
                json.dump(token_data, f, indent=2)
            print(f"Token and cookies successfully saved to: {TOKEN_FILE}")
            success = True
        else:
            print("Error: Could not capture the Bearer Token from network requests.")
            body_text = await page.inner_text("body")
            print("Current page body snippet:", body_text[:500])
            success = False

        await browser.close()
        
        if not success:
            sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
