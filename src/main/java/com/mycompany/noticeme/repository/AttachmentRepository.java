package com.mycompany.noticeme.repository;

import com.mycompany.noticeme.domain.Attachment;
import com.mycompany.noticeme.service.dto.AttachmentDTO;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Attachment entity.
 */
@SuppressWarnings("unused")
@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    Page<Attachment> findAllByNoteOwnerLogin(String login, Pageable pageable);

    Optional<Attachment> findOneByIdAndNoteOwnerLogin(@Param("id") Long id, @Param("login") String login);

    Page<Attachment> findAllByNoteId(long noteId, Pageable pageable);

    Page<Attachment> findAllByNoteOwnerLoginAndNoteId(String string, long noteId, Pageable pageable);
}
