package com.mycompany.noticeme.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.mycompany.noticeme.domain.enumeration.Format;
import java.io.Serializable;
import javax.persistence.*;
import javax.validation.constraints.*;
import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

/**
 * A Attachment.
 */
@Entity
@Table(name = "attachment")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class Attachment implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Lob
    @Column(name = "data", nullable = false)
    private byte[] data;

    @Column(name = "data_content_type", nullable = false)
    private String dataContentType;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "format", nullable = false)
    private Format format;

    @ManyToOne
    @JsonIgnoreProperties(value = { "attachments", "owner", "tags", "collaborators" }, allowSetters = true)
    private Note note;

    // jhipster-needle-entity-add-field - JHipster will add fields here
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Attachment id(Long id) {
        this.id = id;
        return this;
    }

    public byte[] getData() {
        return this.data;
    }

    public Attachment data(byte[] data) {
        this.data = data;
        return this;
    }

    public void setData(byte[] data) {
        this.data = data;
    }

    public String getDataContentType() {
        return this.dataContentType;
    }

    public Attachment dataContentType(String dataContentType) {
        this.dataContentType = dataContentType;
        return this;
    }

    public void setDataContentType(String dataContentType) {
        this.dataContentType = dataContentType;
    }

    public Format getFormat() {
        return this.format;
    }

    public Attachment format(Format format) {
        this.format = format;
        return this;
    }

    public void setFormat(Format format) {
        this.format = format;
    }

    public Note getNote() {
        return this.note;
    }

    public Attachment note(Note note) {
        this.setNote(note);
        return this;
    }

    public void setNote(Note note) {
        this.note = note;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Attachment)) {
            return false;
        }
        return id != null && id.equals(((Attachment) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Attachment{" +
            "id=" + getId() +
            ", data='" + getData() + "'" +
            ", dataContentType='" + getDataContentType() + "'" +
            ", format='" + getFormat() + "'" +
            "}";
    }
}
