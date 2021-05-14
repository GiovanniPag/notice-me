package com.mycompany.noticeme.repository;

import com.mycompany.noticeme.domain.Note;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Note entity.
 */
@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    @Query("select note from Note note where note.owner.login = ?#{principal.username}")
    List<Note> findByOwnerIsCurrentUser();

    @Query(
        value = "select distinct note from Note note left join fetch note.tags left join fetch note.collaborators",
        countQuery = "select count(distinct note) from Note note"
    )
    Page<Note> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct note from Note note left join fetch note.tags left join fetch note.collaborators")
    List<Note> findAllWithEagerRelationships();

    @Query("select note from Note note left join fetch note.tags left join fetch note.collaborators where note.id =:id")
    Optional<Note> findOneWithEagerRelationships(@Param("id") Long id);

    @Query(
        "select note from Note note left join fetch note.tags left join fetch note.collaborators " +
        "where note.id =:id and note.owner.login=:login"
    )
    Optional<Note> findOneWithEagerRelationshipsByIdAndOwnerLogin(@Param("id") Long id, @Param("login") String login);

    Page<Note> findAllByOwnerLogin(String login, Pageable pageable);
}
