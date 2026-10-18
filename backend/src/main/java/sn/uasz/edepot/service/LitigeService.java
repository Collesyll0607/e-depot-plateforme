package sn.uasz.edepot.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.uasz.edepot.dto.ArbitrageRequest;
import sn.uasz.edepot.model.*;
import sn.uasz.edepot.repository.ExpeditionRepository;
import sn.uasz.edepot.repository.LitigeRepository;
import sn.uasz.edepot.repository.TransactionRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class LitigeService {

    private final LitigeRepository litigeRepository;
    private final ExpeditionRepository expeditionRepository;
    private final TransactionRepository transactionRepository;

    public LitigeService(LitigeRepository litigeRepository, ExpeditionRepository expeditionRepository, TransactionRepository transactionRepository) {
        this.litigeRepository = litigeRepository;
        this.expeditionRepository = expeditionRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<Litige> getAll() {
        return litigeRepository.findAll();
    }

    public Litige getById(String id) {
        return litigeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Litige introuvable (ID: " + id + ")"));
    }

    @Transactional
    public Litige creerLitige(Litige litige, User auteur) {
        Expedition exp = expeditionRepository.findById(litige.getExpeditionId())
                .orElseThrow(() -> new IllegalArgumentException("Expédition concernée introuvable."));

        litige.setId("lit-" + UUID.randomUUID().toString().substring(0, 8));
        litige.setReference("LIT-2025-" + String.format("%03d", (litigeRepository.count() + 1)));
        litige.setExpeditionId(exp.getId());
        litige.setExpeditionReference(exp.getReference());
        litige.setDeclarantId(auteur.getId());
        litige.setDeclarantNom(auteur.getNom());
        litige.setDeclarantRole(auteur.getRole().name());
        litige.setStatut(StatutLitige.OUVERT);

        // Geler l'expédition
        exp.setStatut(StatutExpedition.LITIGE);
        exp.getHistorique().add(new EvenementHistorique(
                StatutExpedition.LITIGE,
                "Réclamation ouverte par " + auteur.getNom() + " : " + litige.getMotif(),
                auteur.getNom()
        ));
        expeditionRepository.save(exp);

        // Bloquer la transaction
        Optional<Transaction> txOpt = transactionRepository.findByExpeditionId(exp.getId());
        if (txOpt.isPresent()) {
            Transaction tx = txOpt.get();
            tx.setStatut(StatutPaiement.LITIGE_BLOQUE);
            tx.getOperations().add(new OperationFinanciere(
                    "DEPOT_SEQUESTRE",
                    tx.getMontantTotal(),
                    "Fonds séquestrés gelés suite à ouverture du litige " + litige.getReference(),
                    "SUCCES"
            ));
            transactionRepository.save(tx);
        }

        return litigeRepository.save(litige);
    }

    @Transactional
    public Litige arbitrer(String litigeId, ArbitrageRequest req, User admin) {
        if (admin.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("Seul un administrateur assermenté peut prononcer une décision d'arbitrage.");
        }

        Litige litige = getById(litigeId);
        litige.setStatut(StatutLitige.RESOLU);
        litige.setTypeResolution(req.resolution());
        litige.setDecisionAdmin(req.motif());
        litige.setDateResolution(Instant.now().toString());

        // Mettre à jour la transaction selon la décision arbitrale
        Optional<Transaction> txOpt = transactionRepository.findByExpeditionId(litige.getExpeditionId());
        if (txOpt.isPresent()) {
            Transaction tx = txOpt.get();
            if (req.resolution() == ResolutionLitige.LIBERATION_CAMIONNEUR) {
                tx.setStatut(StatutPaiement.LIBERE);
                tx.getOperations().add(new OperationFinanciere(
                        "LIBERATION_CAMIONNEUR",
                        tx.getMontantNetTransporteur(),
                        "Décision arbitrale : Libération intégrale des fonds au camionneur (" + req.motif() + ")",
                        "SUCCES"
                ));
            } else if (req.resolution() == ResolutionLitige.REMBOURSEMENT_TOTAL) {
                tx.setStatut(StatutPaiement.REMBOURSE);
                tx.getOperations().add(new OperationFinanciere(
                        "REMBOURSEMENT",
                        tx.getMontantTotal(),
                        "Décision arbitrale : Remboursement intégral du commerçant (" + req.motif() + ")",
                        "SUCCES"
                ));
            } else if (req.resolution() == ResolutionLitige.REMBOURSEMENT_PARTIEL) {
                tx.setStatut(StatutPaiement.REMBOURSE);
                double remb = req.montantRembourse() != null ? req.montantRembourse() : (tx.getMontantTotal() / 2);
                tx.getOperations().add(new OperationFinanciere(
                        "REMBOURSEMENT",
                        remb,
                        "Décision arbitrale : Remboursement partiel négocié (" + req.motif() + ")",
                        "SUCCES"
                ));
            }
            transactionRepository.save(tx);
        }

        return litigeRepository.save(litige);
    }
}
