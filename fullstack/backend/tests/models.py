from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from enum import Enum

class PageType(str, Enum):
    PERSON = "person"
    GROUP = "group"
    ORGANIZATION = "organization"

class Page(BaseModel):
    id: str
    type: PageType
    name: str
    bio: str
    profile_picture: Optional[str] = Field(alias="profilePicture", default=None)
    badge: Optional[str] = None
    is_active: bool = Field(alias="isActive", default=True)

class Profile(BaseModel):
    username: Optional[str] = None

class User(Profile):
    type: Literal[PageType.PERSON] = PageType.PERSON
    gender: Optional[str] = None
    language: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    relationship_status: Optional[str] = Field(alias="relationshipStatus", default=None)
    page_visibility: Optional[str] = Field(alias="pageVisibility", default=None)
    post_visibility: Optional[str] = Field(alias="postVisibility", default=None)
    friends: List[str] = []
    number_of_friends: int = Field(alias="numberOfFriends", default=0)

class Group(Profile):
    type: Literal[PageType.GROUP] = PageType.GROUP
    group_id: Optional[str] = Field(alias="groupId", default=None)
    tags: List[str] = []
    page_visibility: Optional[str] = Field(alias="pageVisibility", default=None)
    post_visibility: Optional[str] = Field(alias="postVisibility", default=None)

class Organization(Profile):
    type: Literal[PageType.ORGANIZATION] = PageType.ORGANIZATION
    tags: List[str] = []

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
