package sn.uasz.edepot.dto;

import sn.uasz.edepot.model.UserRole;
import java.util.List;

public record RegisterRequest(
        String nom,
        String email,
        String telephone,
        String motDePasse,
        UserRole role,
        String nomEntreprise,
        String secteurActivite,
        String typeCamion,
        Integer capaciteKg,
        String immatriculation,
        List<String> zonesDesservies,
        String adresse,
        String ville
) {}
