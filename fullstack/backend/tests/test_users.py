import pytest
from models import User, PageType
import uuid

class TestUsersAPI:
    @pytest.fixture
    def test_user(self):
        """Fixture to create a test user and clean up after."""
        user_data = {
            "name": "Test User",
            "username": f"testuser_{uuid.uuid4().hex[:8]}",
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "bio": "Test bio",
            "canPublish": True,
            "gender": "other",
            "language": "en"
        }
        return user_data
    
    def test_create_user(self, api_client, test_user):
        """Test creating a new user."""
        response = api_client.post("/api/create-user", json=test_user)
        assert response.status_code == 200
        user_res = api_client.get(f"/api/organization/{test_user['username']}")
        user = User(**user_res.json())
        assert user.name == test_user["name"]
        assert user.username == test_user["username"]
        assert user.email == test_user["email"]
        assert user.type == PageType.PERSON
        return user
    
    def test_list_users(self, api_client, test_user):
        """Test listing all users."""
        # Create a test user
        api_client.post("/api/create-user", json=test_user)
        
        # Get all users
        response = api_client.get("/api/users/")
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        assert len(users) > 0
