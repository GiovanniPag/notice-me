package com.mycompany.noticeme.config;

import java.util.Optional;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

/**
 * Utility class for ResponseEntity creation.
 */
public interface CustomResponseUtil {
    /**
     * Wrap the optional into a {@link org.springframework.http.ResponseEntity} with an {@link org.springframework.http.HttpStatus#OK} status with the headers, or if it's
     * empty, throws a {@link org.springframework.web.server.ResponseStatusException} with status {@link org.springframework.http.HttpStatus#NOT_FOUND}.
     *
     * @param <X>           type of the response
     * @param maybeResponse response to return if present
     * @param header        headers to be added to the response
     * @return response containing {@code maybeResponse} if present
     */
    static <X> ResponseEntity<X> wrapOrEmpty(Optional<X> maybeResponse, HttpHeaders header) {
        return maybeResponse
            .map(response -> ResponseEntity.ok().headers(header).body(response))
            .orElse(ResponseEntity.noContent().headers(header).build());
    }
}
