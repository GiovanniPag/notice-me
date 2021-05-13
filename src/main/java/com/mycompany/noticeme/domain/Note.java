package com.mycompany.noticeme.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

import javax.persistence.*;
import javax.validation.constraints.*;

import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import com.mycompany.noticeme.domain.enumeration.NoteStatus;

/**
 * A Note.
 */
@Entity
@Table(name = "note")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Note implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(min = 1)
    @Column(name = "title", nullable = false)
    private String title;

    
    @Lob
    @Column(name = "content", nullable = false)
    private String content;

    @NotNull
    @Column(name = "date", nullable = false)
    private Instant date;

    @Column(name = "alarm")
    private Instant alarm;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private NoteStatus status;

    @OneToMany(mappedBy = "note")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    private Set<Attachment> attachments = new HashSet<>();

    @ManyToOne(optional = false)
    @NotNull
    @JsonIgnoreProperties(value = "notes", allowSetters = true)
    private User owner;

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JoinTable(name = "note_tag",
               joinColumns = @JoinColumn(name = "note_id", referencedColumnName = "id"),
               inverseJoinColumns = @JoinColumn(name = "tag_id", referencedColumnName = "id"))
    private Set<Tag> tags = new HashSet<>();

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JoinTable(name = "note_collaborator",
               joinColumns = @JoinColumn(name = "note_id", referencedColumnName = "id"),
               inverseJoinColumns = @JoinColumn(name = "collaborator_id", referencedColumnName = "id"))
    private Set<User> collaborators = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public Note title(String title) {
        this.title = title;
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public Note content(String content) {
        this.content = content;
        return this;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getDate() {
        return date;
    }

    public Note date(Instant date) {
        this.date = date;
        return this;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public Instant getAlarm() {
        return alarm;
    }

    public Note alarm(Instant alarm) {
        this.alarm = alarm;
        return this;
    }

    public void setAlarm(Instant alarm) {
        this.alarm = alarm;
    }

    public NoteStatus getStatus() {
        return status;
    }

    public Note status(NoteStatus status) {
        this.status = status;
        return this;
    }

    public void setStatus(NoteStatus status) {
        this.status = status;
    }

    public Set<Attachment> getAttachments() {
        return attachments;
    }

    public Note attachments(Set<Attachment> attachments) {
        this.attachments = attachments;
        return this;
    }

    public Note addAttachment(Attachment attachment) {
        this.attachments.add(attachment);
        attachment.setNote(this);
        return this;
    }

    public Note removeAttachment(Attachment attachment) {
        this.attachments.remove(attachment);
        attachment.setNote(null);
        return this;
    }

    public void setAttachments(Set<Attachment> attachments) {
        this.attachments = attachments;
    }

    public User getOwner() {
        return owner;
    }

    public Note owner(User user) {
        this.owner = user;
        return this;
    }

    public void setOwner(User user) {
        this.owner = user;
    }

    public Set<Tag> getTags() {
        return tags;
    }

    public Note tags(Set<Tag> tags) {
        this.tags = tags;
        return this;
    }

    public Note addTag(Tag tag) {
        this.tags.add(tag);
        tag.getEntries().add(this);
        return this;
    }

    public Note removeTag(Tag tag) {
        this.tags.remove(tag);
        tag.getEntries().remove(this);
        return this;
    }

    public void setTags(Set<Tag> tags) {
        this.tags = tags;
    }

    public Set<User> getCollaborators() {
        return collaborators;
    }

    public Note collaborators(Set<User> users) {
        this.collaborators = users;
        return this;
    }

    public Note addCollaborator(User user) {
        this.collaborators.add(user);
        return this;
    }

    public Note removeCollaborator(User user) {
        this.collaborators.remove(user);
        return this;
    }

    public void setCollaborators(Set<User> users) {
        this.collaborators = users;
    }
    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Note)) {
            return false;
        }
        return id != null && id.equals(((Note) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Note{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", content='" + getContent() + "'" +
            ", date='" + getDate() + "'" +
            ", alarm='" + getAlarm() + "'" +
            ", status='" + getStatus() + "'" +
            "}";
    }
}
