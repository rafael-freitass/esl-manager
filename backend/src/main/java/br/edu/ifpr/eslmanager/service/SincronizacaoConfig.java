package br.edu.ifpr.eslmanager.service;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration(proxyBeanMethods = false)
public class SincronizacaoConfig {
    @Bean
    public ThreadPoolTaskExecutor etiquetaExecutor() {
        var executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(2);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("etiqueta-envio-");
        // Mantém AbortPolicy: nunca executar HTTP na thread da requisição por saturação.
        return executor;
    }
}
