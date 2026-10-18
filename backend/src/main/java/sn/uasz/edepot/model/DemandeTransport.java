package sn.uasz.edepot.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "edepot_demandes")
public class DemandeTransport {

    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String reference;

    @Column(nullable = false)
    private String commercantId;

    @Column(nullable = false)
    private String commercantNom;

    private String commercantTelephone;

    @Column(nullable = false)
    private String origine;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private String dateChargement;

    private String dateLivraisonSouhaitee;

    @Column(nullable = false)
    private String typeMarchandise;

    @Column(nullable = false)
    private Double poidsKg;

    private Double volumeM3;

    @Column(length = 1000)
    private String instructionsManutention;

    @Column(nullable = false)
    private Double prixPropose;

    // Destinataire
    @Column(nullable = false)
    private String destinataireNom;

    @Column(nullable = false)
    private String destinataireTelephone;

    private String destinataireAdresse;
    private String destinataireVille;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutDemande statut = StatutDemande.OUVERTE;

    @Column(nullable = false)
    private String dateCreation;

    private Integer nombreOffres = 0;

    public DemandeTransport() {
        this.dateCreation = Instant.now().toString();
    }

    public DemandeTransport(String commercantNom, String commercantTelephone, String origine, String destination, Double poidsKg, String typeMarchandise, Double prixPropose) {
        this();
        this.commercantNom = commercantNom;
        this.commercantTelephone = commercantTelephone;
        this.commercantId = "comm-auto";
        this.origine = origine;
        this.destination = destination;
        this.poidsKg = poidsKg;
        this.typeMarchandise = typeMarchandise;
        this.prixPropose = prixPropose;
        this.destinataireNom = "Destinataire " + destination;
        this.destinataireTelephone = commercantTelephone;
        this.reference = "DEM-" + System.currentTimeMillis();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setId(Long id) {
        this.id = id != null ? String.valueOf(id) : null;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public String getCommercantId() {
        return commercantId;
    }

    public void setCommercantId(String commercantId) {
        this.commercantId = commercantId;
    }

    public String getCommercantNom() {
        return commercantNom;
    }

    public void setCommercantNom(String commercantNom) {
        this.commercantNom = commercantNom;
    }

    public String getCommercantTelephone() {
        return commercantTelephone;
    }

    public void setCommercantTelephone(String commercantTelephone) {
        this.commercantTelephone = commercantTelephone;
    }

    public String getOrigine() {
        return origine;
    }

    public void setOrigine(String origine) {
        this.origine = origine;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getDateChargement() {
        return dateChargement;
    }

    public void setDateChargement(String dateChargement) {
        this.dateChargement = dateChargement;
    }

    public String getDateLivraisonSouhaitee() {
        return dateLivraisonSouhaitee;
    }

    public void setDateLivraisonSouhaitee(String dateLivraisonSouhaitee) {
        this.dateLivraisonSouhaitee = dateLivraisonSouhaitee;
    }

    public String getTypeMarchandise() {
        return typeMarchandise;
    }

    public void setTypeMarchandise(String typeMarchandise) {
        this.typeMarchandise = typeMarchandise;
    }

    public Double getPoidsKg() {
        return poidsKg;
    }

    public void setPoidsKg(Double poidsKg) {
        this.poidsKg = poidsKg;
    }

    public Double getVolumeM3() {
        return volumeM3;
    }

    public void setVolumeM3(Double volumeM3) {
        this.volumeM3 = volumeM3;
    }

    public String getInstructionsManutention() {
        return instructionsManutention;
    }

    public void setInstructionsManutention(String instructionsManutention) {
        this.instructionsManutention = instructionsManutention;
    }

    public Double getPrixPropose() {
        return prixPropose;
    }

    public void setPrixPropose(Double prixPropose) {
        this.prixPropose = prixPropose;
    }

    public String getDestinataireNom() {
        return destinataireNom;
    }

    public void setDestinataireNom(String destinataireNom) {
        this.destinataireNom = destinataireNom;
    }

    public String getDestinataireTelephone() {
        return destinataireTelephone;
    }

    public void setDestinataireTelephone(String destinataireTelephone) {
        this.destinataireTelephone = destinataireTelephone;
    }

    public String getDestinataireAdresse() {
        return destinataireAdresse;
    }

    public void setDestinataireAdresse(String destinataireAdresse) {
        this.destinataireAdresse = destinataireAdresse;
    }

    public String getDestinataireVille() {
        return destinataireVille;
    }

    public void setDestinataireVille(String destinataireVille) {
        this.destinataireVille = destinataireVille;
    }

    public StatutDemande getStatut() {
        return statut;
    }

    public void setStatut(StatutDemande statut) {
        this.statut = statut;
    }

    public String getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(String dateCreation) {
        this.dateCreation = dateCreation;
    }

    public Integer getNombreOffres() {
        return nombreOffres;
    }

    public void setNombreOffres(Integer nombreOffres) {
        this.nombreOffres = nombreOffres;
    }

    @JsonProperty("destinataire")
    public DestinataireDto getDestinataire() {
        return new DestinataireDto(destinataireNom, destinataireTelephone, destinataireAdresse, destinataireVille);
    }

    public void setDestinataire(DestinataireDto dto) {
        if (dto != null) {
            this.destinataireNom = dto.nom();
            this.destinataireTelephone = dto.telephone();
            this.destinataireAdresse = dto.adresse();
            this.destinataireVille = dto.ville();
        }
    }

    public static record DestinataireDto(String nom, String telephone, String adresse, String ville) {}
}
