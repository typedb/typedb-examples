from abc import ABC, abstractmethod, ABCMeta
from collections.abc import Iterator
from datetime import datetime
from enum import Enum, EnumMeta
from random import Random
from typing import Self


class AbstractEnumMeta(ABCMeta, EnumMeta):
    pass


class WeightedEnum(ABC, Enum, metaclass=AbstractEnumMeta):
    @property
    @abstractmethod
    def weight(self) -> float:
        ...

    @classmethod
    def choose(cls, random: Random, choices: list[Self] = None) -> Self:
        if choices is None:
            choices = list(member for member in cls)

        weights = list(choice.weight for choice in choices)
        return random.choices(choices, weights)[0]


class NameType(Enum):
    FIRST = "first"
    LAST = "last"
    FULL = "full"


class Gender(WeightedEnum):
    FEMALE = "female"
    MALE = "male"
    OTHER = "other"

    @property
    def weight(self) -> float:
        match self:
            case Gender.FEMALE:
                return 50.0
            case Gender.MALE:
                return 45.0
            case Gender.OTHER:
                return 5.0
            case _:
                raise RuntimeError()


class EmailDomain(WeightedEnum):
    GOOGLE = "gmail.com"
    MICROSOFT = "outlook.com"
    PROTON = "proton.me"
    AOL = "aol.com"
    YAHOO = "yahoo.com"

    @property
    def weight(self) -> float:
        match self:
            case EmailDomain.GOOGLE:
                return 50.0
            case EmailDomain.MICROSOFT:
                return 30.0
            case EmailDomain.PROTON:
                return 10.0
            case EmailDomain.AOL:
                return 5.0
            case EmailDomain.YAHOO:
                return 5.0


class RelationshipStatus(WeightedEnum):
    SINGLE = "single"
    RELATIONSHIP = "relationship"
    ENGAGED = "engaged"
    MARRIED = "married"
    COMPLICATED = "complicated"

    @property
    def weight(self) -> float:
        match self:
            case RelationshipStatus.SINGLE:
                return 20.0
            case RelationshipStatus.RELATIONSHIP:
                return 40.0
            case RelationshipStatus.ENGAGED:
                return 5.0
            case RelationshipStatus.MARRIED:
                return 30.0
            case RelationshipStatus.COMPLICATED:
                return 5.0


class SocialRelationType(WeightedEnum):
    FRIENDSHIP = "friendship"
    FAMILY = "family"
    PARENTSHIP = "parentship"
    SIBLINGSHIP = "siblingship"
    RELATIONSHIP = "relationship"
    ENGAGEMENT = "engagement"
    MARRIAGE = "marriage"

    @property
    def weight(self) -> float:
        match self:
            case SocialRelationType.FRIENDSHIP:
                return 70.0
            case SocialRelationType.FAMILY:
                return 3.0
            case SocialRelationType.PARENTSHIP:
                return 3.0
            case SocialRelationType.SIBLINGSHIP:
                return 3.0
            case SocialRelationType.RELATIONSHIP:
                return 15.0
            case SocialRelationType.ENGAGEMENT:
                return 3.0
            case SocialRelationType.MARRIAGE:
                return 3.0

    @property
    def is_family(self) -> bool:
        return self in [SocialRelationType.FAMILY, SocialRelationType.PARENTSHIP, SocialRelationType.SIBLINGSHIP]

    @property
    def is_relationship(self) -> bool:
        return self in [SocialRelationType.RELATIONSHIP, SocialRelationType.ENGAGEMENT, SocialRelationType.MARRIAGE]

    @classmethod
    def family_types(cls) -> Iterator[Self]:
        return (type for type in SocialRelationType if type.is_family)

    @classmethod
    def relationship_types(cls) -> Iterator[Self]:
        return (type for type in SocialRelationType if type.is_relationship)

    @property
    def role_first(self) -> str:
        match self:
            case SocialRelationType.FRIENDSHIP:
                return "friend"
            case SocialRelationType.FAMILY:
                return "relative"
            case SocialRelationType.PARENTSHIP:
                return "parent"
            case SocialRelationType.SIBLINGSHIP:
                return "sibling"
            case SocialRelationType.RELATIONSHIP:
                return "partner"
            case SocialRelationType.ENGAGEMENT:
                return "fiance"
            case SocialRelationType.MARRIAGE:
                return "spouse"
            case _:
                raise RuntimeError()

    @property
    def role_second(self) -> str:
        match self:
            case SocialRelationType.FRIENDSHIP:
                return self.role_first
            case SocialRelationType.FAMILY:
                return self.role_first
            case SocialRelationType.PARENTSHIP:
                return "child"
            case SocialRelationType.SIBLINGSHIP:
                return self.role_first
            case SocialRelationType.RELATIONSHIP:
                return self.role_first
            case SocialRelationType.ENGAGEMENT:
                return self.role_first
            case SocialRelationType.MARRIAGE:
                return self.role_first
            case _:
                raise RuntimeError()

    @property
    def relationship_date_type(self) -> str:
        match self:
            case SocialRelationType.RELATIONSHIP:
                return "start-date"
            case SocialRelationType.ENGAGEMENT:
                return "engagement-date"
            case SocialRelationType.MARRIAGE:
                return "marriage-date"
            case _:
                raise RuntimeError()

    @property
    def has_location(self) -> bool:
        return self in [SocialRelationType.ENGAGEMENT, SocialRelationType.MARRIAGE]

    @property
    def relationship_status(self) -> RelationshipStatus:
        match self:
            case SocialRelationType.RELATIONSHIP:
                return RelationshipStatus.RELATIONSHIP
            case SocialRelationType.ENGAGEMENT:
                return RelationshipStatus.ENGAGED
            case SocialRelationType.MARRIAGE:
                return RelationshipStatus.MARRIED
            case _:
                raise RuntimeError()


