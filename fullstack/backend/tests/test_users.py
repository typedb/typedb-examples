import pytest
from models import UserCreate, UserResponse, PageType
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
        response = api_client.post("/api/users/", json=test_user)
        assert response.status_code == 201
        user = UserResponse(**response.json())
        assert user.name == test_user["name"]
        assert user.username == test_user["username"]
        assert user.email == test_user["email"]
        assert user.type == PageType.PERSON
        return user
    
    def test_get_user(self, api_client, test_user):
        """Test retrieving a user by ID."""
        # First create a user
        create_response = api_client.post("/api/users/", json=test_user)
        user_id = create_response.json()["id"]
        
        # Then retrieve it
        response = api_client.get(f"/api/users/{user_id}")
        assert response.status_code == 200
        user = UserResponse(**response.json())
        assert user.id == user_id
        assert user.name == test_user["name"]
    
    def test_update_user(self, api_client, test_user):
        """Test updating a user's information."""
        # Create a user first
        create_response = api_client.post("/api/users/", json=test_user)
        user_id = create_response.json()["id"]
        
        # Update the user
        update_data = {"name": "Updated Name", "bio": "Updated bio"}
        response = api_client.put(f"/api/users/{user_id}", json=update_data)
        assert response.status_code == 200
        
        # Verify the update
        updated_user = UserResponse(**response.json())
        assert updated_user.name == update_data["name"]
        assert updated_user.bio == update_data["bio"]
    
    def test_list_users(self, api_client, test_user):
        """Test listing all users."""
        # Create a test user
        api_client.post("/api/users/", json=test_user)
        
        # Get all users
        response = api_client.get("/api/users/")
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        assert len(users) > 0
