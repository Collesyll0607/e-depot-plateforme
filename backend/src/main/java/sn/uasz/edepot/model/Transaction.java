package sn.uasz.edepot.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "edepot_transactions")
public class Transaction {

    @Id
    private String id;

    @Column(nullable = false, unique = true)
    private String reference;

    @Column(nullable = false)
    private String expeditionId;

    @Column(nullable = false)
    private String expeditionReference;

    @Column(nullable = false)
    private String commercantId;

    @Column(nullable = false)
    private String commercantNom;

    @Column(nullable = false)
    private String camionneurId;

    @Column(nullable = false)
    private String camionneurNom;

    @Column(nullable = false)
    private Double montantTotal;

    @Column(nullable = false)
    private Double montantSequestre;

    @Column(nullable = false)
    private Double montantCommission;

    @Column(nullable = false)
    private Double montantNetTransporteur;

    private String waveReference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutPaiement statut = StatutPaiement.EN_ATTENTE;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JoinColumn(name = "transaction_id")
    private List<OperationFinanciere> operations = new ArrayList<>();

    @Column(nullable = false)
    private String dateCreation;

    public Transaction() {
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

    public Double getMontantTotal() {
        return montantTotal;
    }

    public void setMontantTotal(Double montantTotal) {
        this.montantTotal = montantTotal;
    }

    public Double getMontantSequestre() {
        return montantSequestre;
    }

    public void setMontantSequestre(Double montantSequestre) {
        this.montantSequestre = montantSequestre;
    }

    public Double getMontantCommission() {
        return montantCommission;
    }

    public void setMontantCommission(Double montantCommission) {
        this.montantCommission = montantCommission;
    }

    public Double getMontantNetTransporteur() {
        return montantNetTransporteur;
    }

    public void setMontantNetTransporteur(Double montantNetTransporteur) {
        this.montantNetTransporteur = montantNetTransporteur;
    }

    public String getWaveReference() {
        return waveReference;
    }

    public void setWaveReference(String waveReference) {
        this.waveReference = waveReference;
    }

    public StatutPaiement getStatut() {
        return statut;
    }

    public void setStatut(StatutPaiement statut) {
        this.statut = statut;
    }

    public List<OperationFinanciere> getOperations() {
        return operations;
    }

    public void setOperations(List<OperationFinanciere> operations) {
        this.operations = operations;
    }

    public String getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(String dateCreation) {
        this.dateCreation = dateCreation;
    }
}
