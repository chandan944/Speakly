package com.Backend.features.stories.controller;

import com.Backend.dto.Response;
import com.Backend.features.authentication.model.User;
import com.Backend.features.stories.story.Story;
import com.Backend.features.stories.story.StoryReaction;
import com.Backend.features.stories.service.StoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/story")
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    // ✅ GET: All stories (public)
    @GetMapping
    public ResponseEntity<List<Story>> getAllStories() {
        List<Story> stories = storyService.getAllStories();
        return ResponseEntity.ok(stories);
    }

    // ✅ GET: Single story by ID
    @GetMapping("/{storyId}")
    public ResponseEntity<Story> getStory(@PathVariable Long storyId) throws Exception {
        Story story = storyService.getStory(storyId);
        return ResponseEntity.ok(story);
    }

    // ✅ POST: Create a new story
    @PostMapping
    public ResponseEntity<Story> createStory(
            @RequestParam(value = "picture", required = false) MultipartFile picture,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestAttribute("authenticatedUser") User user) throws Exception {
        Story story = storyService.createStory(picture,title, content, user.getId());
        return ResponseEntity.ok(story);
    }

    // ✅ PUT: Update story (only owner)
    @PutMapping("/{storyId}")
    public ResponseEntity<Story> updateStory(
            @PathVariable Long storyId,
            @RequestParam(value = "picture", required = false) MultipartFile picture,
            @RequestParam(value = "content", required = false) String content,
            @RequestAttribute("authenticatedUser") User user) throws Exception {
        Story updatedStory = storyService.updateStory(storyId, picture, content, user.getId());
        return ResponseEntity.ok(updatedStory);
    }

    // ✅ DELETE: Delete story (only owner)
    @DeleteMapping("/{storyId}")
    public ResponseEntity<Response> deleteStory(
            @PathVariable Long storyId,
            @RequestAttribute("authenticatedUser") User user) throws Exception {
        storyService.deleteStory(storyId, user.getId());
        return ResponseEntity.ok(new Response("Story deleted successfully"));
    }

    // ✅ POST: React to story with emoji (like WhatsApp)
    // CHANGE FROM @RequestBody to @RequestParam
    @PostMapping("/{storyId}/react")
    public ResponseEntity<Story> reactToStory(
            @PathVariable Long storyId,
            @RequestParam("emoji") String emoji, // ← This matches the error message
            @RequestAttribute("authenticatedUser") User user) throws Exception {

        if (emoji == null || emoji.isEmpty()) {
            throw new IllegalArgumentException("Emoji is required");
        }

        Story story = storyService.reactToStory(storyId, user.getId(), emoji);
        return ResponseEntity.ok(story);
    }

    // ✅ GET: Get all reactions for a story
    @GetMapping("/{storyId}/reactions")
    public ResponseEntity<List<StoryReaction>> getReactions(@PathVariable Long storyId) {
        List<StoryReaction> reactions = storyService.getReactionsByStoryId(storyId);
        return ResponseEntity.ok(reactions);
    }
}