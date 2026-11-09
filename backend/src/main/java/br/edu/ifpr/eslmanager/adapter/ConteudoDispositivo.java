package br.edu.ifpr.eslmanager.adapter;

import br.edu.ifpr.eslmanager.api.dto.ProdutoResponse;
import com.fasterxml.jackson.annotation.JsonInclude;

public record ConteudoDispositivo(
    String codigoDispositivo,
    long versao,
    @JsonInclude(JsonInclude.Include.ALWAYS) ProdutoResponse produto
) {}
