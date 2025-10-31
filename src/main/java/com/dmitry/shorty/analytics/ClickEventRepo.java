package com.dmitry.shorty.analytics;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClickEventRepo extends JpaRepository<ClickEvent, Long> {
    Page<ClickEvent> findByLinkIdOrderByTsDesc(Long linkId, Pageable pageable);
}
