import pytest
from models import Organization, PageType
import uuid

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

    def test_create_get_organization(self, api_client, test_organization):
        """Test creating and getting a new organization."""
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
