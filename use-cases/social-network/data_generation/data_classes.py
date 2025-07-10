from dataclasses import dataclass
from typing import Self
from conversation import Conversation
from enums import PageType, PlaceType, SocialRelationType, GroupMemberRank, PostType


@dataclass
class Page:
    type: PageType
    id: str
    name: str


@dataclass
class Place:
    type: PlaceType
    id: str
    name: str
    parent: Self = None


@dataclass
class SocialRelation:
    type: SocialRelationType
    persons: tuple[Page, Page]


@dataclass
class Education:
    institute: Page
    attendee: Page


@dataclass
class Employment:
    employer: Page
    employee: Page


@dataclass
class GroupMembership:
    group: Page
    member: Page
    rank: GroupMemberRank


@dataclass
class Post:
    type: PostType
    id: str
    author: Page
    timestamp: str


@dataclass
class Comment:
    id: str
    author: Page
    timestamp: str


@dataclass
class Poll:
    id: str
    question: str
    answers: list[str]


@dataclass
class Reaction:
    content: Post | Comment
    author: Page


@dataclass
class Response:
    poll: Poll
    author: Page


@dataclass
class Following:
    page: Page
    follower: Page


@dataclass
class Viewing:
    post: Post
    profile: Page


@dataclass
class MappedConversation:
    conversation: Conversation
    usertag_mapping: dict[str, str]
    content_id_mapping: dict[str, str]
    page: Page
