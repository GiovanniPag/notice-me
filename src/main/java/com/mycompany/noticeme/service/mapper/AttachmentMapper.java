package com.mycompany.noticeme.service.mapper;


import com.mycompany.noticeme.domain.*;
import com.mycompany.noticeme.service.dto.AttachmentDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity {@link Attachment} and its DTO {@link AttachmentDTO}.
 */
@Mapper(componentModel = "spring", uses = {NoteMapper.class})
public interface AttachmentMapper extends EntityMapper<AttachmentDTO, Attachment> {

    @Mapping(source = "note.id", target = "noteId")
    AttachmentDTO toDto(Attachment attachment);

    @Mapping(source = "noteId", target = "note")
    Attachment toEntity(AttachmentDTO attachmentDTO);

    default Attachment fromId(Long id) {
        if (id == null) {
            return null;
        }
        Attachment attachment = new Attachment();
        attachment.setId(id);
        return attachment;
    }
}
