package br.edu.ifpr.eslmanager.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record PrecoProdutoRequest(
    @NotNull @DecimalMin("0.00") @Digits(integer = 8, fraction = 2) BigDecimal preco
) {}
