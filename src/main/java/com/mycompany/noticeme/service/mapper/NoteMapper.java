package com.mycompany.noticeme.service.mapper;

import com.mycompany.noticeme.domain.*;
import com.mycompany.noticeme.service.dto.NoteDTO;
import java.util.Set;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Note} and its DTO {@link NoteDTO}.
 */
@Mapper(componentModel = "spring", uses = { UserMapper.class, TagMapper.class })
public interface NoteMapper extends EntityMapper<NoteDTO, Note> {
    @Mapping(target = "owner", source = "owner", qualifiedByName = "id")
    @Mapping(target = "tags", source = "tags", qualifiedByName = "tagNameSet")
    @Mapping(target = "collaborators", source = "collaborators", qualifiedByName = "idSet")
    NoteDTO toDto(Note s);

    @Named("id")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    NoteDTO toDtoId(Note note);

    @Mapping(target = "removeTag", ignore = true)
    @Mapping(target = "removeCollaborator", ignore = true)
    Note toEntity(NoteDTO noteDTO);
}
