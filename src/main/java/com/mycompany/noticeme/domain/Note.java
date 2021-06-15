package com.mycompany.noticeme.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.mycompany.noticeme.domain.enumeration.NoteStatus;
import java.io.Serializable;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

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

    @Size(max = 255)
    @Column(name = "title", length = 255)
    private String title;

    @Lob
    @Column(name = "content")
    private String content;

    @NotNull
    @Column(name = "last_update_date", nullable = false)
    private Instant lastUpdateDate;

    @Column(name = "alarm_date")
    private Instant alarmDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private NoteStatus status;

    @OneToMany(mappedBy = "note")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "note" }, allowSetters = true)
    private Set<Attachment> attachments = new HashSet<>();

    @ManyToOne(optional = false)
    @NotNull
    private User owner;

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JoinTable(name = "rel_note__tag", joinColumns = @JoinColumn(name = "note_id"), inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @JsonIgnoreProperties(value = { "owner", "entries" }, allowSetters = true)
    private Set<Tag> tags = new HashSet<>();

    @ManyToMany
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JoinTable(
        name = "rel_note__collaborator",
        joinColumns = @JoinColumn(name = "note_id"),
        inverseJoinColumns = @JoinColumn(name = "collaborator_id")
    )
    private Set<User> collaborators = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Note id(Long id) {
        this.id = id;
        return this;
    }

    public String getTitle() {
        return this.title;
    }

    public Note title(String title) {
        this.title = title;
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return this.content;
    }

    public Note content(String content) {
        this.content = content;
        return this;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getLastUpdateDate() {
        return this.lastUpdateDate;
    }

    public Note lastUpdateDate(Instant lastUpdateDate) {
        this.lastUpdateDate = lastUpdateDate;
        return this;
    }

    public void setLastUpdateDate(Instant lastUpdateDate) {
        this.lastUpdateDate = lastUpdateDate;
    }

    public Instant getAlarmDate() {
        return this.alarmDate;
    }

    public Note alarmDate(Instant alarmDate) {
        this.alarmDate = alarmDate;
        return this;
    }

    public void setAlarmDate(Instant alarmDate) {
        this.alarmDate = alarmDate;
    }

    public NoteStatus getStatus() {
        return this.status;
    }

    public Note status(NoteStatus status) {
        this.status = status;
        return this;
    }

    public void setStatus(NoteStatus status) {
        this.status = status;
    }

    public Set<Attachment> getAttachments() {
        return this.attachments;
    }

    public Note attachments(Set<Attachment> attachments) {
        this.setAttachments(attachments);
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
        if (this.attachments != null) {
            this.attachments.forEach(i -> i.setNote(null));
        }
        if (attachments != null) {
            attachments.forEach(i -> i.setNote(this));
        }
        this.attachments = attachments;
    }

    public User getOwner() {
        return this.owner;
    }

    public Note owner(User user) {
        this.setOwner(user);
        return this;
    }

    public void setOwner(User user) {
        this.owner = user;
    }

    public Set<Tag> getTags() {
        return this.tags;
    }

    public Note tags(Set<Tag> tags) {
        this.setTags(tags);
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
        return this.collaborators;
    }

    public Note collaborators(Set<User> users) {
        this.setCollaborators(users);
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
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Note{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", content='" + getContent() + "'" +
            ", lastUpdateDate='" + getLastUpdateDate() + "'" +
            ", alarmDate='" + getAlarmDate() + "'" +
            ", status='" + getStatus() + "'" +
            "}";
    }
}
