import pytest
from models import GroupCreate, OrganizationCreate, GroupResponse, OrganizationResponse, PageType
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
            "pageVisibility": True,
            "postVisibility": True,
            "canPublish": True,
        }
        return group_data
    
    def test_create_group(self, api_client, test_group):
        """Test creating a new group."""
        response = api_client.post("/api/create-group", json=test_group)
        assert response.status_code == 201
        group_response = api_client.get(f"/api/organization/{test_group['username']}")
        group = GroupResponse(**group_response.json())
        assert group.name == test_group["name"]
        assert group.username == test_group["username"]
        assert group.type == PageType.GROUP
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
        assert response.status_code == 201
        org_response = api_client.get(f"/api/organization/{test_organization['username']}")
        org = OrganizationResponse(**org_response.json())
        assert org.name == test_organization["name"]
        assert org.username == test_organization["username"]
        assert org.type == PageType.ORGANIZATION
        return org
