package sn.uasz.edepot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import sn.uasz.edepot.config.DatabaseUrlResolver;

@SpringBootApplication
public class EDepotApplication {
    public static void main(String[] args) {
        DatabaseUrlResolver.configureFromEnvironment();
        SpringApplication.run(EDepotApplication.class, args);
    }
}
