package com.mycompany.noticeme.service;

import com.mycompany.noticeme.domain.Attachment;
import com.mycompany.noticeme.repository.AttachmentRepository;
import com.mycompany.noticeme.security.AuthoritiesConstants;
import com.mycompany.noticeme.security.SecurityUtils;
import com.mycompany.noticeme.service.dto.AttachmentDTO;
import com.mycompany.noticeme.service.mapper.AttachmentMapper;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Attachment}.
 */
@Service
@Transactional
public class AttachmentService {

    private final Logger log = LoggerFactory.getLogger(AttachmentService.class);

    private final AttachmentRepository attachmentRepository;

    private final AttachmentMapper attachmentMapper;

    public AttachmentService(AttachmentRepository attachmentRepository, AttachmentMapper attachmentMapper) {
        this.attachmentRepository = attachmentRepository;
        this.attachmentMapper = attachmentMapper;
    }

    /**
     * Save a attachment.
     *
     * @param attachmentDTO the entity to save.
     * @return the persisted entity.
     */
    public AttachmentDTO save(AttachmentDTO attachmentDTO) {
        log.debug("Request to save Attachment : {}", attachmentDTO);
        Attachment attachment = attachmentMapper.toEntity(attachmentDTO);
        attachment = attachmentRepository.save(attachment);
        return attachmentMapper.toDto(attachment);
    }

    /**
     * Partially update a attachment.
     *
     * @param attachmentDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<AttachmentDTO> partialUpdate(AttachmentDTO attachmentDTO) {
        log.debug("Request to partially update Attachment : {}", attachmentDTO);

        return attachmentRepository
            .findById(attachmentDTO.getId())
            .map(
                existingAttachment -> {
                    attachmentMapper.partialUpdate(existingAttachment, attachmentDTO);
                    return existingAttachment;
                }
            )
            .map(attachmentRepository::save)
            .map(attachmentMapper::toDto);
    }

    /**
     * Get all the attachments.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<AttachmentDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Attachments");
        if (SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.ADMIN)) {
            return attachmentRepository.findAll(pageable).map(attachmentMapper::toDto);
        } else {
            return attachmentRepository
                .findAllByNoteOwnerLogin(SecurityUtils.getCurrentUserLogin().get(), pageable)
                .map(attachmentMapper::toDto);
        }
    }

    /**
     * Get all the attachments.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<AttachmentDTO> findAllByNoteId(Pageable pageable, long noteId) {
        log.debug("Request to get all Attachments");
        if (SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.ADMIN)) {
            return attachmentRepository.findAllByNoteId(noteId, pageable).map(attachmentMapper::toDto);
        } else {
            return attachmentRepository
                .findAllByNoteOwnerLoginAndNoteId(SecurityUtils.getCurrentUserLogin().get(), noteId, pageable)
                .map(attachmentMapper::toDto);
        }
    }

    /**
     * Get one attachment by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<AttachmentDTO> findOne(Long id) {
        log.debug("Request to get Attachment : {}", id);
        if (SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.ADMIN)) {
            return attachmentRepository.findById(id).map(attachmentMapper::toDto);
        } else {
            return attachmentRepository
                .findOneByIdAndNoteOwnerLogin(id, SecurityUtils.getCurrentUserLogin().get())
                .map(attachmentMapper::toDto);
        }
    }

    /**
     * Delete the attachment by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Attachment : {}", id);
        attachmentRepository.deleteById(id);
    }
}
