package com.mycompany.noticeme.repository;

import com.mycompany.noticeme.domain.Tag;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data  repository for the Tag entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    @Query("select tag from Tag tag where tag.owner.login = ?#{principal.username}")
    List<Tag> findByOwnerIsCurrentUser();
}
