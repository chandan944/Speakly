package com.Backend.features.authentication.repository;

import com.Backend.features.authentication.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User ,Long> {
     Optional<User> findByEmail(String email);


    List<User> findAllByIdNot(Long userId);

    List<User> findAllByOrderByPointsDesc();


    @Modifying
    @Query("UPDATE User u SET u.asks = u.asks + 2")
    void addAsksToAllUsers(); // ← This is now valid
}
