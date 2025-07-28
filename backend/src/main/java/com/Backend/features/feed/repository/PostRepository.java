package com.Backend.features.feed.repository;

import com.Backend.features.feed.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface PostRepository extends JpaRepository<Post,Long> {
    public List<Post> findAllByOrderByCreationDateDesc() ;

    List<Post> findByAuthorId(Long userId);
    @Query("SELECT DISTINCT p FROM posts p " +
            "LEFT JOIN FETCH p.author " +
            "LEFT JOIN FETCH p.likes " +
            "LEFT JOIN FETCH p.comments " +
            "ORDER BY p.creationDate DESC")
    List<Post> getAllPostsWithAuthorAndLikesAndComments();

    List<Post> findByAuthorIdInOrderByCreationDateDesc(Set<Long> connectedUserIds);
}
