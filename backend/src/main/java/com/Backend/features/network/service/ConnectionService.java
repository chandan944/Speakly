package com.Backend.features.network.service;

import com.Backend.features.authentication.model.User;
import com.Backend.features.authentication.repository.UserRepository;
import com.Backend.features.network.model.Connection;
import com.Backend.features.network.model.Status;
import com.Backend.features.network.repository.ConnectionRepository;
import com.Backend.features.notifications.service.NotificationService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;


@Service
public class ConnectionService {

    private final ConnectionRepository connectionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ConnectionService(ConnectionRepository connectionRepository, UserRepository userRepository, NotificationService notificationService) {
        this.connectionRepository = connectionRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public Connection sendConnectionRequest(User sender, Long recipientId) {
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new IllegalArgumentException("Recipient not found"));

        if (connectionRepository.existsByAuthorAndRecipient(sender, recipient) ||
                connectionRepository.existsByAuthorAndRecipient(recipient, sender)) {
            throw new IllegalStateException("Connection request already exists");
        }

        Connection connection = connectionRepository.save(new Connection(sender, recipient));
        notificationService.sendNewInvitationToUsers(sender.getId(), recipient.getId(), connection);
        return connection;
    }

    public Connection acceptConnectionRequest(User recipient, Long connectionId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new IllegalArgumentException("Connection not found"));

        if (!connection.getRecipient().getId().equals(recipient.getId())) {
            throw new IllegalStateException("User is not the recipient of the connection request");
        }

        if (connection.getStatus().equals(Status.ACCEPTED)) {
            throw new IllegalStateException("Connection is already accepted");
        }

