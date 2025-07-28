package com.Backend.features.search.service;

import com.Backend.features.authentication.model.User;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import org.hibernate.search.mapper.orm.Search;
import org.hibernate.search.mapper.orm.massindexing.MassIndexer;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class SearchService {
    private final EntityManager entityManager;

    public SearchService(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public List<User> searchUsers(String query) {
        SearchSession searchSession = Search.session(entityManager);

        return searchSession.search(User.class)
                .where(f -> f.match()
                        .fields("firstName", "lastName", "profession", "location")
                        .matching(query)
                        .fuzzy(2)
                )
                .fetchAllHits();
    }
}
