package sn.uasz.edepot.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "edepot_litiges")
public class Litige {

    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String reference;

    @Column(nullable = false)
    private String expeditionId;

    @Column(nullable = false)
    private String expeditionReference;

    @Column(nullable = false)
    private String declarantId;

    @Column(nullable = false)
    private String declarantNom;

    @Column(nullable = false)
    private String declarantRole;

    @Column(nullable = false)
    private String motif;

    @Column(nullable = false, length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutLitige statut = StatutLitige.OUVERT;

    @Enumerated(EnumType.STRING)
    private ResolutionLitige typeResolution;

    @Column(length = 2000)
    private String decisionAdmin;

    @Column(nullable = false)
    private String dateCreation;

    private String dateResolution;

    public Litige() {
        this.dateCreation = Instant.now().toString();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public String getExpeditionId() {
        return expeditionId;
    }

    public void setExpeditionId(String expeditionId) {
        this.expeditionId = expeditionId;
    }

    public String getExpeditionReference() {
        return expeditionReference;
    }

    public void setExpeditionReference(String expeditionReference) {
        this.expeditionReference = expeditionReference;
    }

    public String getDeclarantId() {
        return declarantId;
    }

    public void setDeclarantId(String declarantId) {
        this.declarantId = declarantId;
    }

    public String getDeclarantNom() {
        return declarantNom;
    }

    public void setDeclarantNom(String declarantNom) {
        this.declarantNom = declarantNom;
    }

    public String getDeclarantRole() {
        return declarantRole;
    }

    public void setDeclarantRole(String declarantRole) {
        this.declarantRole = declarantRole;
    }

    public String getMotif() {
        return motif;
    }

    public void setMotif(String motif) {
        this.motif = motif;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public StatutLitige getStatut() {
        return statut;
    }

    public void setStatut(StatutLitige statut) {
        this.statut = statut;
    }

    public ResolutionLitige getTypeResolution() {
        return typeResolution;
    }

    public void setTypeResolution(ResolutionLitige typeResolution) {
        this.typeResolution = typeResolution;
    }

    public String getDecisionAdmin() {
        return decisionAdmin;
    }

    public void setDecisionAdmin(String decisionAdmin) {
        this.decisionAdmin = decisionAdmin;
    }

    public String getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(String dateCreation) {
        this.dateCreation = dateCreation;
    }

    public String getDateResolution() {
        return dateResolution;
    }

    public void setDateResolution(String dateResolution) {
        this.dateResolution = dateResolution;
    }
}
