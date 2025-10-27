package com.dmitry.shorty.link;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface LinkRepo extends JpaRepository<Link, Long> {
    Optional<Link> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
