package com.mycompany.noticeme.service.mapper;

import com.mycompany.noticeme.domain.*;
import com.mycompany.noticeme.service.dto.AttachmentDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Attachment} and its DTO {@link AttachmentDTO}.
 */
@Mapper(componentModel = "spring", uses = { NoteMapper.class })
public interface AttachmentMapper extends EntityMapper<AttachmentDTO, Attachment> {
    @Mapping(target = "note", source = "note", qualifiedByName = "id")
    AttachmentDTO toDto(Attachment s);
}
