package com.unijob.platform.repository;

import com.unijob.platform.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<Message, Long>{
}
