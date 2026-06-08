import asyncio
import time
import httpx

BASE_URL = "http://34.63.48.46:8010"

async def test_endpoint(client: httpx.AsyncClient, name: str, path: str, method: str = "GET", expected_status: int = 200):
    url = f"{BASE_URL}{path}"
    print(f"Testing {name} ({method} {path})...")
    start_time = time.perf_counter()
    try:
        if method == "GET":
            response = await client.get(path)
        elif method == "POST":
            response = await client.post(path)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        duration = time.perf_counter() - start_time
        print(f"  Result: Status {response.status_code} | Time: {duration:.2f}s")
        assert response.status_code == expected_status, f"Expected {expected_status}, got {response.status_code}"
        return True, duration
    except Exception as e:
        duration = time.perf_counter() - start_time
        print(f"  FAILED: {name} | Time: {duration:.2f}s | Error: {e}")
        return False, duration

async def test_concurrency(name: str, path: str, count: int = 5):
    print(f"\n--- Starting Concurrency Test ({count} concurrent requests to {path}) ---")
    start_time = time.perf_counter()
    
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=40.0) as client:
        tasks = [client.get(path) for _ in range(count)]
        try:
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            duration = time.perf_counter() - start_time
            print(f"Concurrency Test completed in {duration:.2f}s")
            
            successes = 0
            for i, res in enumerate(responses):
                if isinstance(res, Exception):
                    print(f"  Request {i+1} failed: {res}")
                else:
                    print(f"  Request {i+1}: Status {res.status_code} | Time: {res.elapsed.total_seconds():.2f}s")
                    if res.status_code == 200:
                        successes += 1
            
            print(f"Success rate: {successes}/{count}")
            return successes == count
        except Exception as e:
            print(f"Concurrency execution error: {e}")
            return False

async def main():
    print("==================================================")
    print(f"Starting QA verification tests against: {BASE_URL}")
    print("==================================================")
    
    endpoints = [
        ("Root Endpoint", "/", "GET", 200),
        ("Health Check", "/health", "GET", 200),
        ("Resources List", "/api/resources", "GET", 200),
        ("FTP Clients List", "/api/ftp/clients", "GET", 200),
        ("SDS Clients List", "/api/sds/clients", "GET", 200),
        ("ERS Clients List", "/api/ers/clients", "GET", 200),
    ]
    
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        all_passed = True
        for name, path, method, status in endpoints:
            success, _ = await test_endpoint(client, name, path, method, status)
            if not success:
                all_passed = False
            # Small delay between tests to keep logs tidy
            await asyncio.sleep(0.5)
            
    # Concurrency test
    concurrency_passed = await test_concurrency("SDS Clients Concurrency", "/api/sds/clients", count=5)
    
    print("\n==================================================")
    if all_passed and concurrency_passed:
        print("ALL TESTS PASSED SUCCESSFULLY! Ready to push.")
    else:
        print("SOME TESTS FAILED! Please investigate.")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(main())
