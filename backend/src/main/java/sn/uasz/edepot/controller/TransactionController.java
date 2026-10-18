package sn.uasz.edepot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sn.uasz.edepot.model.Transaction;
import sn.uasz.edepot.repository.TransactionRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/transactions")
@Tag(name = "Transactions & Séquestre", description = "Consultation des flux consignés et ventilation des commissions")
public class TransactionController {

    private final TransactionRepository transactionRepository;

    public TransactionController(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @GetMapping
    @Operation(summary = "Lister les transactions financières (Commerçant, Camionneur ou Admin)")
    public ResponseEntity<List<Transaction>> getTransactions(
            @RequestParam(required = false) String commercantId,
            @RequestParam(required = false) String camionneurId
    ) {
        List<Transaction> list = transactionRepository.findAll();
        if (commercantId != null && !commercantId.trim().isEmpty()) {
            list = list.stream().filter(t -> commercantId.equals(t.getCommercantId())).collect(Collectors.toList());
        }
        if (camionneurId != null && !camionneurId.trim().isEmpty()) {
            list = list.stream().filter(t -> camionneurId.equals(t.getCamionneurId())).collect(Collectors.toList());
        }
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir les détails d'une transaction")
    public ResponseEntity<?> getTransactionById(@PathVariable String id) {
        return transactionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
