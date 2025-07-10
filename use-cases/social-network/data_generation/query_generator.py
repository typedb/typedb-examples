from json import load
from typing import Any
from query_builder import QueryBuilder
from enums import OrganisationType, PostType
from conversation import Conversation

query_builder = QueryBuilder()

queries = [
    query_builder.region("Americas", "plc-americas"),
    query_builder.region("North America", "plc-americas/northern-america", "plc-americas"),
    query_builder.country("United States", "plc-americas/northern-america/united-states", "plc-americas/northern-america", ["English"]),
    query_builder.state("California", "plc-americas/northern-america/united-states/california", "plc-americas/northern-america/united-states"),
    query_builder.state("Texas", "plc-americas/northern-america/united-states/texas", "plc-americas/northern-america/united-states"),
    query_builder.state("New York", "plc-americas/northern-america/united-states/new-york", "plc-americas/northern-america/united-states"),
    query_builder.state("New Jersey", "plc-americas/northern-america/united-states/new-jersey", "plc-americas/northern-america/united-states"),
    query_builder.state("Washington", "plc-americas/northern-america/united-states/washington", "plc-americas/northern-america/united-states"),
    query_builder.state("Massachusetts", "plc-americas/northern-america/united-states/massachusetts", "plc-americas/northern-america/united-states"),
    query_builder.state("New Mexico", "plc-americas/northern-america/united-states/new-mexico", "plc-americas/northern-america/united-states"),
    query_builder.state("Missouri", "plc-americas/northern-america/united-states/missouri", "plc-americas/northern-america/united-states"),
    query_builder.city("Sacramento", "plc-americas/northern-america/united-states/california/sacramento", "plc-americas/northern-america/united-states/california"),
    query_builder.city("Los Angeles", "plc-americas/northern-america/united-states/california/los-angeles", "plc-americas/northern-america/united-states/california"),
    query_builder.city("San Francisco", "plc-americas/northern-america/united-states/california/san-francisco", "plc-americas/northern-america/united-states/california"),
    query_builder.city("Sevastopol", "plc-americas/northern-america/united-states/california/sevastopol", "plc-americas/northern-america/united-states/california"),
    query_builder.city("Austin", "plc-americas/northern-america/united-states/texas/austin", "plc-americas/northern-america/united-states/texas"),
    query_builder.city("Albany", "plc-americas/northern-america/united-states/new-york/albany", "plc-americas/northern-america/united-states/new-york"),
    query_builder.city("New York City", "plc-americas/northern-america/united-states/new-york/new-york-city", "plc-americas/northern-america/united-states/new-york"),
    query_builder.city("Trenton", "plc-americas/northern-america/united-states/new-jersey/trenton", "plc-americas/northern-america/united-states/new-jersey"),
    query_builder.city("Newark", "plc-americas/northern-america/united-states/new-jersey/newark", "plc-americas/northern-america/united-states/new-jersey"),
    query_builder.city("Seattle", "plc-americas/northern-america/united-states/washington/seattle", "plc-americas/northern-america/united-states/washington"),
    query_builder.city("Boston", "plc-americas/northern-america/united-states/massachusetts/boston", "plc-americas/northern-america/united-states/massachusetts"),
    query_builder.city("Santa Fe", "plc-americas/northern-america/united-states/new-mexico/santa-fe", "plc-americas/northern-america/united-states/new-mexico"),
    query_builder.city("Albuquerque", "plc-americas/northern-america/united-states/new-mexico/albuquerque", "plc-americas/northern-america/united-states/new-mexico"),
    query_builder.city("Kansas City", "plc-americas/northern-america/united-states/missouri/kansas-city", "plc-americas/northern-america/united-states/missouri"),
    query_builder.region("Europe", "plc-europe"),
    query_builder.region("Northern Europe", "plc-europe/northern-europe", "plc-europe"),
    query_builder.country("United Kingdom", "plc-europe/northern-europe/united-kingdom", "plc-europe/northern-europe", ["English"]),
    query_builder.city("London", "plc-europe/northern-europe/united-kingdom/london", "plc-europe/northern-europe/united-kingdom"),
    query_builder.city("Bristol", "plc-europe/northern-europe/united-kingdom/bristol", "plc-europe/northern-europe/united-kingdom"),
    query_builder.city("Liverpool", "plc-europe/northern-europe/united-kingdom/liverpool", "plc-europe/northern-europe/united-kingdom"),
    query_builder.country("Canada", "plc-americas/northern-america/canada", "plc-americas/northern-america", ["English", "French"]),
    query_builder.state("Ontario", "plc-americas/northern-america/canada/ontario", "plc-americas/northern-america/canada"),
    query_builder.state("Quebec", "plc-americas/northern-america/canada/quebec", "plc-americas/northern-america/canada"),
    query_builder.city("Toronto", "plc-americas/northern-america/canada/ontario/toronto", "plc-americas/northern-america/canada/ontario"),
    query_builder.city("Quebec City", "plc-americas/northern-america/canada/quebec/quebec-city", "plc-americas/northern-america/canada/quebec"),
    query_builder.city("Montreal", "plc-americas/northern-america/canada/quebec/montreal", "plc-americas/northern-america/canada/quebec"),
]

