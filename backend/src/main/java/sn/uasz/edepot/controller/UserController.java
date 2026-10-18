package sn.uasz.edepot.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import sn.uasz.edepot.model.User;
import sn.uasz.edepot.model.UserRole;
import sn.uasz.edepot.repository.UserRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Utilisateurs", description = "Gestion des profils et administration des comptes")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    @Operation(summary = "Lister les utilisateurs (réservé à l'administration)")
    public ResponseEntity<List<User>> getAllUsers(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtenir les détails d'un utilisateur")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Mettre à jour son profil utilisateur ou administrer un compte")
    public ResponseEntity<?> updateUser(
            @PathVariable String id,
            @RequestBody Map<String, Object> updates,
            @AuthenticationPrincipal User currentUser
    ) {
        return userRepository.findById(id).map(user -> {
            // Seul l'utilisateur lui-même ou un administrateur peut modifier le compte
            if (!user.getId().equals(currentUser.getId()) && currentUser.getRole() != UserRole.ADMIN) {
                return ResponseEntity.status(403).body((Object) Map.of("message", "Action non autorisée."));
            }

            if (updates.containsKey("nom")) user.setNom((String) updates.get("nom"));
            if (updates.containsKey("telephone")) user.setTelephone((String) updates.get("telephone"));
            if (updates.containsKey("adresse")) user.setAdresse((String) updates.get("adresse"));
            if (updates.containsKey("ville")) user.setVille((String) updates.get("ville"));
            if (updates.containsKey("nomEntreprise")) user.setNomEntreprise((String) updates.get("nomEntreprise"));
            if (updates.containsKey("secteurActivite")) user.setSecteurActivite((String) updates.get("secteurActivite"));
            if (updates.containsKey("typeCamion")) user.setTypeCamion((String) updates.get("typeCamion"));
            if (updates.containsKey("immatriculation")) user.setImmatriculation((String) updates.get("immatriculation"));
            if (updates.containsKey("disponible")) user.setDisponible((Boolean) updates.get("disponible"));

            if (updates.containsKey("capaciteKg") && updates.get("capaciteKg") != null) {
                user.setCapaciteKg(((Number) updates.get("capaciteKg")).intValue());
            }

            if (updates.containsKey("zonesDesservies") && updates.get("zonesDesservies") instanceof List) {
                user.setZonesDesservies((List<String>) updates.get("zonesDesservies"));
            }

            // Validation de compte par l'administrateur
            if (updates.containsKey("verifie") && currentUser.getRole() == UserRole.ADMIN) {
                user.setVerifie((Boolean) updates.get("verifie"));
            }

            return ResponseEntity.ok((Object) userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }
}
