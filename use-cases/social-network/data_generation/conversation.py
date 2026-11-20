from random import Random
from re import findall
from typing import Literal, Any, Self
from uuid import UUID
from enums import PostType


class ConversationNode:
    _random = Random()

    def __init__(
            self,
            content_type: PostType | Literal["comment"],
            author_usertag: str,
            body: str,
            timestamp: str,
            parent_id: str = None,
            question: str = None,
            answers: list[str] = None
    ):
        self.local_id = UUID(version=4, int=self._random.getrandbits(128)).hex
        self.parent_local_id = parent_id
        self.content_type = content_type
        self.author_local_usertag = author_usertag
        self.timestamp = timestamp
        self.body = body
        self.question = question
        self.answers = answers

    @property
    def usertags(self) -> list[str]:
        return sorted(list(set(findall(pattern=r"@\w+", string=self.body))))

    @property
    def hashtags(self) -> list[str]:
        return sorted(list(set(findall(pattern=r"#\w+", string=self.body))))

    @property
    def tags(self) -> list[str]:
        return self.usertags + self.hashtags

    def author_global_usertag(self, usertag_mapping: dict[str, str]) -> str:
        return usertag_mapping[self.author_local_usertag]

    def globalised_body(self, usertag_mapping: dict[str, str]) -> str:
        body = self.body

        for local_usertag, global_usertag in usertag_mapping.items():
            body = body.replace(local_usertag, global_usertag)

        return body

    def globalised_usertags(self, usertag_mapping: dict[str, str]) -> list[str]:
        return [usertag_mapping[usertag] for usertag in self.usertags]

    def globalised_tags(self, usertag_mapping: dict[str, str]) -> list[str]:
        return self.globalised_usertags(usertag_mapping) + self.hashtags


class Conversation:
    def __init__(self):
        self.nodes: list[ConversationNode] = list()

    def add(self, node: ConversationNode) -> None:
        self.nodes.append(node)

    def get(self, local_id: str) -> ConversationNode:
        for node in self.nodes:
            if node.local_id == local_id:
                return node

        raise RuntimeError("No conversation node with supplied local ID.")

    def merge(self, conversation: Self) -> None:
        self.nodes += conversation.nodes

    def parent(self, node: ConversationNode) -> ConversationNode | None:
        if node.parent_local_id is None:
            return None
        else:
            return self.get(node.parent_local_id)

    @property
    def root(self) -> ConversationNode:
        roots = {node for node in self.nodes if self.parent(node) is None}

        if len(roots) == 0:
            raise RuntimeError("Conversation has no root.")
        elif len(roots) == 1:
            return roots.pop()
        else:
            raise RuntimeError("Conversation has multiple roots.")

    @property
    def root_author(self) -> str:
        return self.root.author_local_usertag

    @property
    def comment_authors(self) -> list[str]:
        return sorted(list({node.author_local_usertag for node in self.nodes if node is not self.root}))

    @property
    def participants(self) -> list[str]:
        return sorted(list(set(self.comment_authors) | {self.root_author}))

    @property
    def commenters(self) -> list[str]:
        return sorted(list(set(self.comment_authors) - {self.root_author}))

    @property
    def usertags(self) -> list[str]:
        tags = set()

        for node in self.nodes:
            tags |= set(node.usertags)

        return sorted(list(tags))

    @property
    def hashtags(self) -> list[str]:
        tags = set()

        for node in self.nodes:
            tags |= set(node.hashtags)

        return sorted(list(tags))

    @property
    def tags(self) -> list[str]:
        return self.usertags + self.hashtags

    @classmethod
    def from_json(cls, json_rep: dict[str, Any], parent_type: PostType | Literal["comment"], parent_id: str = None) -> Self:
        if parent_type is PostType.POLL:
            question = json_rep["question"]
            answers = json_rep["answers"]
        else:
            question = None
            answers = None

        ts = json_rep["timestamp"].rstrip("Z")
        parent = ConversationNode(
            content_type=parent_type,
            author_usertag=json_rep["username"],
            body=json_rep["body"],
            timestamp=f"{ts}.000",
            parent_id=parent_id,
            question=question,
            answers=answers,
        )

        conversation = Conversation()
        conversation.add(parent)

        for comment in json_rep["comments"]:
            child_conversation = cls.from_json(comment, parent_type="comment", parent_id=parent.local_id)
            conversation.merge(child_conversation)

        return conversation
