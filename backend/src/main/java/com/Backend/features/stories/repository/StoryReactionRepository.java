package com.Backend.features.stories.repository;


import com.Backend.features.stories.story.StoryReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StoryReactionRepository extends JpaRepository<StoryReaction, Long> {
    List<StoryReaction> findByStoryId(@Param("storyId") Long storyId);

    Optional<StoryReaction> findByStoryIdAndUserId(@Param("storyId") Long storyId, @Param("userId") Long userId);
}
