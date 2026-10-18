package sn.uasz.edepot.dto;

import sn.uasz.edepot.model.User;

public record AuthResponse(User user, String token) {}
