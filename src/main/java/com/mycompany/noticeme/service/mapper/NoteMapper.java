package com.mycompany.noticeme.service.mapper;


import com.mycompany.noticeme.domain.*;
import com.mycompany.noticeme.service.dto.NoteDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity {@link Note} and its DTO {@link NoteDTO}.
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class, TagMapper.class})
public interface NoteMapper extends EntityMapper<NoteDTO, Note> {

    @Mapping(source = "owner.id", target = "ownerId")
    NoteDTO toDto(Note note);

    @Mapping(target = "attachments", ignore = true)
    @Mapping(target = "removeAttachment", ignore = true)
    @Mapping(source = "ownerId", target = "owner")
    @Mapping(target = "removeTag", ignore = true)
    @Mapping(target = "removeCollaborator", ignore = true)
    Note toEntity(NoteDTO noteDTO);

    default Note fromId(Long id) {
        if (id == null) {
            return null;
        }
        Note note = new Note();
        note.setId(id);
        return note;
    }
}
