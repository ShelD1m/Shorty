package com.dmitry.shorty.link;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LinkRepo extends JpaRepository<Link, Long> {

    Optional<Link> findById(Long id);

    Optional<Link> findBySlug(String slug);

    boolean existsBySlug(String slug);

    Page<Link> findAllByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    List<Link> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Link> findByIdAndUserId(Long id, Long userId);
}
