package sn.uasz.edepot.dto;

import sn.uasz.edepot.model.StatutExpedition;

public record UpdateStatusRequest(StatutExpedition statut, String note) {}
