package com.Backend.features.stories.service;

import com.Backend.features.stories.story.Story;
import com.Backend.features.stories.story.StoryReaction;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface StoryService {
    List<Story> getAllStories();
    Story getStory(Long storyId) throws Exception;
    Story createStory(MultipartFile picture, String content, Long userId) throws Exception;
    Story updateStory(Long storyId, MultipartFile picture, String content, Long userId) throws Exception;
    void deleteStory(Long storyId, Long userId) throws Exception;
    Story reactToStory(Long storyId, Long userId, String emoji) throws Exception;
    List<StoryReaction> getReactionsByStoryId(Long storyId);
}
