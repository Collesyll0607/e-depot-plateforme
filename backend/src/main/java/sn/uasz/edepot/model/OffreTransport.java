package sn.uasz.edepot.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "edepot_offres")
public class OffreTransport {

    @Id
    private String id;

    @Column(nullable = false)
    private String demandeId;

    @Column(nullable = false)
    private String demandeReference;

    @Column(nullable = false)
    private String camionneurId;

    @Column(nullable = false)
    private String camionneurNom;

    private String camionneurTelephone;
    private Double camionneurNote = 5.0;

    @Column(nullable = false)
    private Double prixPropose;

    @Column(nullable = false)
    private String dateDisponible;

    @Column(length = 1000)
    private String conditions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutOffre statut = StatutOffre.EN_ATTENTE;

    // Contre-proposition éventuelle
    private Double contrePropositionPrix;
    @Column(length = 1000)
    private String contrePropositionMessage;
    private String contrePropositionAuteurRole;
    private String contrePropositionDate;

    @Column(nullable = false)
    private String dateCreation;

    public OffreTransport() {
        this.dateCreation = Instant.now().toString();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDemandeId() {
        return demandeId;
    }

    public void setDemandeId(String demandeId) {
        this.demandeId = demandeId;
    }

    public String getDemandeReference() {
        return demandeReference;
    }

    public void setDemandeReference(String demandeReference) {
        this.demandeReference = demandeReference;
    }

    public String getCamionneurId() {
        return camionneurId;
    }

    public void setCamionneurId(String camionneurId) {
        this.camionneurId = camionneurId;
    }

    public String getCamionneurNom() {
        return camionneurNom;
    }

    public void setCamionneurNom(String camionneurNom) {
        this.camionneurNom = camionneurNom;
    }

    public String getCamionneurTelephone() {
        return camionneurTelephone;
    }

    public void setCamionneurTelephone(String camionneurTelephone) {
        this.camionneurTelephone = camionneurTelephone;
    }

    public Double getCamionneurNote() {
        return camionneurNote;
    }

    public void setCamionneurNote(Double camionneurNote) {
        this.camionneurNote = camionneurNote;
    }

    public Double getPrixPropose() {
        return prixPropose;
    }

    public void setPrixPropose(Double prixPropose) {
        this.prixPropose = prixPropose;
    }

    public String getDateDisponible() {
        return dateDisponible;
    }

    public void setDateDisponible(String dateDisponible) {
        this.dateDisponible = dateDisponible;
    }

    public String getConditions() {
        return conditions;
    }

    public void setConditions(String conditions) {
        this.conditions = conditions;
    }

    public StatutOffre getStatut() {
        return statut;
    }

    public void setStatut(StatutOffre statut) {
        this.statut = statut;
    }

    public Double getContrePropositionPrix() {
        return contrePropositionPrix;
    }

    public void setContrePropositionPrix(Double contrePropositionPrix) {
        this.contrePropositionPrix = contrePropositionPrix;
    }

    public String getContrePropositionMessage() {
        return contrePropositionMessage;
    }

    public void setContrePropositionMessage(String contrePropositionMessage) {
        this.contrePropositionMessage = contrePropositionMessage;
    }

    public String getContrePropositionAuteurRole() {
        return contrePropositionAuteurRole;
    }

    public void setContrePropositionAuteurRole(String contrePropositionAuteurRole) {
        this.contrePropositionAuteurRole = contrePropositionAuteurRole;
    }

    public String getContrePropositionDate() {
        return contrePropositionDate;
    }

    public void setContrePropositionDate(String contrePropositionDate) {
        this.contrePropositionDate = contrePropositionDate;
    }

    public String getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(String dateCreation) {
        this.dateCreation = dateCreation;
    }

    @JsonProperty("contreProposition")
    public ContrePropositionDto getContreProposition() {
        if (contrePropositionPrix == null) return null;
        return new ContrePropositionDto(
                contrePropositionPrix,
                contrePropositionMessage,
                contrePropositionAuteurRole,
                contrePropositionDate
        );
    }

    public static record ContrePropositionDto(Double prix, String message, String auteurRole, String date) {}
}
