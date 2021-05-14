package com.mycompany.noticeme.repository;

import com.mycompany.noticeme.domain.Tag;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Tag entity.
 */
@SuppressWarnings("unused")
@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    @Query("select tag from Tag tag where tag.owner.login = ?#{principal.username}")
    List<Tag> findByOwnerIsCurrentUser();
}
