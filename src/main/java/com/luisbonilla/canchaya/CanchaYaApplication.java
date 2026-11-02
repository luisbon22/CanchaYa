package com.luisbonilla.canchaya;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@ConfigurationPropertiesScan
public class CanchaYaApplication {

    public static void main(String[] args) {
        SpringApplication.run(CanchaYaApplication.class, args);
    }
}
