package com.mycompany.noticeme.service.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class NoteMapperTest {

    private NoteMapper noteMapper;

    @BeforeEach
    public void setUp() {
        noteMapper = new NoteMapperImpl();
    }

    @Test
    public void testEntityFromId() {
        Long id = 1L;
        assertThat(noteMapper.fromId(id).getId()).isEqualTo(id);
        assertThat(noteMapper.fromId(null)).isNull();
    }
}
