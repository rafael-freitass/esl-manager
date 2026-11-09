package br.edu.ifpr.eslmanager.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EtiquetaRequest(
    @NotBlank @Size(max = 24) String nome,
    @NotBlank @Size(max = 64) String codigoDispositivo
) {}
