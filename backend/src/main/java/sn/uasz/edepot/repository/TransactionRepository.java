package sn.uasz.edepot.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sn.uasz.edepot.model.Transaction;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByCommercantId(String commercantId);
    List<Transaction> findByCamionneurId(String camionneurId);
    Optional<Transaction> findByExpeditionId(String expeditionId);
}
