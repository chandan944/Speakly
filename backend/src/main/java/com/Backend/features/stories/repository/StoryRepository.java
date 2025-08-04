package com.Backend.features.stories.repository;

import com.Backend.features.stories.story.Story;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface StoryRepository  extends JpaRepository<Story ,Long> {



    @Transactional(readOnly = true)
    @Query("SELECT s FROM Story s LEFT JOIN FETCH s.reactions ORDER BY s.createdAt DESC")
    List<Story> findAllByOrderByCreatedAtDesc();

    @Transactional(readOnly = true)
    @Query("SELECT s FROM Story s LEFT JOIN FETCH s.reactions WHERE s.user.id = :userId ORDER BY s.createdAt DESC")
    List<Story> findByUserId(@Param("userId") Long userId);
}