with open("resources/landmarks.txt", "r") as resources_file:
    for line in resources_file:
        queries.append(query_builder.landmark(line.strip()))

with open("resources/bios.txt", "r") as resource_file:
    for bio in resource_file:
        queries.append(query_builder.person(bio.strip()))

with open("resources/organisations.json", "r") as resource_file:
    organisations: list[dict[str, Any]] = load(resource_file)

    for organisation in organisations:
        queries.append(query_builder.organisation(
            organisation_type=OrganisationType(organisation["type"]),
            name=organisation["name"],
            bio=organisation["bio"],
            tags=organisation["tags"],
        ))

with open("resources/groups.json", "r") as resource_file:
    groups: list[dict[str, Any]] = load(resource_file)

    for group in groups:
        queries.append(query_builder.group(
            name=group["name"],
            bio=group["bio"],
            tags=group["tags"],
        ))

for _ in range(30):
    queries.append(query_builder.education())
    queries.append(query_builder.employment())

for _ in range(50):
    queries.append(query_builder.group_membership())

for _ in range(200):
    queries.append(query_builder.social_relation())

with open("resources/conversations/index.json", "r") as index_file:
    conversation_index: list[dict[str, Any]] = load(index_file)

    for entry in conversation_index:
        conv = entry["ref"]
        path = f"resources/conversations/{conv}.json"
        post_type = PostType[entry["type"].upper()]
        posting_type = entry["posting_type"]

        if entry["page_name"] == "":
            page_name: str | None = None
        else:
            page_name = entry["page_name"]

        if entry["location_name"] == "":
            location_name: str | None = None
        else:
            location_name = entry["location_name"]

        with open(path, "r") as resource_file:
            json_rep: dict[str, Any] = load(resource_file)
            conversation = Conversation.from_json(json_rep, post_type)
            queries += query_builder.conversation(
                conversation=conversation,
                posting_type=posting_type,
                page_name=page_name,
                location_name=location_name,
            )

queries.append(query_builder.relationship_statuses())

for _ in range(1000):
    queries.append(query_builder.reaction())

for _ in range(120):
    queries.append(query_builder.response())

queries.append(query_builder.relation_followings())
queries.append(query_builder.member_followings())

for _ in range(100):
    queries.append(query_builder.random_following())

queries.append(query_builder.content_subscriptions())
queries.append(query_builder.participant_viewings())
queries.append(query_builder.reaction_viewings())
queries.append(query_builder.response_viewings())

for _ in range(500):
    queries.append(query_builder.random_viewing())

queries.append("# badge\n" + " ".join((
    f"""match""",
    f"""$profile isa profile;""",
    f"""$profile has id "SarahGiven225";""",
    f"""$group isa group;""",
    f"""$group has id "grp-3acaaf82374a4cc9a0397e67926146de";""",
    f"""$membership (group: $group, member: $profile) isa group-membership;""",
    f"""insert""",
    f"""$membership has badge "top voice";""",
)))


with open("queries.tql", "w") as output_file:
    for query in queries:
        output_file.write("\n")
        output_file.write(query)
