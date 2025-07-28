package com.Backend.features.feed.dto;

public class PostDto {

    private String picture = null;
    private String content;


    public String getContent() {
        return content;
    }

    public PostDto(String picture, String content) {
        this.picture = picture;
        this.content = content;
    }
    public PostDto() {
          }
    public void setContent(String content) {
        this.content = content;
    }

    public String getPicture() {
        return picture;
    }

    public void setPicture(String picture) {
        this.picture = picture;
    }
}
