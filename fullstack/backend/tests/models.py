from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from enum import Enum

class PageType(str, Enum):
    PERSON = "person"
    GROUP = "group"
    ORGANIZATION = "organization"

class Page(BaseModel):
    id: Optional[str] = None
    type: PageType
    name: str
    bio: str
    profile_picture: Optional[str] = Field(alias="profilePicture", default=None)
    badge: Optional[str] = None
    is_active: bool = Field(alias="isActive", default=True)

class Profile(Page):
    username: Optional[str] = None
    can_publish: Optional[bool] = Field(alias="canPublish", default=True)

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

class Group(Page):
    type: Literal[PageType.GROUP] = PageType.GROUP
    group_id: Optional[str] = Field(alias="groupId", default=None)
    tags: List[str] = []
    page_visibility: Optional[str] = Field(alias="pageVisibility", default=None)
    post_visibility: Optional[str] = Field(alias="postVisibility", default=None)

class Organization(Profile):
    type: Literal[PageType.ORGANIZATION] = PageType.ORGANIZATION
    tags: List[str] = []
