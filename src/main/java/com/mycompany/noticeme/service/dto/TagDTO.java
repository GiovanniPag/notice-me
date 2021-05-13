package com.mycompany.noticeme.service.dto;

import io.swagger.annotations.ApiModel;
import javax.validation.constraints.*;
import java.io.Serializable;

/**
 * A DTO for the {@link com.mycompany.noticeme.domain.Tag} entity.
 */
@ApiModel(description = "JHipster JDL model for myApp")
public class TagDTO implements Serializable {
    
    private Long id;

    @NotNull
    @Size(min = 1)
    private String tagName;


    private Long ownerId;
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTagName() {
        return tagName;
    }

    public void setTagName(String tagName) {
        this.tagName = tagName;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long userId) {
        this.ownerId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof TagDTO)) {
            return false;
        }

        return id != null && id.equals(((TagDTO) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "TagDTO{" +
            "id=" + getId() +
            ", tagName='" + getTagName() + "'" +
            ", ownerId=" + getOwnerId() +
            "}";
    }
}
