package com.Backend.features.feed.service;

import com.Backend.features.authentication.model.User;
import com.Backend.features.authentication.repository.UserRepository;
import com.Backend.features.feed.model.Comment;
import com.Backend.features.feed.model.Post;
import com.Backend.features.feed.repository.CommentRepository;
import com.Backend.features.feed.repository.PostRepository;
import com.Backend.features.network.model.Connection;
import com.Backend.features.network.model.Status;
import com.Backend.features.network.repository.ConnectionRepository;
import com.Backend.features.notifications.service.NotificationService;
import com.Backend.features.storage.service.StorageService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@Service
public class FeedService {


    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final NotificationService notificationService;
   private final ConnectionRepository connectionRepository;
    public FeedService(PostRepository postRepository, CommentRepository commentRepository, UserRepository userRepository, StorageService storageService, NotificationService notificationService, ConnectionRepository connectionRepository) {

        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.notificationService = notificationService;
        this.connectionRepository = connectionRepository;
    }

    public List<Post> getFeedPosts(Long id) {
        List<Connection> connections = connectionRepository.findByAuthorIdAndStatusOrRecipientIdAndStatus(
                id, Status.ACCEPTED, id,Status.ACCEPTED
        );
        Set<Long> connectedUserIds = connections.stream()
                .map(connection -> connection.getAuthor().getId().equals(id)
                        ? connection.getRecipient().getId()
                        : connection.getAuthor().getId())
                .collect(Collectors.toSet());

        return postRepository.findByAuthorIdInOrderByCreationDateDesc(connectedUserIds);
    }

    public List<Post> getAllPosts() {
        return postRepository.getAllPostsWithAuthorAndLikesAndComments();
    }

    public Post createPost(MultipartFile picture, String content, Long id) throws Exception {
        User author =userRepository.findById(id).orElseThrow(()-> new IllegalArgumentException("User Not Found!"));



        Post post = new Post(content , author);
        if (picture != null && !picture.isEmpty()) {
            String pictureUrl = storageService.saveImage(picture);
            post.setPicture(pictureUrl);
        }
        post.setLikes(new HashSet<>());
        notificationService.sendNewPostNotificationToFeed(post);
        return postRepository.save(post);
    }

    public Post getPost(Long postId) {
        return postRepository.findById(postId).orElseThrow(()-> new IllegalArgumentException("Post not Found!"));
    }

    public Post editPost(Long postId, Long id, MultipartFile picture, String content) throws Exception {
        Post post = postRepository.findById(postId).orElseThrow(()-> new IllegalArgumentException("post Not Found!"));
        User user =userRepository.findById(id).orElseThrow(()-> new IllegalArgumentException("User Not Found!"));

       if(!post.getAuthor().equals(user)){
           throw new IllegalArgumentException("User don't have permission");
       }
       if (picture != null && !picture.isEmpty()){
           String pictureUrl = storageService.saveImage(picture);
           post.setPicture(pictureUrl);
       }


        post.setContent(content);
        post.setLikes(new HashSet<>());
        notificationService.sendEditNotificationToPost(postId ,post);
        return postRepository.save(post);
    }

    public void deletePost(Long postId, Long id) {
        Post post = postRepository.findById(postId).orElseThrow(()-> new IllegalArgumentException("Post Not Found!"));
        User user =userRepository.findById(id).orElseThrow(()-> new IllegalArgumentException("User Not Found!"));

        if(!post.getAuthor().equals(user)){
            throw new IllegalArgumentException("User don't have permission");
        }
        notificationService.sendDeleteNotificationToPost(postId);
        postRepository.delete(post);
    }

    public Comment addComment(Long postId, Long id, String content) {
        Post post = postRepository.findById(postId).orElseThrow(()-> new IllegalArgumentException("post Not Found!"));
        User user =userRepository.findById(id).orElseThrow(()-> new IllegalArgumentException("User Not Found!"));

        Comment comment = commentRepository.save(new Comment(post ,user , content));
        notificationService.sendCommentNotification(user, post.getAuthor(), post.getId());
        notificationService.sendCommentToPost(postId, comment);
        return comment;

    }

    public List<Comment> getComments(Long postId) {
        Post post = postRepository.findById(postId).orElseThrow(()-> new IllegalArgumentException("post Not found"));
        return post.getComments();
    }

    public void deleteComment(Long commentId, Long id) {
        User user = userRepository.findById(id).orElseThrow(()-> new IllegalArgumentException("User not found"));
        Comment comment = commentRepository.findById(commentId).orElseThrow(()-> new IllegalArgumentException("Comment not found"));
        if(!comment.getAuthor().equals(user)){
          throw  new IllegalArgumentException("User don't have permission to delete comment");
        }
        commentRepository.delete(comment);
        notificationService.sendDeleteCommentToPost(comment.getPost().getId(),comment);
    }

    public Comment editComment(Long commentId, Long id, String newContent) {
        User user = userRepository.findById(id).orElseThrow(()-> new IllegalArgumentException("User not found"));
        Comment comment = commentRepository.findById(commentId).orElseThrow(()-> new IllegalArgumentException("Comment not found"));
        if(!comment.getAuthor().equals(user)){
            throw  new IllegalArgumentException("User don't have permission to delete comment");
        }
       comment.setContent(newContent);
        Comment savedComment = commentRepository.save(comment);
        notificationService.sendCommentToPost(savedComment.getPost().getId(), savedComment);
        return comment;
    }

    @Transactional
    public Post likePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new IllegalArgumentException("Post not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean isLiking = false;

        if(post.getLikes().contains(user)){
            post.getLikes().remove(user);  // Unliking
        }
        else {
            post.getLikes().add(user);     // Liking
            isLiking = true;
            notificationService.sendLikeNotification(user, post.getAuthor(), post.getId());
        }

        Post savedPost = postRepository.save(post);

        // Only send like notification if user is actually liking the post
        if (isLiking) {
            notificationService.sendLikeToPost(postId, savedPost.getLikes());
        }

        return savedPost;
    }

    public Set<User> getPostLikes(Long postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new IllegalArgumentException("Post not found"));
        return post.getLikes();
    }

    public List<Post> getPostsByUserId(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(()-> new IllegalArgumentException("User not found"));
        return postRepository.findByAuthorId(userId);

    }
}
