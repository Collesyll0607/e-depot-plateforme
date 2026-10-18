package sn.uasz.edepot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uasz.edepot.model.Expedition;
import sn.uasz.edepot.model.StatutExpedition;

import java.util.List;

@Repository
public interface ExpeditionRepository extends JpaRepository<Expedition, String> {
    List<Expedition> findByCommercantId(String commercantId);
    List<Expedition> findByCamionneurId(String camionneurId);
    List<Expedition> findByDestinataireTelephone(String telephone);
    List<Expedition> findByStatut(StatutExpedition statut);
    long countByStatut(StatutExpedition statut);
}
