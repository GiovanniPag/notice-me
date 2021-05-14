package com.mycompany.noticeme.service;

import com.mycompany.noticeme.domain.Note;
import com.mycompany.noticeme.repository.NoteRepository;
import com.mycompany.noticeme.security.AuthoritiesConstants;
import com.mycompany.noticeme.security.SecurityUtils;
import com.mycompany.noticeme.service.dto.NoteDTO;
import com.mycompany.noticeme.service.mapper.NoteMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Note}.
 */
@Service
@Transactional
public class NoteService {

    private final Logger log = LoggerFactory.getLogger(NoteService.class);

    private final NoteRepository noteRepository;

    private final NoteMapper noteMapper;

    public NoteService(NoteRepository noteRepository, NoteMapper noteMapper) {
        this.noteRepository = noteRepository;
        this.noteMapper = noteMapper;
    }

    /**
     * Save a note.
     *
     * @param noteDTO the entity to save.
     * @return the persisted entity.
     */
    public NoteDTO save(NoteDTO noteDTO) {
        log.debug("Request to save Note : {}", noteDTO);
        Note note = noteMapper.toEntity(noteDTO);
        note = noteRepository.save(note);
        return noteMapper.toDto(note);
    }

    /**
     * Partially update a note.
     *
     * @param noteDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<NoteDTO> partialUpdate(NoteDTO noteDTO) {
        log.debug("Request to partially update Note : {}", noteDTO);

        return noteRepository
            .findById(noteDTO.getId())
            .map(
                existingNote -> {
                    noteMapper.partialUpdate(existingNote, noteDTO);
                    return existingNote;
                }
            )
            .map(noteRepository::save)
            .map(noteMapper::toDto);
    }

    /**
     * Get all the notes.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<NoteDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Notes");
        if (SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.ADMIN)) {
            return noteRepository.findAll(pageable).map(noteMapper::toDto);
        } else {
            return noteRepository.findAllByOwnerLogin(SecurityUtils.getCurrentUserLogin().get(), pageable).map(noteMapper::toDto);
        }
    }

    /**
     * Get all the notes with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<NoteDTO> findAllWithEagerRelationships(Pageable pageable) {
        return noteRepository.findAllWithEagerRelationships(pageable).map(noteMapper::toDto);
    }

    /**
     * Get one note by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<NoteDTO> findOne(Long id) {
        log.debug("Request to get Note : {}", id);
        if (SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.ADMIN)) {
            return noteRepository.findById(id).map(noteMapper::toDto);
        } else {
            return noteRepository
                .findOneWithEagerRelationshipsByIdAndOwnerLogin(id, SecurityUtils.getCurrentUserLogin().get())
                .map(noteMapper::toDto);
        }
    }

    /**
     * Delete the note by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Note : {}", id);
        noteRepository.deleteById(id);
    }
}
