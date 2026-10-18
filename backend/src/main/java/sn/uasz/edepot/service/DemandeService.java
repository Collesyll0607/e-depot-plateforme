package sn.uasz.edepot.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.uasz.edepot.model.DemandeTransport;
import sn.uasz.edepot.model.StatutDemande;
import sn.uasz.edepot.model.User;
import sn.uasz.edepot.model.UserRole;
import sn.uasz.edepot.repository.DemandeRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DemandeService {

    private final DemandeRepository demandeRepository;

    public DemandeService(DemandeRepository demandeRepository) {
        this.demandeRepository = demandeRepository;
    }

    public List<DemandeTransport> getDemandes(String commercantId, String statut, String zone) {
        List<DemandeTransport> list = demandeRepository.findAll();

        if (commercantId != null && !commercantId.trim().isEmpty()) {
            list = list.stream().filter(d -> commercantId.equals(d.getCommercantId())).collect(Collectors.toList());
        }
        if (statut != null && !statut.trim().isEmpty()) {
            list = list.stream().filter(d -> statut.equalsIgnoreCase(d.getStatut().name())).collect(Collectors.toList());
        }
        if (zone != null && !zone.trim().isEmpty()) {
            list = list.stream().filter(d -> zone.equalsIgnoreCase(d.getOrigine()) || zone.equalsIgnoreCase(d.getDestination())).collect(Collectors.toList());
        }
        return list;
    }

    public DemandeTransport getById(String id) {
        return demandeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Demande de transport introuvable (ID: " + id + ")"));
    }

    @Transactional
    public DemandeTransport creerDemande(DemandeTransport demande, User auteur) {
        if (auteur.getRole() != UserRole.COMMERCANT && auteur.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("Seuls les expéditeurs / commerçants peuvent publier des demandes de fret.");
        }

        demande.setId("dem-" + UUID.randomUUID().toString().substring(0, 8));
        demande.setCommercantId(auteur.getId());
        demande.setCommercantNom(auteur.getNom());
        demande.setCommercantTelephone(auteur.getTelephone());
        demande.setReference("DEM-2025-" + String.format("%03d", (demandeRepository.count() + 1)));
        demande.setStatut(StatutDemande.OUVERTE);
        demande.setNombreOffres(0);

        return demandeRepository.save(demande);
    }

    @Transactional
    public DemandeTransport annulerDemande(String id, User auteur) {
        DemandeTransport d = getById(id);
        if (!d.getCommercantId().equals(auteur.getId()) && auteur.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à annuler cette annonce.");
        }
        d.setStatut(StatutDemande.ANNULEE);
        return demandeRepository.save(d);
    }
}
