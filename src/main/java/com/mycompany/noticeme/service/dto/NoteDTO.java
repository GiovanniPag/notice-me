package com.mycompany.noticeme.service.dto;

import java.time.Instant;
import javax.validation.constraints.*;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.Lob;
import com.mycompany.noticeme.domain.enumeration.NoteStatus;

/**
 * A DTO for the {@link com.mycompany.noticeme.domain.Note} entity.
 */
public class NoteDTO implements Serializable {
    
    private Long id;

    @NotNull
    @Size(min = 1)
    private String title;

    
    @Lob
    private String content;

    @NotNull
    private Instant date;

    private Instant alarm;

    @NotNull
    private NoteStatus status;


    private Long ownerId;
    private Set<TagDTO> tags = new HashSet<>();
    private Set<UserDTO> collaborators = new HashSet<>();
    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public Instant getAlarm() {
        return alarm;
    }

    public void setAlarm(Instant alarm) {
        this.alarm = alarm;
    }

    public NoteStatus getStatus() {
        return status;
    }

    public void setStatus(NoteStatus status) {
        this.status = status;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long userId) {
        this.ownerId = userId;
    }

    public Set<TagDTO> getTags() {
        return tags;
    }

    public void setTags(Set<TagDTO> tags) {
        this.tags = tags;
    }

    public Set<UserDTO> getCollaborators() {
        return collaborators;
    }

    public void setCollaborators(Set<UserDTO> users) {
        this.collaborators = users;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof NoteDTO)) {
            return false;
        }

        return id != null && id.equals(((NoteDTO) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "NoteDTO{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", content='" + getContent() + "'" +
            ", date='" + getDate() + "'" +
            ", alarm='" + getAlarm() + "'" +
            ", status='" + getStatus() + "'" +
            ", ownerId=" + getOwnerId() +
            ", tags='" + getTags() + "'" +
            ", collaborators='" + getCollaborators() + "'" +
            "}";
    }
}
