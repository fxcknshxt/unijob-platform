package com.unijob.platform.repository;

import com.unijob.platform.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long>{
}
