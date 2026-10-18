package sn.uasz.edepot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import sn.uasz.edepot.model.Evaluation;
import sn.uasz.edepot.model.User;
import sn.uasz.edepot.service.EvaluationService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/evaluations")
@Tag(name = "Évaluations", description = "Notation réciproque et avis de confiance")
public class EvaluationController {

    private final EvaluationService evaluationService;

    public EvaluationController(EvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    @GetMapping
    @Operation(summary = "Lister les avis reçus ou émis")
    public ResponseEntity<List<Evaluation>> getEvaluations(
            @RequestParam(required = false) String cibleId,
            @RequestParam(required = false) String auteurId
    ) {
        return ResponseEntity.ok(evaluationService.getEvaluations(cibleId, auteurId));
    }

    @PostMapping
    @Operation(summary = "Publier une évaluation bilatérale sur un transport achevé")
    public ResponseEntity<?> creerEvaluation(
            @RequestBody Evaluation evaluation,
            @AuthenticationPrincipal User user
    ) {
        try {
            return ResponseEntity.ok(evaluationService.creerEvaluation(evaluation, user));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
        }
    }
}
