from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from enum import Enum

class PageType(str, Enum):
    PERSON = "person"
    GROUP = "group"
    ORGANIZATION = "organization"

class ProfileBase(BaseModel):
    name: str
    bio: Optional[str] = None
    profile_picture: Optional[str] = Field(alias="profilePicture", default=None)
    badge: Optional[str] = None
    is_active: bool = Field(alias="isActive", default=True)
    username: str
    can_publish: bool = Field(alias="canPublish", default=False)

class UserCreate(ProfileBase):
    type: Literal[PageType.PERSON] = PageType.PERSON
    gender: Optional[str] = None
    language: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    relationship_status: Optional[str] = Field(alias="relationshipStatus", default=None)
    page_visibility: Optional[str] = Field(alias="pageVisibility", default=None)
    post_visibility: Optional[str] = Field(alias="postVisibility", default=None)

class UserResponse(UserCreate):
    id: str
    friends: List[str] = []
    number_of_friends: int = Field(alias="numberOfFriends", default=0)

class GroupCreate(ProfileBase):
    type: Literal[PageType.GROUP] = PageType.GROUP
    members: List[str] = []

class GroupResponse(GroupCreate):
    id: str

class OrganizationCreate(ProfileBase):
    type: Literal[PageType.ORGANIZATION] = PageType.ORGANIZATION
    members: List[str] = []

class OrganizationResponse(OrganizationCreate):
    id: str

class PostType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"

class PostBase(BaseModel):
    content: str
    post_type: PostType = Field(alias="postType", default=PostType.TEXT)
    media_url: Optional[str] = Field(alias="mediaUrl", default=None)

class PostCreate(PostBase):
    author_id: str = Field(alias="authorId")

class PostResponse(PostBase):
    id: str
    author_id: str = Field(alias="authorId")
    created_at: str = Field(alias="createdAt")
    likes: int = 0
    comments: List['CommentResponse'] = []

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    post_id: str = Field(alias="postId")
    author_id: str = Field(alias="authorId")

class CommentResponse(CommentBase):
    id: str
    author_id: str = Field(alias="authorId")
    created_at: str = Field(alias="createdAt")

# Update forward refs for nested models
PostResponse.update_forward_refs()
