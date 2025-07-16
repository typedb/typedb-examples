package com.example.backendjava;

public class Page {
    private String id;
    private String name;
    private String bio;
    private String profilePicture;
    private String type;

    public Page(String id, String name, String bio, String profilePicture, String type) {
        this.id = id;
        this.name = name;
        this.bio = bio;
        this.profilePicture = profilePicture;
        this.type = type;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getBio() { return bio; }
    public String getProfilePicture() { return profilePicture; }
    public String getType() { return type; }

    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setBio(String bio) { this.bio = bio; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    public void setType(String type) { this.type = type; }
} 
