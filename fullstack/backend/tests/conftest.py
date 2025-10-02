import pytest
import requests
from typing import Generator
from pydantic import BaseModel
from dataclasses import dataclass

# Test configuration
@dataclass
class TestConfig:
    base_url: str = "http://localhost:8080"  # Default port, can be overridden
    timeout: int = 10  # seconds

# Fixture to get test configuration
def pytest_addoption(parser):
    parser.addoption("--base-url", action="store", default="http://localhost:8080")

@pytest.fixture(scope="session")
def config(pytestconfig):
    return TestConfig(base_url=pytestconfig.getoption("--base-url"))

# Session-level fixture for API client
@pytest.fixture(scope="session")
def api_client(config):
    class APIClient:
        def __init__(self, base_url):
            self.base_url = base_url.rstrip('/')
            self.session = requests.Session()
            
        def request(self, method, endpoint, **kwargs):
            url = f"{self.base_url}{endpoint}"
            response = self.session.request(method, url, timeout=config.timeout, **kwargs)
            if not response.ok: raise Exception(f"Error response with status {response.status_code}: {response.json()}")
            return response
            
        def get(self, endpoint, **kwargs):
            return self.request('GET', endpoint, **kwargs)
            
        def post(self, endpoint, **kwargs):
            return self.request('POST', endpoint, **kwargs)
            
        def put(self, endpoint, **kwargs):
            return self.request('PUT', endpoint, **kwargs)
            
        def delete(self, endpoint, **kwargs):
            return self.request('DELETE', endpoint, **kwargs)
    
    return APIClient(config.base_url)

# Fixture to ensure the API is available
@pytest.fixture(scope="session", autouse=True)
def wait_for_api(api_client):
    """Ensure the API is available before running tests."""
    import time
    max_attempts = 30
    for attempt in range(max_attempts):
        try:
            response = api_client.get("/api/pages")
            if response.status_code == 200:
                return
        except (requests.exceptions.ConnectionError, requests.exceptions.RequestException):
            pass
        if attempt < max_attempts - 1:
            time.sleep(1)  # Wait before retrying
    pytest.fail("API is not available after multiple attempts")
