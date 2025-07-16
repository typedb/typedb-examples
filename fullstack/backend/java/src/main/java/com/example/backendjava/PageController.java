package com.example.backendjava;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;

import com.typedb.driver.api.Driver;
import com.typedb.driver.api.Transaction;
import com.typedb.driver.api.answer.JSON;

import org.springframework.beans.factory.annotation.Autowired;

class CreateUserPayload {
    public String username;
    public String name;
    public String profile_picture;
    public String badge;
    public boolean is_active;
    public String gender;
    public String language;
    public String email;
    public String phone;
    public String relationship_status;
    public boolean can_publish;
    public String page_visibility;
    public String post_visibility;
    public String bio;
}

class CreateGroupPayload {
    public String group_id;
    public String name;
    public String profile_picture;
    public String badge;
    public boolean is_active;
    public java.util.List<String> tags;
    public String page_visibility;
    public String post_visibility;
    public String bio;
}

class CreateOrganizationPayload {
    public String username;
    public String name;
    public String profile_picture;
    public String badge;
    public boolean is_active;
    public boolean can_publish;
    public java.util.List<String> tags;
    public String bio;
}

class Post {
    public String postId;
    public String postText;
    public String authorName;
    public String authorId;
    public String authorType;
    public String postVisibility;
    public String creationTimestamp;
    public Post(String postId, String postText, String authorName, String authorId, String authorType, String postVisibility, String creationTimestamp) {
        this.postId = postId;
        this.postText = postText;
        this.authorName = authorName;
        this.authorId = authorId;
        this.authorType = authorType;
        this.postVisibility = postVisibility;
        this.creationTimestamp = creationTimestamp;
    }
}

class Comment {
    public String commentId;
    public String commentText;
    public String authorName;
    public String authorId;
    public String authorType;
    public String creationTimestamp;
    public Comment(String commentId, String commentText, String authorName, String authorId, String authorType, String creationTimestamp) {
        this.commentId = commentId;
        this.commentText = commentText;
        this.authorName = authorName;
        this.authorId = authorId;
        this.authorType = authorType;
        this.creationTimestamp = creationTimestamp;
    }
}

@RestController
public class PageController {
    private final Driver driver;

    @Autowired
    public PageController(Driver driver) {
        this.driver = driver;
    }

    @GetMapping(value = "/api/pages", produces = "application/json")
    public String getPages() {
        try (Transaction tx = driver.transaction("social-network", Transaction.Type.READ)) {
            return tx.query(Query.PAGE_LIST_QUERY).resolve().asConceptDocuments().stream().map(JSON::toString).collect(Collectors.toList()).toString();
        }
    }

    @GetMapping(value = "/api/location/{placeId}", produces = "application/json")
    public String getPagesByLocation(@PathVariable String placeId) {
        try (Transaction tx = driver.transaction("social-network", Transaction.Type.READ)) {
            return tx.query(Query.locationQuery(placeId)).resolve().asConceptDocuments().stream().map(JSON::toString).collect(Collectors.toList()).toString();
        }
    }

    @GetMapping(value = "/api/user/{id}", produces = "application/json")
    public String getUser(@PathVariable String id) {
        try (Transaction tx = driver.transaction("social-network", Transaction.Type.READ)) {
            return tx.query(Query.pageQuery(id)).resolve().asConceptDocuments().stream().map(JSON::toString).findFirst().orElse(null);
        }
    }

    @GetMapping(value = "/api/group/{id}", produces = "application/json")
    public String getGroup(@PathVariable String id) {
        try (Transaction tx = driver.transaction("social-network", Transaction.Type.READ)) {
            return tx.query(Query.pageQuery(id)).resolve().asConceptDocuments().stream().map(JSON::toString).findFirst().orElse(null);
        }
    }

    @GetMapping(value = "/api/organization/{id}", produces = "application/json")
    public String getOrganization(@PathVariable String id) {
        try (Transaction tx = driver.transaction("social-network", Transaction.Type.READ)) {
            return tx.query(Query.pageQuery(id)).resolve().asConceptDocuments().stream().map(JSON::toString).findFirst().orElse(null);
        }
    }

    @GetMapping(value = "/api/posts", produces = "application/json")
    public String getPosts(@RequestParam String pageId) {
        try (Transaction tx = driver.transaction("social-network", Transaction.Type.READ)) {
            return tx.query(Query.postsQuery(pageId)).resolve().asConceptDocuments().stream().map(JSON::toString).collect(Collectors.toList()).toString();
        }
    }

    @GetMapping(value = "/api/comments", produces = "application/json")
    public String getComments(@RequestParam String postId) {
        try (Transaction tx = driver.transaction("social-network", Transaction.Type.READ)) {
            return tx.query(Query.commentsQuery(postId)).resolve().asConceptDocuments().stream().map(JSON::toString).collect(Collectors.toList()).toString();
        }
    }

    @PostMapping(value = "/api/create-user", produces = "application/json")
    public ResponseEntity<?> createUser(@RequestBody CreateUserPayload payload) {
        try (Transaction tx = driver.transaction("social-network", Transaction.Type.WRITE)) {
            System.out.println(Query.createUserQuery(payload));
            tx.query(Query.createUserQuery(payload)).resolve();
            tx.commit();
            return ResponseEntity.ok().body("null");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping(value = "/api/create-group", produces = "application/json")
    public ResponseEntity<?> createGroup(@RequestBody CreateGroupPayload payload) {
        try (Transaction tx = driver.transaction("social-network", Transaction.Type.WRITE)) {
            tx.query(Query.createGroupQuery(payload)).resolve();
            tx.commit();
            return ResponseEntity.ok().body("null");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping(value = "/api/create-organization", produces = "application/json")
    public ResponseEntity<?> createOrganization(@RequestBody CreateOrganizationPayload payload) {
        try (Transaction tx = driver.transaction("social-network", Transaction.Type.WRITE)) {
            tx.query(Query.createOrganizationQuery(payload)).resolve();
            tx.commit();
            return ResponseEntity.ok().body("null");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
} 
