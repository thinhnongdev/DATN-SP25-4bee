package com.example.phieu_giam_gia.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "emailTaskExecutor")
    public Executor emailTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5); // 5 luồng chạy cùng lúc
        executor.setMaxPoolSize(10); // Tối đa 10 luồng
        executor.setQueueCapacity(50); // Hàng đợi tối đa 50 email chờ xử lý
        executor.setThreadNamePrefix("EmailSender-");
        executor.initialize();
        return executor;
    }
}
