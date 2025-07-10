from enum import Enum
from random import Random


class TimestampFormat(Enum):
    DATE = "YYYY-MM-DD"
    DATETIME = "YYYY-MM-DDTHH:MM:SS"
    PRECISE_DATETIME = "YYYY-MM-DDTHH:MM:SS.FFF"


class BookType(Enum):
    PAPERBACK = "paperback"
    HARDBACK = "hardback"
    EBOOK = "ebook"


class ParentPlaceType(Enum):
    STATE = "state"
    COUNTRY = "country"


class ContributorRole(Enum):
    AUTHOR = "author"
    EDITOR = "editor"
    ILLUSTRATOR = "illustrator"
    CONTRIBUTOR = "contributor"

    def relation_type(self) -> str:
        if self is ContributorRole.AUTHOR:
            return "authoring"
        elif self is ContributorRole.EDITOR:
            return "editing"
        elif self is ContributorRole.ILLUSTRATOR:
            return "illustrating"
        elif self is ContributorRole.CONTRIBUTOR:
            return "contribution"


class OrderStatus(Enum):
    PAID = "paid"
    DISPATCHED = "dispatched"
    DELIVERED = "delivered"
    RETURNED = "returned"
    CANCELED = "canceled"


class QueryBuilder:
    _user_id_prefix = "u"
    _order_id_prefix = "o"
    _review_id_prefix = "r"
    _id_digits = 4
    _random_login_fail_percentage = 10
    _courier_names = ("UPS", "FedEx", "DHL")

    def __init__(self):
        self._user_count = 0
        self._order_count = 0
        self._review_count = 0
        self._random = Random(0)
        self._isbn_13s = list()

    def _get_new_user_id(self) -> str:
        assert self._user_count < 10 ** self._id_digits - 1
        self._user_count += 1
        return self._user_id_prefix + str(self._user_count).zfill(self._id_digits)

    def _get_random_user_id(self) -> str:
        assert self._user_count > 0
        user_number = self._random.randint(1, self._user_count)
        return self._user_id_prefix + str(user_number).zfill(self._id_digits)

    def _get_new_order_id(self) -> str:
        assert self._order_count < 10 ** self._id_digits - 1
        self._order_count += 1
        return self._order_id_prefix + str(self._order_count).zfill(self._id_digits)

    def _get_random_order_id(self) -> str:
        assert self._order_count > 0
        order_number = self._random.randint(1, self._order_count)
        return self._order_id_prefix + str(order_number).zfill(self._id_digits)

    def _get_new_review_id(self) -> str:
        assert self._review_count < 10 ** self._id_digits - 1
        self._review_count += 1
        return self._review_id_prefix + str(self._review_count).zfill(self._id_digits)

    def _get_random_review_id(self) -> str:
        assert self._review_count > 0
        review_number = self._random.randint(1, self._review_count)
        return self._review_id_prefix + str(review_number).zfill(self._id_digits)

    def _get_random_isbn_13(self) -> str:
        assert len(self._isbn_13s) > 0
        return self._random.choice(self._isbn_13s)

    def _get_random_timestamp(
            self,
            timestamp_format: TimestampFormat,
            start_year: int = 2020,
            end_year: int = 2023
    ) -> str:
        year = self._random.randint(start_year, end_year)
        month = self._random.randint(1, 12)

        if month == 2:
            if year % 4:
                if year % 100:
                    if year % 400:
                        max_day = 29
                    else:
                        max_day = 28
                else:
                    max_day = 29
            else:
                max_day = 28
        elif month in (4, 6, 9, 11):
            max_day = 30
        else:
            max_day = 31

        day = self._random.randint(1, max_day)
        hour = self._random.randint(0, 23)
        minute = self._random.randint(0, 59)
        second = self._random.randint(0, 59)
        milliseconds = self._random.randint(0, 999)
        date = f"{str(year).zfill(4)}-{str(month).zfill(2)}-{str(day).zfill(2)}"
        time = f"{str(hour).zfill(2)}:{str(minute).zfill(2)}:{str(second).zfill(2)}"

        match timestamp_format:
            case TimestampFormat.DATE:
                return date
            case TimestampFormat.DATETIME:
                return f"{date}T{time}"
            case TimestampFormat.PRECISE_DATETIME:
                return f"{date}T{time}.{str(milliseconds).zfill(3)}"

    def _get_random_order_status(self) -> OrderStatus:
        return self._random.choice(tuple(status for status in OrderStatus))

    def _get_random_login_success(self) -> bool:
        if self._random.randint(1, 100) <= self._random_login_fail_percentage:
            return False
        else:
            return True

    def _get_random_courier_name(self):
        return self._random.choice(self._courier_names)

    def country(self, name: str) -> str:
        queries = "# country\n" + " ".join((
            f"""insert""",
            f"""$country isa country;""",
            f"""$country has name "{name}";""",
            f"""end;""",
        ))

        return queries

    def state(self, name: str, country_name: str) -> str:
        queries = "# state\n" + " ".join((
            f"""match""",
            f"""$country isa country;""",
            f"""$country has name "{country_name}";""",
            f"""insert""",
            f"""$state isa state;""",
            f"""$state has name "{name}";""",
            f"""locating (location: $country, located: $state);""",
            f"""end;""",
        ))

        return queries

    def city(self, name: str, parent_type: ParentPlaceType, parent_name: str) -> str:
        queries = "# city\n" + " ".join((
            f"""match""",
            f"""${parent_type.value} isa {parent_type.value};""",
            f"""${parent_type.value} has name "{parent_name}";""",
            f"""insert""",
            f"""$city isa city;""",
            f"""$city has name "{name}";""",
            f"""locating (location: ${parent_type.value}, located: $city);""",
            f"""end;""",
        ))

        return queries

    def _book(
            self,
            book_type: BookType,
            isbn_13: str,
            title: str,
            page_count: int,
            price: str,
            genres: list[str],
            contributors: list[tuple[str, ContributorRole]],
            publisher_name: str,
            publication_year: int,
            publication_city: str,
            isbn_10: str | None,
            stock: int | None,
    ) -> str:
        self._isbn_13s.append(isbn_13)

        if stock is None:
            stock = self._random.randint(0, 20)

        queries = "# book\n" + " ".join((
            f"""insert""",
            f"""$book isa {book_type.value};""",
            f"""$book has isbn-13 "{isbn_13}";""",
            f"""$book has title "{title}";""",
            f"""$book has page-count {page_count};""",
            f"""$book has price {price};""",
        ))

        for genre in genres:
            queries += f""" $book has genre "{genre}";"""

        if isbn_10 is not None:
            queries += f""" $book has isbn-10 "{isbn_10}";"""

        if book_type in (BookType.PAPERBACK, BookType.HARDBACK):
            queries += f""" $book has stock {stock};"""

        queries += f"""end;"""

        for contributor in contributors:
            contributor_name = contributor[0]
            contributor_role = contributor[1]

            queries += "\n" + " ".join((
                f"""match""",
                f"""$contributor-type label contributor;""",
                f"""not {{""",
                f"""$contributor isa $contributor-type;""",
                f"""$contributor has name "{contributor_name}";""",
                f"""}};""",
                f"""insert""",
                f"""$contributor isa $contributor-type;""",
                f"""$contributor has name "{contributor_name}";""",
                f"""end;""",
            ))

            queries += "\n" + " ".join((
                f"""match""",
                f"""$book isa {book_type.value};""",
                f"""$book has isbn-13 "{isbn_13}";""",
                f"""$contributor isa contributor;""",
                f"""$contributor has name "{contributor_name}";""",
                f"""insert""",
                f"""{contributor_role.relation_type()} (work: $book, {contributor_role.value}: $contributor);""",
                f"""end;""",
            ))

        queries += "\n" + " ".join((
            f"""match""",
            f"""$publisher-type label publisher;""",
            f"""not {{""",
            f"""$publisher isa $publisher-type;""",
            f"""$publisher has name "{publisher_name}";""",
            f"""}};""",
            f"""insert""",
            f"""$publisher isa $publisher-type;""",
            f"""$publisher has name "{publisher_name}";""",
            f"""end;""",
        ))

        queries += "\n" + " ".join((
            f"""match""",
            f"""$book isa {book_type.value};""",
            f"""$book has isbn-13 "{isbn_13}";""",
            f"""$publisher isa publisher;""",
            f"""$publisher has name "{publisher_name}";""",
            f"""$city isa city;""",
            f"""$city has name "{publication_city}";""",
            f"""insert""",
            f"""$publication isa publication;""",
            f"""$publication has year {publication_year};""",
            f"""publishing (published: $book, publisher: $publisher, publication: $publication);""",
            f"""locating (location: $city, located: $publication);""",
            f"""end;""",
        ))

        return queries

    def paperback(
            self,
            isbn_13: str,
            title: str,
            page_count: int,
            price: str,
            genres: list[str],
            contributors: list[tuple[str, ContributorRole]],
            publisher_name: str,
            publication_year: int,
            publication_city: str,
            isbn_10: str = None,
            stock: int = None,
    ) -> str:
        return self._book(
            BookType.PAPERBACK,
            isbn_13,
            title,
            page_count,
            price,
            genres,
            contributors,
            publisher_name,
            publication_year,
            publication_city,
            isbn_10,
            stock,
        )

    def hardback(
            self,
            isbn_13: str,
            title: str,
            page_count: int,
            price: str,
            genres: list[str],
            contributors: list[tuple[str, ContributorRole]],
            publisher_name: str,
            publication_year: int,
            publication_city: str,
            isbn_10: str = None,
            stock: int = None,
    ) -> str:
        return self._book(
            BookType.HARDBACK,
            isbn_13,
            title,
            page_count,
            price,
            genres,
            contributors,
            publisher_name,
            publication_year,
            publication_city,
            isbn_10,
            stock,
        )

    def ebook(
            self,
            isbn_13: str,
            title: str,
            page_count: int,
            price: str,
            genres: list[str],
            contributors: list[tuple[str, ContributorRole]],
            publisher_name: str,
            publication_year: int,
            publication_city: str,
            isbn_10: str = None,
    ) -> str:
        return self._book(
            BookType.EBOOK,
            isbn_13,
            title,
            page_count,
            price,
            genres,
            contributors,
            publisher_name,
            publication_year,
            publication_city,
            isbn_10,
            None,
        )

    def promotion(self, code: str, name: str, start_timestamp: str, end_timestamp: str, promotion_inclusions: list[tuple[str, str]]) -> str:

        queries = "# promotion\n" + " ".join((
            f"""insert""",
            f"""$promotion isa promotion;""",
            f"""$promotion has code "{code}";""",
            f"""$promotion has name "{name}";""",
            f"""$promotion has start-timestamp {start_timestamp};""",
            f"""$promotion has end-timestamp {end_timestamp};""",
            f"""end;""",
        ))

        for inclusion in promotion_inclusions:
            book_isbn_13 = inclusion[0]
            discount = inclusion[1]

            queries += "\n" + " ".join((
                f"""match""",
                f"""$book isa book;""",
                f"""$book has isbn-13 "{book_isbn_13}";""",
                f"""$promotion isa promotion;""",
                f"""$promotion has name "{name}";""",
                f"""insert""",
                f"""$inclusion isa promotion-inclusion, links (promotion: $promotion, item: $book);""",
                f"""$inclusion has discount {discount};""",
                f"""end;""",
            ))

        return queries

    def user(self, name: str, city_name: str, birth_date: str = None) -> str:
        if birth_date is None:
            birth_date = self._get_random_timestamp(TimestampFormat.DATE, start_year=1950, end_year=1999)

        user_id = self._get_new_user_id()

        queries = "# user\n" + " ".join((
            f"""match""",
            f"""$city isa city;""",
            f"""$city has name "{city_name}";""",
            f"""insert""",
            f"""$user isa user;""",
            f"""$user has id "{user_id}";""",
            f"""$user has name "{name}";""",
            f"""$user has birth-date {birth_date};""",
            f"""locating (location: $city, located: $user);""",
            f"""end;""",
        ))

        return queries

    def order(
            self,
            address_street: str,
            city_name: str,
            order_lines: list[tuple[str, int]] | list[int],
            status: OrderStatus = None,
            courier_name: str = None,
            execution_timestamp: str = None,
            user_id: str = None,
    ) -> str:
        order_id = self._get_new_order_id()

        if type(order_lines[0]) is int:
            book_quantities = dict()

            for quantity in order_lines:
                book_isbn_13 = self._get_random_isbn_13()

                if book_isbn_13 in book_quantities.keys():
                    book_quantities[book_isbn_13] += quantity
                else:
                    book_quantities[book_isbn_13] = quantity

            order_lines = [(book_isbn_13, line_quantity) for book_isbn_13, line_quantity in book_quantities.items()]

        if status is None:
            status = self._get_random_order_status()

        if courier_name is None:
            courier_name = self._get_random_courier_name()

        if execution_timestamp is None:
            execution_timestamp = self._get_random_timestamp(TimestampFormat.PRECISE_DATETIME)

        if user_id is None:
            user_id = self._get_random_user_id()

        queries = "# order\n" + " ".join((
            f"""match""",
            f"""$courier-type label courier;""",
            f"""not {{""",
            f"""$courier isa $courier-type;""",
            f"""$courier has name "{courier_name}";""",
            f"""}};""",
            f"""insert""",
            f"""$courier isa $courier-type;""",
            f"""$courier has name "{courier_name}";""",
            f"""end;""",
        ))

        queries += "\n" + " ".join((
            f"""match""",
            f"""$city isa city;""",
            f"""$city has name "{city_name}";""",
            f"""not {{""",
            f"""$address isa address;""",
            f"""$address has street "{address_street}";""",
            f"""locating (location: $city, located: $address);""",
            f"""}};""",
            f"""insert""",
            f"""$address isa address;""",
            f"""$address has street "{address_street}";""",
            f"""locating (location: $city, located: $address);""",
            f"""end;""",
        ))

        queries += "\n" + " ".join((
            f"""match""",
            f"""$user isa user;""",
            f"""$user has id "{user_id}";""",
            f"""$courier isa courier;""",
            f"""$courier has name "{courier_name}";""",
            f"""$city isa city;""",
            f"""$city has name "{city_name}";""",
            f"""$address isa address;""",
            f"""$address has street "{address_street}";""",
            f"""locating (location: $city, located: $address);""",
            f"""insert""",
            f"""$order isa order;""",
            f"""$order has id "{order_id}";""",
            f"""$order has status "{status.value}";""",
            f"""$execution isa action-execution, links (action: $order, executor: $user);""",
            f"""$execution has timestamp {execution_timestamp};""",
            f"""delivery (delivered: $order, deliverer: $courier, destination: $address);""",
            f"""end;""",
        ))

        for line in order_lines:
            book_isbn_13 = line[0]
            line_quantity = line[1]

            queries += "\n" + " ".join((
                f"""match""",
                f"""$order isa order;""",
                f"""$order has id "{order_id}";""",
                f"""$book isa book;""",
                f"""$book has isbn-13 "{book_isbn_13}";""",
                f"""insert""",
                f"""$line isa order-line, links (order: $order, item: $book);""",
                f"""$line has quantity {line_quantity};""",
                f"""end;""",
            ))

        return queries

    def review(self, score: int, execution_timestamp: str = None, book_isbn_13: str = None, user_id: str = None) -> str:
        review_id = self._get_new_review_id()

        if execution_timestamp is None:
            execution_timestamp = self._get_random_timestamp(TimestampFormat.PRECISE_DATETIME)

        if book_isbn_13 is None:
            book_isbn_13 = self._get_random_isbn_13()

        if user_id is None:
            user_id = self._get_random_user_id()

        queries = "# review\n" + " ".join((
            f"""match""",
            f"""$book isa book;""",
            f"""$book has isbn-13 "{book_isbn_13}";""",
            f"""$user isa user;""",
            f"""$user has id "{user_id}";""",
            f"""insert""",
            f"""$review isa review;""",
            f"""$review has id "{review_id}";""",
            f"""$review has score {score};""",
            f"""rating (review: $review, rated: $book);""",
            f"""$execution isa action-execution, links (action: $review, executor: $user);""",
            f"""$execution has timestamp {execution_timestamp};""",
            f"""end;""",
        ))

        return queries

    def login(self, success: bool = None, execution_timestamp: str = None, user_id: str = None) -> str:
        if success is None:
            success = self._get_random_login_success()

        if execution_timestamp is None:
            execution_timestamp = self._get_random_timestamp(TimestampFormat.PRECISE_DATETIME)

        if user_id is None:
            user_id = self._get_random_user_id()

        queries = "# login\n" + " ".join((
            f"""match""",
            f"""$user isa user;""",
            f"""$user has id "{user_id}";""",
            f"""insert""",
            f"""$login isa login;""",
            f"""$login has success {str(success).lower()};""",
            f"""$execution isa action-execution, links (action: $login, executor: $user);""",
            f"""$execution has timestamp {execution_timestamp};""",
            f"""end;""",
        ))

        return queries
