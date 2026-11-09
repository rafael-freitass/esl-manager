package br.edu.ifpr.eslmanager.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AssociacaoRequest(@NotBlank @Size(max = 32) String codigoBarras) {}
