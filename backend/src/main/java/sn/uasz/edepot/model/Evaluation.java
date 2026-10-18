package sn.uasz.edepot.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "edepot_evaluations")
public class Evaluation {

    @Id
    private String id;

    @Column(nullable = false)
    private String expeditionId;

    @Column(nullable = false)
    private String auteurId;

    @Column(nullable = false)
    private String auteurNom;

    @Column(nullable = false)
    private String auteurRole;

    @Column(nullable = false)
    private String cibleId;

    @Column(nullable = false)
    private String cibleNom;

    @Column(nullable = false)
    private Integer note;

    @Column(nullable = false, length = 1500)
    private String commentaire;

    @Column(nullable = false)
    private String date;

    public Evaluation() {
        this.date = Instant.now().toString();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getExpeditionId() {
        return expeditionId;
    }

    public void setExpeditionId(String expeditionId) {
        this.expeditionId = expeditionId;
    }

    public String getAuteurId() {
        return auteurId;
    }

    public void setAuteurId(String auteurId) {
        this.auteurId = auteurId;
    }

    public String getAuteurNom() {
        return auteurNom;
    }

    public void setAuteurNom(String auteurNom) {
        this.auteurNom = auteurNom;
    }

    public String getAuteurRole() {
        return auteurRole;
    }

    public void setAuteurRole(String auteurRole) {
        this.auteurRole = auteurRole;
    }

    public String getCibleId() {
        return cibleId;
    }

    public void setCibleId(String cibleId) {
        this.cibleId = cibleId;
    }

    public String getCibleNom() {
        return cibleNom;
    }

    public void setCibleNom(String cibleNom) {
        this.cibleNom = cibleNom;
    }

    public Integer getNote() {
        return note;
    }

    public void setNote(Integer note) {
        this.note = note;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}
