import pytest
from models import GroupCreate, OrganizationCreate, GroupResponse, OrganizationResponse, PageType
import uuid

class TestGroupsAPI:
    @pytest.fixture
    def test_group(self, api_client):
        """Fixture to create a test group."""
        group_data = {
            "name": f"Test Group {uuid.uuid4().hex[:4]}",
            "username": f"group_{uuid.uuid4().hex[:8]}",
            "bio": "Test group description",
            "canPublish": True
        }
        return group_data
    
    def test_create_group(self, api_client, test_group):
        """Test creating a new group."""
        response = api_client.post("/api/groups/", json=test_group)
        assert response.status_code == 201
        group = GroupResponse(**response.json())
        assert group.name == test_group["name"]
        assert group.username == test_group["username"]
        assert group.type == PageType.GROUP
        return group
    
    def test_add_member_to_group(self, api_client, test_group):
        """Test adding a member to a group."""
        # First create a group
        group = api_client.post("/api/groups/", json=test_group).json()
        
        # Create a test user
        user_data = {
            "name": "Group Member",
            "username": f"member_{uuid.uuid4().hex[:8]}",
            "email": f"member_{uuid.uuid4().hex[:8]}@example.com"
        }
        user = api_client.post("/api/users/", json=user_data).json()
        
        # Add user to group
        response = api_client.post(f"/api/groups/{group['id']}/members/{user['id']}")
        assert response.status_code == 200
        
        # Verify the user is in the group
        response = api_client.get(f"/api/groups/{group['id']}")
        updated_group = response.json()
        assert user['id'] in updated_group['members']

class TestOrganizationsAPI:
    @pytest.fixture
    def test_organization(self):
        """Fixture to create a test organization."""
        return {
            "name": f"Test Org {uuid.uuid4().hex[:4]}",
            "username": f"org_{uuid.uuid4().hex[:8]}",
            "bio": "Test organization description",
            "canPublish": True
        }
    
    def test_create_organization(self, api_client, test_organization):
        """Test creating a new organization."""
        response = api_client.post("/api/organizations/", json=test_organization)
        assert response.status_code == 201
        org = OrganizationResponse(**response.json())
        assert org.name == test_organization["name"]
        assert org.username == test_organization["username"]
        assert org.type == PageType.ORGANIZATION
        return org
    
    def test_organization_membership(self, api_client, test_organization):
        """Test adding and removing members from an organization."""
        # Create an organization
        org = api_client.post("/api/organizations/", json=test_organization).json()
        
        # Create a test user
        user_data = {
            "name": "Org Member",
            "username": f"member_{uuid.uuid4().hex[:8]}",
            "email": f"member_{uuid.uuid4().hex[:8]}@example.com"
        }
        user = api_client.post("/api/users/", json=user_data).json()
        
        # Add user to organization
        response = api_client.post(f"/api/organizations/{org['id']}/members/{user['id']}")
        assert response.status_code == 200
        
        # Verify the user is in the organization
        response = api_client.get(f"/api/organizations/{org['id']}")
        updated_org = response.json()
        assert user['id'] in updated_org['members']
        
        # Remove user from organization
        response = api_client.delete(f"/api/organizations/{org['id']}/members/{user['id']}")
        assert response.status_code == 200
        
        # Verify the user was removed
        response = api_client.get(f"/api/organizations/{org['id']}")
        updated_org = response.json()
        assert user['id'] not in updated_org['members']
