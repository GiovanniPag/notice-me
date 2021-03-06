package com.mycompany.noticeme.service;

import com.mycompany.noticeme.domain.Tag;
import com.mycompany.noticeme.repository.TagRepository;
import com.mycompany.noticeme.repository.UserRepository;
import com.mycompany.noticeme.security.AuthoritiesConstants;
import com.mycompany.noticeme.security.SecurityUtils;
import com.mycompany.noticeme.service.dto.TagDTO;
import com.mycompany.noticeme.service.mapper.TagMapper;
import java.util.Arrays;
import java.util.Collection;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Tag}.
 */
@Service
@Transactional
public class TagService {

    private final Logger log = LoggerFactory.getLogger(TagService.class);

    private final TagRepository tagRepository;
    private final UserService userService;

    private final TagMapper tagMapper;

    public TagService(TagRepository tagRepository, TagMapper tagMapper, UserService userService) {
        this.tagRepository = tagRepository;
        this.tagMapper = tagMapper;
        this.userService = userService;
    }

    /**
     * Save a tag.
     *
     * @param tagDTO the entity to save.
     * @return the persisted entity.
     */
    public TagDTO save(TagDTO tagDTO) {
        log.debug("Request to save Tag : {}", tagDTO);
        Tag tag = tagMapper.toEntity(tagDTO);
        tag = tagRepository.save(tag);
        return tagMapper.toDto(tag);
    }

    /**
     * Partially update a tag.
     *
     * @param tagDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<TagDTO> partialUpdate(TagDTO tagDTO) {
        log.debug("Request to partially update Tag : {}", tagDTO);

        return tagRepository
            .findById(tagDTO.getId())
            .map(
                existingTag -> {
                    tagMapper.partialUpdate(existingTag, tagDTO);
                    return existingTag;
                }
            )
            .map(tagRepository::save)
            .map(tagMapper::toDto);
    }

    /**
     * Get all the tags.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<TagDTO> findAll(Pageable pageable) {
        log.debug("Request to get all Tags");
        if (SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.ADMIN)) {
            return tagRepository.findAll(pageable).map(tagMapper::toDto);
        } else {
            return tagRepository.findAllByOwnerLogin(SecurityUtils.getCurrentUserLogin().get(), pageable).map(tagMapper::toDto);
        }
    }

    /**
     * Get one tag by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<TagDTO> findOne(Long id) {
        log.debug("Request to get Tag : {}", id);
        if (SecurityUtils.hasCurrentUserThisAuthority(AuthoritiesConstants.ADMIN)) {
            return tagRepository.findById(id).map(tagMapper::toDto);
        } else {
            return tagRepository.findOneByIdAndOwnerLogin(id, SecurityUtils.getCurrentUserLogin().get()).map(tagMapper::toDto);
        }
    }

    /**
     * Get one tag by tagname.
     *
     * @param tagname the tagname of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<TagDTO> findOne(String tagname) {
        log.debug("Request to get Tag : {}", tagname);
        return tagRepository.findOneByTagNameAndOwnerLogin(tagname, SecurityUtils.getCurrentUserLogin().get()).map(tagMapper::toDto);
    }

    /**
     * Delete the tag by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        log.debug("Request to delete Tag : {}", id);
        tagRepository.deleteById(id);
    }

    /**
     * Get all the tags filtered.
     *
     * @param pageable the pagination information.
     * @param
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<TagDTO> findfilterAll(Pageable pageable, String initial, Long noteid) {
        log.debug("Request to get all Tags");
        Collection<String> noteTags = tagRepository
            .findDistinctAllByEntriesId(noteid)
            .stream()
            .map((Tag t) -> t.getTagName())
            .collect(Collectors.toList());
        Long ownerid = userService.getUserWithAuthorities().get().getId();
        return tagRepository
            .findDistinctAllByOwnerIdAndTagNameNotInAndTagNameStartingWithOrderByTagNameAsc(ownerid, noteTags, initial, pageable)
            .map(tagMapper::toDto);
    }

    /**
     * Get all the tags filtered.
     *
     * @param pageable the pagination information.
     * @param
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<TagDTO> findfilterAll(Pageable pageable, String initial, String[] filterby) {
        log.debug("Request to get all Tags");
        Collection<String> noteTags = Arrays.asList(filterby);
        final Page<TagDTO> page;
        Long ownerid = userService.getUserWithAuthorities().get().getId();
        if (noteTags.isEmpty()) {
            page =
                tagRepository
                    .findDistinctAllByOwnerIdAndTagNameStartingWithOrderByTagNameAsc(ownerid, initial, pageable)
                    .map(tagMapper::toDto);
        } else {
            page =
                tagRepository
                    .findDistinctAllByOwnerIdAndTagNameNotInAndTagNameStartingWithOrderByTagNameAsc(ownerid, noteTags, initial, pageable)
                    .map(tagMapper::toDto);
        }
        return page;
    }
}
