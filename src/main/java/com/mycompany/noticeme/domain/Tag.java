package com.mycompany.noticeme.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * JHipster JDL model for myApp
 */
@Entity
@Table(name = "tag")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Tag implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Size(min = 1, max = 255)
    @Column(name = "tag_name", length = 255, nullable = false)
    private String tagName;

    @ManyToOne(optional = false)
    @NotNull
    private User owner;

    @ManyToMany(mappedBy = "tags")
    @Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
    @JsonIgnoreProperties(value = { "attachments", "owner", "tags", "collaborators" }, allowSetters = true)
    private Set<Note> entries = new HashSet<>();

    // jhipster-needle-entity-add-field - JHipster will add fields here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Tag id(Long id) {
        this.id = id;
        return this;
    }

    public String getTagName() {
        return this.tagName;
    }

    public Tag tagName(String tagName) {
        this.tagName = tagName;
        return this;
    }

    public void setTagName(String tagName) {
        this.tagName = tagName;
    }

    public User getOwner() {
        return this.owner;
    }

    public Tag owner(User user) {
        this.setOwner(user);
        return this;
    }

    public void setOwner(User user) {
        this.owner = user;
    }

    public Set<Note> getEntries() {
        return this.entries;
    }

    public Tag entries(Set<Note> notes) {
        this.setEntries(notes);
        return this;
    }

    public Tag addEntry(Note note) {
        this.entries.add(note);
        note.getTags().add(this);
        return this;
    }

    public Tag removeEntry(Note note) {
        this.entries.remove(note);
        note.getTags().remove(this);
        return this;
    }

    public void setEntries(Set<Note> notes) {
        if (this.entries != null) {
            this.entries.forEach(i -> i.removeTag(this));
        }
        if (notes != null) {
            notes.forEach(i -> i.addTag(this));
        }
        this.entries = notes;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Tag)) {
            return false;
        }
        return id != null && id.equals(((Tag) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Tag{" +
            "id=" + getId() +
            ", tagName='" + getTagName() + "'" +
            "}";
    }
}
