package sn.uasz.edepot.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sn.uasz.edepot.dto.AuthResponse;
import sn.uasz.edepot.dto.LoginRequest;
import sn.uasz.edepot.dto.RegisterRequest;
import sn.uasz.edepot.model.User;
import sn.uasz.edepot.model.UserRole;
import sn.uasz.edepot.repository.UserRepository;
import sn.uasz.edepot.security.JwtUtil;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (req.email() == null || req.email().trim().isEmpty()) {
            throw new IllegalArgumentException("L'adresse email est obligatoire.");
        }
        if (req.motDePasse() == null || req.motDePasse().length() < 6) {
            throw new IllegalArgumentException("Le mot de passe doit comporter au moins 6 caractères.");
        }
        if (userRepository.existsByEmailIgnoreCase(req.email().trim())) {
            throw new IllegalArgumentException("Un compte existe déjà avec cette adresse email.");
        }

        // RÈGLE STRICTE DE SÉCURITÉ : L'inscription publique ne peut jamais créer un profil ADMIN
        if (req.role() == UserRole.ADMIN) {
            throw new IllegalArgumentException("La création d'un compte administrateur n'est pas autorisée par cette voie.");
        }

        User user = new User();
        user.setId("user-" + UUID.randomUUID().toString().substring(0, 8));
        user.setNom(req.nom());
        user.setEmail(req.email().trim().toLowerCase());
        user.setTelephone(req.telephone());
        user.setMotDePasse(passwordEncoder.encode(req.motDePasse()));
        user.setRole(req.role() != null ? req.role() : UserRole.COMMERCANT);
        user.setAdresse(req.adresse());
        user.setVille(req.ville() != null ? req.ville() : "Ziguinchor");

        // Champs spécifiques selon profil
        if (user.getRole() == UserRole.COMMERCANT) {
            user.setNomEntreprise(req.nomEntreprise());
            user.setSecteurActivite(req.secteurActivite());
        } else if (user.getRole() == UserRole.CAMIONNEUR) {
            user.setTypeCamion(req.typeCamion() != null ? req.typeCamion() : "Plateau ridelles");
            user.setCapaciteKg(req.capaciteKg() != null ? req.capaciteKg() : 10000);
            user.setImmatriculation(req.immatriculation());
            if (req.zonesDesservies() != null && !req.zonesDesservies().isEmpty()) {
                user.setZonesDesservies(req.zonesDesservies());
            } else {
                user.getZonesDesservies().add("Ziguinchor");
                user.getZonesDesservies().add("Bignona");
                user.getZonesDesservies().add("Kolda");
            }
            user.setDisponible(true);
            user.setPermisValide(true);
            user.setCarteGriseValide(true);
            user.setAssuranceValide(true);
        }

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved);
        return new AuthResponse(saved, token);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmailIgnoreCase(req.email().trim())
                .orElseThrow(() -> new IllegalArgumentException("Identifiants incorrects. Vérifiez votre email et mot de passe."));

        if (!passwordEncoder.matches(req.motDePasse(), user.getMotDePasse())) {
            throw new IllegalArgumentException("Identifiants incorrects. Vérifiez votre email et mot de passe.");
        }

        String token = jwtUtil.generateToken(user);
        return new AuthResponse(user, token);
    }

    public User getById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable."));
    }
}
