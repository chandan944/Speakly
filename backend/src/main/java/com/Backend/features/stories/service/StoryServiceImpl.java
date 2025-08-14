package com.Backend.features.stories.service;


import com.Backend.features.authentication.model.User;
import com.Backend.features.authentication.repository.UserRepository;

import com.Backend.features.storage.service.StorageService;
import com.Backend.features.stories.repository.StoryReactionRepository;
import com.Backend.features.stories.repository.StoryRepository;

import com.Backend.features.stories.story.Story;
import com.Backend.features.stories.story.StoryReaction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
@Service
@Transactional
public class StoryServiceImpl implements StoryService {

    private final StoryRepository storyRepository;
    private final StoryReactionRepository reactionRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    public StoryServiceImpl(StoryRepository storyRepository,
                            StoryReactionRepository reactionRepository,
                            UserRepository userRepository,
                            StorageService storageService) {
        this.storyRepository = storyRepository;
        this.reactionRepository = reactionRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Story> getAllStories() {
        return storyRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public Story getStory(Long storyId) throws Exception {
        return storyRepository.findById(storyId)
                .orElseThrow(() -> new Exception("Story not found"));
    }

    @Override
    public Story createStory(MultipartFile picture,String title, String content, Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        Story story = new Story();
        story.setContent(content);
        story.setTitle(title);
        story.setUser(user);

        if (picture != null && !picture.isEmpty()) {
            String imageUrl = storageService.saveImage(picture);
            story.setImageUrl(imageUrl);
        }

        return storyRepository.save(story);
    }

    @Override
    public Story updateStory(Long storyId, MultipartFile picture, String content, Long userId) throws Exception {
        Story story = getStory(storyId);
        if (!story.getUser().getId().equals(userId)) {
            throw new Exception("You don't have permission to edit this story");
        }

        if (content != null) story.setContent(content);

        if (picture != null && !picture.isEmpty()) {
            String imageUrl = storageService.saveImage(picture);
            story.setImageUrl(imageUrl);
        }

        return storyRepository.save(story);
    }

    @Override
    public void deleteStory(Long storyId, Long userId) throws Exception {
        Story story = getStory(storyId);
        if (!story.getUser().getId().equals(userId)) {
            throw new Exception("You don't have permission to delete this story");
        }
        storyRepository.delete(story);
    }

    @Override
    public Story reactToStory(Long storyId, Long userId, String emoji) throws Exception {
        Story story = getStory(storyId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        // Check if user already reacted
        Optional<StoryReaction> existing = reactionRepository.findByStoryIdAndUserId(storyId, userId);
        if (existing.isPresent()) {
            // Update existing reaction
            StoryReaction reaction = existing.get();
            reaction.setEmoji(emoji);
            reactionRepository.save(reaction);
        } else {
            // Create new reaction
            StoryReaction reaction = new StoryReaction();
            reaction.setStory(story);
            reaction.setUser(user);
            reaction.setEmoji(emoji);
            reactionRepository.save(reaction);
        }

        // Return story with eager-loaded reactions
        return getStory(storyId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StoryReaction> getReactionsByStoryId(Long storyId) {
        return reactionRepository.findByStoryId(storyId);
    }
}