        connection.setStatus(Status.ACCEPTED);
        notificationService.sendInvitationAcceptedToUsers(connection.getAuthor().getId(), connection.getRecipient().getId(), connection);
        return connectionRepository.save(connection);
    }

    public Connection rejectOrCancelConnection(User recipient, Long connectionId) {
        Connection connection = connectionRepository.findById(connectionId)
                .orElseThrow(() -> new IllegalArgumentException("Connection not found"));

        if (!connection.getRecipient().getId().equals(recipient.getId()) && !connection.getAuthor().getId().equals(recipient.getId())) {
            throw new IllegalStateException("User is not the recipient or author of the connection request");
        }
        connectionRepository.deleteById(connectionId);
        notificationService.sendRemoveConnectionToUsers(connection.getAuthor().getId(), connection.getRecipient().getId(), connection);
        return connection;
    }

    public List<Connection> getUserConnections(User user, Status status) {
        return connectionRepository.findConnectionsByUserAndStatus(user, status != null ? status : Status.ACCEPTED);
    }


    public List<User> getConnectionSuggestions(User user) {
        List<User> allUsers = userRepository.findAllByIdNot(user.getId());
        List<Connection> userConnections = connectionRepository.findAllByAuthorOrRecipient(user, user);

        Set<Long> connectedUserIds = userConnections.stream()
                .flatMap(connection -> Stream.of(connection.getAuthor().getId(), connection.getRecipient().getId()))
                .collect(Collectors.toSet());

        return allUsers.stream()
                .filter(u -> !connectedUserIds.contains(u.getId()))
                .collect(Collectors.toList());

    }

    public Connection markConnectionAsSeen(User user, Long id) {
        Connection connection = connectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Connection not found"));

        if (!connection.getRecipient().getId().equals(user.getId())) {
            throw new IllegalStateException("User is not the recipient of the connection request");
        }

        connection.setSeen(true);
        notificationService.sendConnectionSeenNotification(connection.getRecipient().getId(), connection);
        return connectionRepository.save(connection);
    }
    public List<Connection> getUserConnections(Long userId, Status status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return connectionRepository.findConnectionsByUserAndStatus(user, status != null ? status : Status.ACCEPTED);
    }


    public List<User> getRecommendations(Long userId, int limit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // ✅ Get ALL connected users (PENDING + ACCEPTED, both directions)
        Set<User> allConnectedUsers = getAllConnectedUsers(user);

        Set<User> secondDegreeConnections = getSecondDegreeConnections(user);

        // If no second degree connections, get all users but exclude connected ones
        if (secondDegreeConnections.isEmpty()) {
            Set<User> allUsers = new HashSet<>(userRepository.findAllByIdNot(userId));
            allUsers.removeAll(allConnectedUsers); // ✅ Remove ALL connected users
            secondDegreeConnections = allUsers;
        }

        List<UserRecommendation> recommendations = new ArrayList<>();

        for (User potentialConnection : secondDegreeConnections) {
            if (!potentialConnection.getProfileComplete()) {
                continue;
            }

            // ✅ CRITICAL: Skip if user has ANY connection (PENDING/ACCEPTED) with this user
            if (allConnectedUsers.contains(potentialConnection)) {
                continue;
            }

            double score = calculateProfileSimilarity(user, potentialConnection);

            int mutualConnections = countMutualConnections(user, potentialConnection);
            score += mutualConnections * 0.5;

            recommendations.add(new UserRecommendation(potentialConnection, score));
        }

        return recommendations.stream()
                .sorted((r1, r2) -> Double.compare(r2.score(), r1.score()))
                .limit(limit)
                .map(UserRecommendation::user)
                .collect(Collectors.toList());
    }

    // ✅ NEW METHOD: Get ALL users that have ANY connection (PENDING or ACCEPTED)
    private Set<User> getAllConnectedUsers(User user) {
        Set<User> connectedUsers = new HashSet<>();

        // Users where current user SENT a request (author -> recipient)
        user.getInitiatedConnections().stream()
                .filter(conn -> conn.getStatus().equals(Status.PENDING) ||
                        conn.getStatus().equals(Status.ACCEPTED))
                .forEach(conn -> connectedUsers.add(conn.getRecipient()));

        // Users where current user RECEIVED a request (recipient <- author)
        user.getReceivedConnections().stream()
                .filter(conn -> conn.getStatus().equals(Status.PENDING) ||
                        conn.getStatus().equals(Status.ACCEPTED))
                .forEach(conn -> connectedUsers.add(conn.getAuthor()));

        return connectedUsers;
    }

    // ✅ UPDATED: Only get ACCEPTED connections for second-degree logic
    private Set<User> getAcceptedConnections(User user) {
        Set<User> acceptedConnections = new HashSet<>();

        user.getInitiatedConnections().stream()
                .filter(conn -> conn.getStatus().equals(Status.ACCEPTED))
                .forEach(conn -> acceptedConnections.add(conn.getRecipient()));

        user.getReceivedConnections().stream()
                .filter(conn -> conn.getStatus().equals(Status.ACCEPTED))
                .forEach(conn -> acceptedConnections.add(conn.getAuthor()));

        return acceptedConnections;
    }

    private Set<User> getSecondDegreeConnections(User user) {
        // Only use ACCEPTED connections for finding second-degree connections
        Set<User> directConnections = getAcceptedConnections(user);

        Set<User> secondDegreeConnections = new HashSet<>();

        for (User directConnection : directConnections) {
            directConnection.getInitiatedConnections().stream()
                    .filter(conn -> conn.getStatus().equals(Status.ACCEPTED))
                    .forEach(conn -> secondDegreeConnections.add(conn.getRecipient()));

            directConnection.getReceivedConnections().stream()
                    .filter(conn -> conn.getStatus().equals(Status.ACCEPTED))
                    .forEach(conn -> secondDegreeConnections.add(conn.getAuthor()));
        }

        secondDegreeConnections.remove(user);
        secondDegreeConnections.removeAll(directConnections);

        // ✅ ALSO remove users with ANY connection status (not just accepted)
        secondDegreeConnections.removeAll(getAllConnectedUsers(user));

        return secondDegreeConnections;
    }

    private int countMutualConnections(User user1, User user2) {
        Set<User> user1Connections = getAcceptedConnections(user1);
        Set<User> user2Connections = getAcceptedConnections(user2);

        user1Connections.retainAll(user2Connections);
        return user1Connections.size();
    }

    private double calculateProfileSimilarity(User user1, User user2) {
        double score = 0.0;

        // ✅ Add null checks to prevent NullPointerException
        if (user1.getProfession() != null && user2.getProfession() != null &&
                user1.getProfession().equalsIgnoreCase(user2.getProfession())) {
            score += 3.0;
        }

        if (user1.getBio() != null && user2.getBio() != null &&
                user1.getBio().equalsIgnoreCase(user2.getBio())) {
            score += 5.0;
        }

        if (user1.getLocation() != null && user2.getLocation() != null &&
                user1.getLocation().equalsIgnoreCase(user2.getLocation())) {
            score += 1.5;
        }

        return score;
    }

    // ✅ OPTIONAL: Helper method to check specific connection status
    private boolean hasConnectionWith(User user1, User user2, Status... statuses) {
        Set<Status> statusSet = Set.of(statuses);

        // Check if user1 sent request to user2
        boolean sentRequest = user1.getInitiatedConnections().stream()
                .anyMatch(conn -> conn.getRecipient().equals(user2) &&
                        statusSet.contains(conn.getStatus()));

        // Check if user1 received request from user2
        boolean receivedRequest = user1.getReceivedConnections().stream()
                .anyMatch(conn -> conn.getAuthor().equals(user2) &&
                        statusSet.contains(conn.getStatus()));

        return sentRequest || receivedRequest;
    }

    // ✅ ALTERNATIVE: More explicit filtering approach
    public List<User> getRecommendationsAlternative(Long userId, int limit) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Set<User> secondDegreeConnections = getSecondDegreeConnections(user);

        // If no second degree connections, get all users except self
        Set<User> candidateUsers = secondDegreeConnections.isEmpty() ?
                new HashSet<>(userRepository.findAllByIdNot(userId)) :
                secondDegreeConnections;

        List<UserRecommendation> recommendations = new ArrayList<>();

        for (User potentialConnection : candidateUsers) {
            if (!potentialConnection.getProfileComplete()) {
                continue;
            }

            // ✅ Skip if there's ANY connection (PENDING or ACCEPTED) between users
            if (hasConnectionWith(user, potentialConnection, Status.PENDING, Status.ACCEPTED)) {
                continue;
            }

            double score = calculateProfileSimilarity(user, potentialConnection);
            int mutualConnections = countMutualConnections(user, potentialConnection);
            score += mutualConnections * 0.5;

            recommendations.add(new UserRecommendation(potentialConnection, score));
        }

        return recommendations.stream()
                .sorted((r1, r2) -> Double.compare(r2.score(), r1.score()))
                .limit(limit)
                .map(UserRecommendation::user)
                .collect(Collectors.toList());
    }

    private record UserRecommendation(User user, double score) {
    }
    public List<Connection> getAllConnections(User user) {
        return connectionRepository.findAllByUser(user);
    }
}


