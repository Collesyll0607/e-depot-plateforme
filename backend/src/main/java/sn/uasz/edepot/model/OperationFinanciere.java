package sn.uasz.edepot.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "edepot_operations_financieres")
public class OperationFinanciere {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String date;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private Double montant;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(nullable = false)
    private String statut = "SUCCES";

    public OperationFinanciere() {
        this.date = Instant.now().toString();
    }

    public OperationFinanciere(String type, Double montant, String description, String statut) {
        this.date = Instant.now().toString();
        this.type = type;
        this.montant = montant;
        this.description = description;
        this.statut = statut;
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Double getMontant() {
        return montant;
    }

    public void setMontant(Double montant) {
        this.montant = montant;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }
}
