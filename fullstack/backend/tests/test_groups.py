import pytest
from models import Group, PageType
import uuid

class TestGroupsAPI:
    @pytest.fixture
    def test_group(self, api_client):
        """Fixture to create a test group."""
        return {
            "name": f"Test Group {uuid.uuid4().hex[:4]}",
            "groupId": f"group_{uuid.uuid4().hex[:8]}",
            "bio": "Test group description",
            "isActive": True,
            "pageVisibility": "public",
            "postVisibility": "public",
        }

    def test_create_get_group(self, api_client, test_group):
        """Test creating and getting a new group."""
        response = api_client.post("/api/create-group", json=test_group)
        assert response.status_code == 200
        group_res = api_client.get(f"/api/organization/{test_group['groupId']}")
        group = Group(**group_res.json())
        assert group.name == test_group["name"]
        assert group.type == PageType.GROUP
        assert group.bio == test_group["bio"]
        assert group.is_active == test_group["isActive"]
