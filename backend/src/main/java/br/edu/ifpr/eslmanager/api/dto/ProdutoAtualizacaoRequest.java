package br.edu.ifpr.eslmanager.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ProdutoAtualizacaoRequest(
    @NotBlank @Size(max = 120) String nome,
    @NotNull @DecimalMin("0.00") @Digits(integer = 8, fraction = 2) BigDecimal preco
) {}
