import pytest
from models import User, PageType
import uuid

class TestUsersAPI:
    @pytest.fixture
    def test_user(self):
        """Fixture to create a test user and clean up after."""
        return {
            "name": "Test User",
            "username": f"testuser_{uuid.uuid4().hex[:8]}",
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "bio": "Test bio",
            "canPublish": True,
            "isActive": True,
            "gender": "other",
            "language": "en",
            "pageVisibility": "public",
            "postVisibility": "public",
        }

    def test_create_get_user(self, api_client, test_user):
        """Test creating a new user."""
        response = api_client.post("/api/create-user", json=test_user)
        assert response.status_code == 200
        user_res = api_client.get(f"/api/organization/{test_user['username']}")
        user = User(**user_res.json())
        assert user.name == test_user["name"]
        assert user.username == test_user["username"]
        assert user.email == test_user["email"]
        assert user.type == PageType.PERSON
