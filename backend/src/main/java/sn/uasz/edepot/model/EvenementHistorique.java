package sn.uasz.edepot.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "edepot_evenements")
public class EvenementHistorique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutExpedition statut;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String auteur;

    public EvenementHistorique() {
        this.date = Instant.now().toString();
    }

    public EvenementHistorique(StatutExpedition statut, String description, String auteur) {
        this.date = Instant.now().toString();
        this.statut = statut;
        this.description = description;
        this.auteur = auteur;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public StatutExpedition getStatut() {
        return statut;
    }

    public void setStatut(StatutExpedition statut) {
        this.statut = statut;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAuteur() {
        return auteur;
    }

    public void setAuteur(String auteur) {
        this.auteur = auteur;
    }
}
