package com.Backend.features.network.repository;

import com.Backend.features.authentication.model.User;
import com.Backend.features.network.model.Connection;
import com.Backend.features.network.model.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, Long> {
    boolean existsByAuthorAndRecipient(User sender, User recipient);

    List<Connection> findAllByAuthorOrRecipient(User userOne, User userTwo);

    @Query("SELECT c FROM connections c WHERE (c.author = :user OR c.recipient = :user) AND c.status = :status")
    List<Connection> findConnectionsByUserAndStatus(@Param("user") User user, @Param("status") Status status);



    @Query("""
        SELECT c
          FROM connections c
         WHERE c.author = :user
            OR c.recipient = :user
    """)
    List<Connection> findAllByUser(@Param("user") User user);


    List<Connection> findByAuthorIdAndStatusOrRecipientIdAndStatus(Long authenticatedUserId, Status status, Long authenticatedUserId1, Status status1);
}