class TimestampFormat(Enum):
    DATE = "YYYY-MM-DD"
    DATETIME = "YYYY-MM-DDTHH:MM:SS"
    PRECISE_DATETIME = "YYYY-MM-DDTHH:MM:SS.FFF"

    @property
    def _format(self) -> str:
        match self:
            case TimestampFormat.DATE:
                return "%Y-%m-%d"
            case TimestampFormat.DATETIME:
                return "%Y-%m-%dT%H:%M:%S"
            case TimestampFormat.PRECISE_DATETIME:
                return "%Y-%m-%dT%H:%M:%S.%f"
            case _:
                raise RuntimeError()

    def parse_string(self, timestamp: str) -> datetime:
        if self is TimestampFormat.PRECISE_DATETIME:
            timestamp += "000"

        return datetime.strptime(timestamp, self._format)

    def to_string(self, timestamp: datetime) -> str:
        string = timestamp.strftime(self._format)

        if self is TimestampFormat.PRECISE_DATETIME:
            string = string[:-3]

        return string


class GroupMemberRank(WeightedEnum):
    MEMBER = "member"
    MODERATOR = "moderator"
    ADMIN = "admin"
    OWNER = "owner"

    @property
    def weight(self) -> float:
        match self:
            case GroupMemberRank.MEMBER:
                return 85.0
            case GroupMemberRank.MODERATOR:
                return 10.0
            case GroupMemberRank.ADMIN:
                return 5.0
            case GroupMemberRank.OWNER:
                return 0.0


class Emoji(WeightedEnum):
    LIKE = "like"
    LOVE = "love"
    FUNNY = "funny"
    SURPRISE = "surprise"
    SAD = "sad"
    ANGRY = "angry"

    @property
    def weight(self) -> float:
        match self:
            case Emoji.LIKE:
                return 60.0
            case Emoji.LOVE:
                return 10.0
            case Emoji.FUNNY:
                return 10.0
            case Emoji.SURPRISE:
                return 10.0
            case Emoji.SAD:
                return 5.0
            case Emoji.ANGRY:
                return 5.0


class PageVisibility(Enum):
    PUBLIC = "public"
    PRIVATE = "private"


class PostVisibility(Enum):
    DEFAULT = "default"
    PUBLIC = "public"
    PRIVATE = "private"


class PostType(Enum):
    TEXT = "text-post"
    SHARE = "share-post"
    IMAGE = "image-post"
    VIDEO = "video-post"
    LIVE = "live-video-post"
    POLL = "poll-post"


