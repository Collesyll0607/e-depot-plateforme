package sn.uasz.edepot.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "edepot_expeditions")
public class Expedition {

    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String reference;

    @Column(nullable = false)
    private String demandeId;

    @Column(nullable = false)
    private String commercantId;

    @Column(nullable = false)
    private String commercantNom;

    @Column(nullable = false)
    private String camionneurId;

    @Column(nullable = false)
    private String camionneurNom;

    private String camionneurTelephone;

    // Destinataire
    @Column(nullable = false)
    private String destinataireNom;

    @Column(nullable = false)
    private String destinataireTelephone;

    private String destinataireAdresse;
    private String destinataireVille;

    @Column(nullable = false)
    private String origine;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private String typeMarchandise;

    @Column(nullable = false)
    private Double poidsKg;

    @Column(nullable = false)
    private Double prixConvenu;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutExpedition statut = StatutExpedition.A_PAYER;

    private String codeOtp;
    private Boolean otpValide = false;

    // Position GPS
    private Double positionLat;
    private Double positionLng;
    private String positionDerniereMaj;
    private String positionSource = "DEMO";

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JoinColumn(name = "expedition_id")
    private List<EvenementHistorique> historique = new ArrayList<>();

    @Column(nullable = false)
    private String dateCreation;

    private String dateLivraisonEstimee;

    public Expedition() {
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

    public String getDemandeId() {
        return demandeId;
    }

    public void setDemandeId(String demandeId) {
        this.demandeId = demandeId;
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

    public Double getPrixConvenu() {
        return prixConvenu;
    }

    public void setPrixConvenu(Double prixConvenu) {
        this.prixConvenu = prixConvenu;
    }

    public StatutExpedition getStatut() {
        return statut;
    }

    public void setStatut(StatutExpedition statut) {
        this.statut = statut;
    }

    public String getCodeOtp() {
        return codeOtp;
    }

    public void setCodeOtp(String codeOtp) {
        this.codeOtp = codeOtp;
    }

    public Boolean getOtpValide() {
        return otpValide;
    }

    public void setOtpValide(Boolean otpValide) {
        this.otpValide = otpValide;
    }

    public Double getPositionLat() {
        return positionLat;
    }

    public void setPositionLat(Double positionLat) {
        this.positionLat = positionLat;
    }

    public Double getPositionLng() {
        return positionLng;
    }

    public void setPositionLng(Double positionLng) {
        this.positionLng = positionLng;
    }

    public String getPositionDerniereMaj() {
        return positionDerniereMaj;
    }

    public void setPositionDerniereMaj(String positionDerniereMaj) {
        this.positionDerniereMaj = positionDerniereMaj;
    }

    public String getPositionSource() {
        return positionSource;
    }

    public void setPositionSource(String positionSource) {
        this.positionSource = positionSource;
    }

    public List<EvenementHistorique> getHistorique() {
        return historique;
    }

    public void setHistorique(List<EvenementHistorique> historique) {
        this.historique = historique;
    }

    public String getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(String dateCreation) {
        this.dateCreation = dateCreation;
    }

    public String getDateLivraisonEstimee() {
        return dateLivraisonEstimee;
    }

    public void setDateLivraisonEstimee(String dateLivraisonEstimee) {
        this.dateLivraisonEstimee = dateLivraisonEstimee;
    }

    @JsonProperty("destinataire")
    public DemandeTransport.DestinataireDto getDestinataire() {
        return new DemandeTransport.DestinataireDto(destinataireNom, destinataireTelephone, destinataireAdresse, destinataireVille);
    }

    public void setDestinataire(DemandeTransport.DestinataireDto dto) {
        if (dto != null) {
            this.destinataireNom = dto.nom();
            this.destinataireTelephone = dto.telephone();
            this.destinataireAdresse = dto.adresse();
            this.destinataireVille = dto.ville();
        }
    }

    @JsonProperty("positionActuelle")
    public PositionGpsDto getPositionActuelle() {
        if (positionLat == null || positionLng == null) return null;
        return new PositionGpsDto(positionLat, positionLng, positionDerniereMaj, positionSource);
    }

    public static record PositionGpsDto(Double lat, Double lng, String derniereMiseAJour, String source) {}
}
