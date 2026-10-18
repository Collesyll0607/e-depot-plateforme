package sn.uasz.edepot.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.uasz.edepot.model.Evaluation;
import sn.uasz.edepot.model.User;
import sn.uasz.edepot.repository.EvaluationRepository;
import sn.uasz.edepot.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final UserRepository userRepository;

    public EvaluationService(EvaluationRepository evaluationRepository, UserRepository userRepository) {
        this.evaluationRepository = evaluationRepository;
        this.userRepository = userRepository;
    }

    public List<Evaluation> getEvaluations(String cibleId, String auteurId) {
        List<Evaluation> list = evaluationRepository.findAll();
        if (cibleId != null && !cibleId.trim().isEmpty()) {
            list = list.stream().filter(e -> cibleId.equals(e.getCibleId())).collect(Collectors.toList());
        }
        if (auteurId != null && !auteurId.trim().isEmpty()) {
            list = list.stream().filter(e -> auteurId.equals(e.getAuteurId())).collect(Collectors.toList());
        }
        return list;
    }

    @Transactional
    public Evaluation creerEvaluation(Evaluation ev, User auteur) {
        ev.setId("ev-" + UUID.randomUUID().toString().substring(0, 8));
        ev.setAuteurId(auteur.getId());
        ev.setAuteurNom(auteur.getNom());
        ev.setAuteurRole(auteur.getRole().name());

        Evaluation saved = evaluationRepository.save(ev);

        // Mettre à jour la note moyenne de la cible
        Optional<User> cibleOpt = userRepository.findById(ev.getCibleId());
        if (cibleOpt.isPresent()) {
            User cible = cibleOpt.get();
            List<Evaluation> tousAvis = evaluationRepository.findByCibleId(cible.getId());
            double moyenne = tousAvis.stream().mapToInt(Evaluation::getNote).average().orElse(5.0);
            cible.setNoteMoyenne(Math.round(moyenne * 10.0) / 10.0);
            cible.setNombreAvis(tousAvis.size());
            userRepository.save(cible);
        }

        return saved;
    }
}
