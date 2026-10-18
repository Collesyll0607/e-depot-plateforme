package sn.uasz.edepot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uasz.edepot.model.Evaluation;

import java.util.List;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, String> {
    List<Evaluation> findByCibleId(String cibleId);
    List<Evaluation> findByAuteurId(String auteurId);
    List<Evaluation> findByExpeditionId(String expeditionId);
}
