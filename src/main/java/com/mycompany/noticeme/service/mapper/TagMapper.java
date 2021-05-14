package com.mycompany.noticeme.service.mapper;

import com.mycompany.noticeme.domain.*;
import com.mycompany.noticeme.service.dto.TagDTO;
import java.util.Set;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Tag} and its DTO {@link TagDTO}.
 */
@Mapper(componentModel = "spring", uses = { UserMapper.class })
public interface TagMapper extends EntityMapper<TagDTO, Tag> {
    @Mapping(target = "owner", source = "owner", qualifiedByName = "id")
    TagDTO toDto(Tag s);

    @Named("tagNameSet")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "tagName", source = "tagName")
    Set<TagDTO> toDtoTagNameSet(Set<Tag> tag);
}
