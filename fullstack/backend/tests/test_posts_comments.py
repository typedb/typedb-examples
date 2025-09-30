import pytest
from models import PostCreate, CommentCreate, PostResponse, CommentResponse, PostType
import uuid

class TestPostsAPI:
    @pytest.fixture
    def test_user(self, api_client):
        """Create a test user for posts."""
        user_data = {
            "name": "Post Author",
            "username": f"author_{uuid.uuid4().hex[:8]}",
            "email": f"author_{uuid.uuid4().hex[:8]}@example.com",
            "canPublish": True
        }
        response = api_client.post("/api/users/", json=user_data)
        return response.json()
    
    @pytest.fixture
    def test_post(self, api_client, test_user):
        """Create a test post."""
        post_data = {
            "content": "This is a test post",
            "authorId": test_user["id"],
            "postType": "text"
        }
        response = api_client.post("/api/posts/", json=post_data)
        return response.json()
    
    def test_create_post(self, api_client, test_user):
        """Test creating a new post."""
        post_data = {
            "content": "Test post content",
            "authorId": test_user["id"],
            "postType": "text"
        }
        response = api_client.post("/api/posts/", json=post_data)
        assert response.status_code == 201
        post = PostResponse(**response.json())
        assert post.content == post_data["content"]
        assert post.author_id == test_user["id"]
        assert post.post_type == PostType.TEXT
        return post
    
    def test_get_post(self, api_client, test_post):
        """Test retrieving a post by ID."""
        response = api_client.get(f"/api/posts/{test_post['id']}")
        assert response.status_code == 200
        post = PostResponse(**response.json())
        assert post.id == test_post["id"]
        assert post.content == test_post["content"]
    
    def test_get_posts_by_author(self, api_client, test_post, test_user):
        """Test retrieving posts by author."""
        response = api_client.get(f"/api/users/{test_user['id']}/posts")
        assert response.status_code == 200
        posts = response.json()
        assert isinstance(posts, list)
        assert len(posts) > 0
        assert any(p["id"] == test_post["id"] for p in posts)

class TestCommentsAPI:
    @pytest.fixture
    def test_commenter(self, api_client):
        """Create a test user for comments."""
        user_data = {
            "name": "Commenter",
            "username": f"commenter_{uuid.uuid4().hex[:8]}",
            "email": f"commenter_{uuid.uuid4().hex[:8]}@example.com"
        }
        response = api_client.post("/api/users/", json=user_data)
        return response.json()
    
    def test_create_comment(self, api_client, test_post, test_commenter):
        """Test creating a comment on a post."""
        comment_data = {
            "content": "This is a test comment",
            "postId": test_post["id"],
            "authorId": test_commenter["id"]
        }
        response = api_client.post("/api/comments/", json=comment_data)
        assert response.status_code == 201
        comment = CommentResponse(**response.json())
        assert comment.content == comment_data["content"]
        assert comment.author_id == test_commenter["id"]
        return comment
    
    def test_get_post_comments(self, api_client, test_post, test_commenter):
        """Test retrieving comments for a post."""
        # Create a test comment
        comment_data = {
            "content": "Test comment content",
            "postId": test_post["id"],
            "authorId": test_commenter["id"]
        }
        comment = api_client.post("/api/comments/", json=comment_data).json()
        
        # Get comments for the post
        response = api_client.get(f"/api/posts/{test_post['id']}/comments")
        assert response.status_code == 200
        comments = response.json()
        assert isinstance(comments, list)
        assert len(comments) > 0
        assert any(c["id"] == comment["id"] for c in comments)
