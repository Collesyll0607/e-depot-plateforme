package sn.uasz.edepot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uasz.edepot.model.DemandeTransport;
import sn.uasz.edepot.model.StatutDemande;

import java.util.List;

@Repository
public interface DemandeRepository extends JpaRepository<DemandeTransport, String> {
    List<DemandeTransport> findByCommercantId(String commercantId);
    List<DemandeTransport> findByStatut(StatutDemande statut);
    List<DemandeTransport> findByOrigineOrDestination(String origine, String destination);
    long countByStatut(StatutDemande statut);
}
