package sn.uasz.edepot.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.uasz.edepot.model.*;
import sn.uasz.edepot.repository.ExpeditionRepository;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpeditionService {

    private final ExpeditionRepository expeditionRepository;

    public ExpeditionService(ExpeditionRepository expeditionRepository) {
        this.expeditionRepository = expeditionRepository;
    }

    public List<Expedition> getExpeditions(String commercantId, String camionneurId, String destinataireTelephone) {
        List<Expedition> list = expeditionRepository.findAll();

        if (commercantId != null && !commercantId.trim().isEmpty()) {
            list = list.stream().filter(e -> commercantId.equals(e.getCommercantId())).collect(Collectors.toList());
        }
        if (camionneurId != null && !camionneurId.trim().isEmpty()) {
            list = list.stream().filter(e -> camionneurId.equals(e.getCamionneurId())).collect(Collectors.toList());
        }
        if (destinataireTelephone != null && !destinataireTelephone.trim().isEmpty()) {
            list = list.stream().filter(e -> destinataireTelephone.equals(e.getDestinataireTelephone())).collect(Collectors.toList());
        }
        return list;
    }

    public Expedition getById(String id) {
        return expeditionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Expédition introuvable (ID: " + id + ")"));
    }

    @Transactional
    public Expedition mettreAJourStatut(String id, StatutExpedition statut, String note, User auteur) {
        Expedition exp = getById(id);

        // Vérification des droits : Seul le camionneur en charge ou un admin peut mettre à jour les étapes
        if (!exp.getCamionneurId().equals(auteur.getId()) && auteur.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("Seul le camionneur assigné à cette expédition peut faire progresser les étapes de trajet.");
        }

        exp.setStatut(statut);
        String description = note != null && !note.trim().isEmpty() ? note : "Passage au statut : " + statut;
        exp.getHistorique().add(new EvenementHistorique(statut, description, auteur.getNom()));

        // Simulation déplacement GPS indicatif selon étape
        if (statut == StatutExpedition.CHARGEE) {
            exp.setPositionLat(12.5600);
            exp.setPositionLng(-16.2700);
        } else if (statut == StatutExpedition.EN_ROUTE) {
            exp.setPositionLat(12.6500);
            exp.setPositionLng(-16.3200);
        } else if (statut == StatutExpedition.LIVREE_A_CONFIRMER || statut == StatutExpedition.LIVREE) {
            exp.setPositionLat(12.8100);
            exp.setPositionLng(-16.2200);
        }
        exp.setPositionDerniereMaj(Instant.now().toString());

        return expeditionRepository.save(exp);
    }
}
