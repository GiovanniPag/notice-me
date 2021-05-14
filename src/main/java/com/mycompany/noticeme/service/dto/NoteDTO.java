package com.mycompany.noticeme.service.dto;

import com.mycompany.noticeme.domain.enumeration.NoteStatus;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import javax.persistence.Lob;
import javax.validation.constraints.*;

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

    private UserDTO owner;

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

    public UserDTO getOwner() {
        return owner;
    }

    public void setOwner(UserDTO owner) {
        this.owner = owner;
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

    public void setCollaborators(Set<UserDTO> collaborators) {
        this.collaborators = collaborators;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof NoteDTO)) {
            return false;
        }

        NoteDTO noteDTO = (NoteDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, noteDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
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
            ", owner=" + getOwner() +
            ", tags=" + getTags() +
            ", collaborators=" + getCollaborators() +
            "}";
    }
}
