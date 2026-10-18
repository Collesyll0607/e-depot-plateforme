package sn.uasz.edepot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uasz.edepot.model.Litige;
import sn.uasz.edepot.model.StatutLitige;

import java.util.List;

@Repository
public interface LitigeRepository extends JpaRepository<Litige, String> {
    List<Litige> findByStatut(StatutLitige statut);
    List<Litige> findByDeclarantId(String declarantId);
    List<Litige> findByExpeditionId(String expeditionId);
    long countByStatut(StatutLitige statut);
}