class PlaceType(Enum):
    REGION = "region"
    COUNTRY = "country"
    STATE = "state"
    CITY = "city"
    LANDMARK = "landmark"

    @property
    def location_type(self) -> str:
        match self:
            case PlaceType.REGION:
                return "region-location"
            case PlaceType.COUNTRY:
                return "country-location"
            case PlaceType.STATE:
                return "state-location"
            case PlaceType.CITY:
                return "city-location"
            case PlaceType.LANDMARK:
                return "landmark-location"
            case _:
                raise RuntimeError()

    @property
    def place_role(self) -> str:
        match self:
            case PlaceType.REGION:
                return "parent-region"
            case PlaceType.COUNTRY:
                return "region"
            case PlaceType.STATE:
                return "country"
            case PlaceType.CITY:
                return "parent"
            case PlaceType.LANDMARK:
                return "parent"
            case _:
                raise RuntimeError()

    @property
    def located_role(self) -> str:
        match self:
            case PlaceType.REGION:
                return "child-region"
            case PlaceType.COUNTRY:
                return "country"
            case PlaceType.STATE:
                return "state"
            case PlaceType.CITY:
                return "city"
            case PlaceType.LANDMARK:
                return "landmark"
            case _:
                raise RuntimeError()


class PageType(Enum):
    PERSON = "person"
    ORGANISATION = "organisation"
    COMPANY = "company"
    CHARITY = "charity"
    INSTITUTE = "educational-institute"
    SCHOOL = "school"
    COLLEGE = "college"
    UNIVERSITY = "university"
    GROUP = "group"

    @property
    def is_profile(self) -> bool:
        return self in [PageType.PERSON, PageType.ORGANISATION, PageType.COMPANY, PageType.CHARITY, PageType.INSTITUTE, PageType.SCHOOL, PageType.COLLEGE, PageType.UNIVERSITY]

    @classmethod
    def profile_types(cls) -> Iterator[Self]:
        return (type for type in PageType if type.is_profile)

    @property
    def is_organisation(self) -> bool:
        return self in [PageType.ORGANISATION, PageType.COMPANY, PageType.CHARITY, PageType.INSTITUTE, PageType.SCHOOL, PageType.COLLEGE, PageType.UNIVERSITY]

    @classmethod
    def organisation_types(cls) -> Iterator[Self]:
        return (type for type in PageType if type.is_organisation)

    @property
    def is_institute(self) -> bool:
        return self in [PageType.INSTITUTE, PageType.SCHOOL, PageType.COLLEGE, PageType.UNIVERSITY]

    @classmethod
    def institute_types(cls) -> Iterator[Self]:
        return (type for type in PageType if type.is_institute)


class OrganisationType(Enum):
    COMPANY = "company"
    CHARITY = "charity"
    INSTITUTE = "educational-institute"
    SCHOOL = "school"
    COLLEGE = "college"
    UNIVERSITY = "university"

    @property
    def page_type(self) -> PageType:
        match self:
            case OrganisationType.COMPANY:
                return PageType.COMPANY
            case OrganisationType.CHARITY:
                return PageType.CHARITY
            case OrganisationType.INSTITUTE:
                return PageType.INSTITUTE
            case OrganisationType.SCHOOL:
                return PageType.SCHOOL
            case OrganisationType.COLLEGE:
                return PageType.COLLEGE
            case OrganisationType.UNIVERSITY:
                return PageType.UNIVERSITY
            case _:
                raise RuntimeError()


class InstituteType(Enum):
    INSTITUTE = "educational-institute"
    SCHOOL = "school"
    COLLEGE = "college"
    UNIVERSITY = "university"

    @property
    def page_type(self) -> PageType:
        match self:
            case InstituteType.INSTITUTE:
                return PageType.INSTITUTE
            case InstituteType.SCHOOL:
                return PageType.SCHOOL
            case InstituteType.COLLEGE:
                return PageType.COLLEGE
            case InstituteType.UNIVERSITY:
                return PageType.UNIVERSITY
            case _:
                raise RuntimeError()
