package com.mycompany.noticeme.service.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AttachmentMapperTest {

    private AttachmentMapper attachmentMapper;

    @BeforeEach
    public void setUp() {
        attachmentMapper = new AttachmentMapperImpl();
    }
}
