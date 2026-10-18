package sn.uasz.edepot.dto;

import sn.uasz.edepot.model.ResolutionLitige;

public record ArbitrageRequest(ResolutionLitige resolution, String motif, Double montantRembourse) {}
