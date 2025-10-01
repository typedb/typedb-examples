import pytest
from models import Group, Organization, PageType
import uuid

class TestGroupsAPI:
    @pytest.fixture
    def test_group(self, api_client):
        """Fixture to create a test group."""
        group_data = {
            "name": f"Test Group {uuid.uuid4().hex[:4]}",
            "groupId": f"group_{uuid.uuid4().hex[:8]}",
            "bio": "Test group description",
            "isActive": True,
            "pageVisibility": "public",
            "postVisibility": "public",
        }
        return group_data
    
    def test_create_group(self, api_client, test_group):
        """Test creating a new group."""
        response = api_client.post("/api/create-group", json=test_group)
        assert response.status_code == 200
        group_res = api_client.get(f"/api/organization/{test_group['groupId']}")
        group = Group(**group_res.json())
        assert group.name == test_group["name"]
        assert group.type == PageType.GROUP
        assert group.bio == test_group["bio"]
        assert group.is_active == test_group["isActive"]
        return group

class TestOrganizationsAPI:
    @pytest.fixture
    def test_organization(self):
        """Fixture to create a test organization."""
        return {
            "name": f"Test Org {uuid.uuid4().hex[:4]}",
            "username": f"org_{uuid.uuid4().hex[:8]}",
            "bio": "Test organization description",
            "isActive": True,
            "canPublish": True,
        }
    
    def test_create_organization(self, api_client, test_organization):
        """Test creating a new organization."""
        response = api_client.post("/api/create-organization", json=test_organization)
        assert response.status_code == 200
        org_res = api_client.get(f"/api/organization/{test_organization['username']}")
        org = Organization(**org_res.json())
        assert org.name == test_organization["name"]
        assert org.username == test_organization["username"]
        assert org.type == PageType.ORGANIZATION
        assert org.bio == test_organization["bio"]
        assert org.is_active == test_organization["isActive"]
        assert org.can_publish == test_organization["canPublish"]
        return org
