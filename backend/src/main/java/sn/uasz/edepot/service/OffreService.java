package sn.uasz.edepot.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.uasz.edepot.dto.ContrePropositionRequest;
import sn.uasz.edepot.model.*;
import sn.uasz.edepot.repository.DemandeRepository;
import sn.uasz.edepot.repository.ExpeditionRepository;
import sn.uasz.edepot.repository.OffreRepository;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OffreService {

    private final OffreRepository offreRepository;
    private final DemandeRepository demandeRepository;
    private final ExpeditionRepository expeditionRepository;

    public OffreService(OffreRepository offreRepository, DemandeRepository demandeRepository, ExpeditionRepository expeditionRepository) {
        this.offreRepository = offreRepository;
        this.demandeRepository = demandeRepository;
        this.expeditionRepository = expeditionRepository;
    }

    public List<OffreTransport> getOffres(String demandeId, String camionneurId) {
        List<OffreTransport> list = offreRepository.findAll();
        if (demandeId != null && !demandeId.trim().isEmpty()) {
            list = list.stream().filter(o -> demandeId.equals(o.getDemandeId())).collect(Collectors.toList());
        }
        if (camionneurId != null && !camionneurId.trim().isEmpty()) {
            list = list.stream().filter(o -> camionneurId.equals(o.getCamionneurId())).collect(Collectors.toList());
        }
        return list;
    }

    public OffreTransport getById(String id) {
        return offreRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Offre de transport introuvable (ID: " + id + ")"));
    }

    @Transactional
    public OffreTransport creerOffre(OffreTransport offre, User auteur) {
        if (auteur.getRole() != UserRole.CAMIONNEUR && auteur.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("Seuls les camionneurs / transporteurs peuvent formuler des offres de transport.");
        }

        DemandeTransport demande = demandeRepository.findById(offre.getDemandeId())
                .orElseThrow(() -> new IllegalArgumentException("La demande de transport ciblée n'existe pas."));

        if (demande.getStatut() != StatutDemande.OUVERTE) {
            throw new IllegalArgumentException("Cette demande n'accepte plus de propositions (statut: " + demande.getStatut() + ")");
        }

        offre.setId("off-" + UUID.randomUUID().toString().substring(0, 8));
        offre.setCamionneurId(auteur.getId());
        offre.setCamionneurNom(auteur.getNom());
        offre.setCamionneurTelephone(auteur.getTelephone());
        offre.setCamionneurNote(auteur.getNoteMoyenne() != null ? auteur.getNoteMoyenne() : 5.0);
        offre.setDemandeReference(demande.getReference());
        offre.setStatut(StatutOffre.EN_ATTENTE);

        OffreTransport saved = offreRepository.save(offre);

        // Mettre à jour le compteur d'offres de la demande
        demande.setNombreOffres(demande.getNombreOffres() + 1);
        demandeRepository.save(demande);

        return saved;
    }

    @Transactional
    public Map<String, Object> accepterOffre(String offreId, User auteur) {
        OffreTransport offre = getById(offreId);
        DemandeTransport demande = demandeRepository.findById(offre.getDemandeId())
                .orElseThrow(() -> new IllegalArgumentException("Demande introuvable."));

        if (!demande.getCommercantId().equals(auteur.getId()) && auteur.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("Seul le commerçant auteur de la demande peut accepter cette offre.");
        }

        // Accepter cette offre
        offre.setStatut(StatutOffre.ACCEPTEE);
        offreRepository.save(offre);

        // Refuser les autres offres de la même demande
        List<OffreTransport> autresOffres = offreRepository.findByDemandeId(demande.getId());
        for (OffreTransport autre : autresOffres) {
            if (!autre.getId().equals(offre.getId()) && autre.getStatut() == StatutOffre.EN_ATTENTE) {
                autre.setStatut(StatutOffre.REFUSEE);
                offreRepository.save(autre);
            }
        }

        // Mettre à jour la demande
        demande.setStatut(StatutDemande.OFFRE_ACCEPTEE);
        demandeRepository.save(demande);

        // Créer l'Expédition officielle
        Expedition exp = new Expedition();
        exp.setId("exp-" + UUID.randomUUID().toString().substring(0, 8));
        exp.setReference("EXP-2025-" + String.format("%03d", (expeditionRepository.count() + 1)));
        exp.setDemandeId(demande.getId());
        exp.setCommercantId(demande.getCommercantId());
        exp.setCommercantNom(demande.getCommercantNom());
        exp.setCamionneurId(offre.getCamionneurId());
        exp.setCamionneurNom(offre.getCamionneurNom());
        exp.setCamionneurTelephone(offre.getCamionneurTelephone());
        exp.setDestinataireNom(demande.getDestinataireNom());
        exp.setDestinataireTelephone(demande.getDestinataireTelephone());
        exp.setDestinataireAdresse(demande.getDestinataireAdresse());
        exp.setDestinataireVille(demande.getDestinataireVille());
        exp.setOrigine(demande.getOrigine());
        exp.setDestination(demande.getDestination());
        exp.setTypeMarchandise(demande.getTypeMarchandise());
        exp.setPoidsKg(demande.getPoidsKg());
        exp.setPrixConvenu(offre.getPrixPropose());
        exp.setStatut(StatutExpedition.A_PAYER);
        exp.setDateLivraisonEstimee(demande.getDateChargement());
        exp.setPositionLat(12.5598); // Coordonnées Ziguinchor
        exp.setPositionLng(-16.2734);
        exp.setPositionDerniereMaj(Instant.now().toString());

        exp.getHistorique().add(new EvenementHistorique(
                StatutExpedition.A_PAYER,
                "Offre de " + offre.getCamionneurNom() + " acceptée. En attente de consignation du séquestre Wave par le commerçant.",
                demande.getCommercantNom()
        ));

        Expedition savedExp = expeditionRepository.save(exp);

        Map<String, Object> result = new HashMap<>();
        result.put("offre", offre);
        result.put("expedition", savedExp);
        return result;
    }

    @Transactional
    public OffreTransport refuserOffre(String offreId, User auteur) {
        OffreTransport offre = getById(offreId);
        DemandeTransport demande = demandeRepository.findById(offre.getDemandeId())
                .orElseThrow(() -> new IllegalArgumentException("Demande introuvable."));

        if (!demande.getCommercantId().equals(auteur.getId()) && auteur.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à refuser cette offre.");
        }

        offre.setStatut(StatutOffre.REFUSEE);
        return offreRepository.save(offre);
    }

    @Transactional
    public OffreTransport faireContreProposition(String offreId, ContrePropositionRequest req, User auteur) {
        OffreTransport offre = getById(offreId);
        offre.setStatut(StatutOffre.CONTRE_PROPOSITION);
        offre.setContrePropositionPrix(req.prix());
        offre.setContrePropositionMessage(req.message());
        offre.setContrePropositionAuteurRole(req.auteurRole() != null ? req.auteurRole() : auteur.getRole().name());
        offre.setContrePropositionDate(Instant.now().toString());

        return offreRepository.save(offre);
    }
}
