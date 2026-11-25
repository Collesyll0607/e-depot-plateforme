package sn.uasz.edepot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Santé", description = "Endpoint de vérification de disponibilité (Render Health Check)")
public class HealthController {

    @GetMapping
    @Operation(summary = "Vérifier que l'API E-Dépôt est opérationnelle")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "edepot-api",
                "timestamp", Instant.now().toString()
        ));
    }
}
