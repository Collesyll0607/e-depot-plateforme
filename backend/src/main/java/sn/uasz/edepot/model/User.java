package sn.uasz.edepot.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "edepot_users")
public class User {

    @Id
    private String id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String telephone;

    @JsonIgnore
    @Column(nullable = false)
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    private String avatarUrl;
    private String adresse;
    private String ville;

    @Column(nullable = false)
    private String dateInscription;

    private boolean verifie = true;
    private Double noteMoyenne = 5.0;
    private Integer nombreAvis = 0;

    // Spécifique Commerçant
    private String nomEntreprise;
    private String secteurActivite;

    // Spécifique Camionneur
    private String typeCamion;
    private Integer capaciteKg;
    private String immatriculation;
    private Boolean disponible = true;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_zones_desservies", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "zone")
    private List<String> zonesDesservies = new ArrayList<>();

    // Documents camionneur
    private Boolean permisValide = true;
    private Boolean carteGriseValide = true;
    private Boolean assuranceValide = true;

    public User() {
        this.dateInscription = Instant.now().toString();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getMotDePasse() {
        return motDePasse;
    }

    public void setMotDePasse(String motDePasse) {
        this.motDePasse = motDePasse;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public String getDateInscription() {
        return dateInscription;
    }

    public void setDateInscription(String dateInscription) {
        this.dateInscription = dateInscription;
    }

    public boolean isVerifie() {
        return verifie;
    }

    public void setVerifie(boolean verifie) {
        this.verifie = verifie;
    }

    public Double getNoteMoyenne() {
        return noteMoyenne;
    }

    public void setNoteMoyenne(Double noteMoyenne) {
        this.noteMoyenne = noteMoyenne;
    }

    public Integer getNombreAvis() {
        return nombreAvis;
    }

    public void setNombreAvis(Integer nombreAvis) {
        this.nombreAvis = nombreAvis;
    }

    public String getNomEntreprise() {
        return nomEntreprise;
    }

    public void setNomEntreprise(String nomEntreprise) {
        this.nomEntreprise = nomEntreprise;
    }

    public String getSecteurActivite() {
        return secteurActivite;
    }

    public void setSecteurActivite(String secteurActivite) {
        this.secteurActivite = secteurActivite;
    }

    public String getTypeCamion() {
        return typeCamion;
    }

    public void setTypeCamion(String typeCamion) {
        this.typeCamion = typeCamion;
    }

    public Integer getCapaciteKg() {
        return capaciteKg;
    }

    public void setCapaciteKg(Integer capaciteKg) {
        this.capaciteKg = capaciteKg;
    }

    public String getImmatriculation() {
        return immatriculation;
    }

    public void setImmatriculation(String immatriculation) {
        this.immatriculation = immatriculation;
    }

    public Boolean getDisponible() {
        return disponible;
    }

    public void setDisponible(Boolean disponible) {
        this.disponible = disponible;
    }

    public List<String> getZonesDesservies() {
        return zonesDesservies;
    }

    public void setZonesDesservies(List<String> zonesDesservies) {
        this.zonesDesservies = zonesDesservies;
    }

    public Boolean getPermisValide() {
        return permisValide;
    }

    public void setPermisValide(Boolean permisValide) {
        this.permisValide = permisValide;
    }

    public Boolean getCarteGriseValide() {
        return carteGriseValide;
    }

    public void setCarteGriseValide(Boolean carteGriseValide) {
        this.carteGriseValide = carteGriseValide;
    }

    public Boolean getAssuranceValide() {
        return assuranceValide;
    }

    public void setAssuranceValide(Boolean assuranceValide) {
        this.assuranceValide = assuranceValide;
    }

    // Helper structure for frontend documents compatibility
    @JsonProperty("documents")
    public Object getDocumentsInfo() {
        if (role != UserRole.CAMIONNEUR) return null;
        return new DocumentsDto(permisValide != null && permisValide,
                                carteGriseValide != null && carteGriseValide,
                                assuranceValide != null && assuranceValide);
    }

    public static record DocumentsDto(boolean permisValide, boolean carteGriseValide, boolean assuranceValide) {}
}
