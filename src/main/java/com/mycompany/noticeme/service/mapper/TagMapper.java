package com.mycompany.noticeme.service.mapper;


import com.mycompany.noticeme.domain.*;
import com.mycompany.noticeme.service.dto.TagDTO;

import org.mapstruct.*;

/**
 * Mapper for the entity {@link Tag} and its DTO {@link TagDTO}.
 */
@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface TagMapper extends EntityMapper<TagDTO, Tag> {

    @Mapping(source = "owner.id", target = "ownerId")
    TagDTO toDto(Tag tag);

    @Mapping(source = "ownerId", target = "owner")
    @Mapping(target = "entries", ignore = true)
    @Mapping(target = "removeEntry", ignore = true)
    Tag toEntity(TagDTO tagDTO);

    default Tag fromId(Long id) {
        if (id == null) {
            return null;
        }
        Tag tag = new Tag();
        tag.setId(id);
        return tag;
    }
}
