package sn.uasz.edepot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uasz.edepot.model.OffreTransport;
import sn.uasz.edepot.model.StatutOffre;

import java.util.List;

@Repository
public interface OffreRepository extends JpaRepository<OffreTransport, String> {
    List<OffreTransport> findByDemandeId(String demandeId);
    List<OffreTransport> findByCamionneurId(String camionneurId);
    List<OffreTransport> findByDemandeIdAndCamionneurId(String demandeId, String camionneurId);
    long countByStatut(StatutOffre statut);
}
