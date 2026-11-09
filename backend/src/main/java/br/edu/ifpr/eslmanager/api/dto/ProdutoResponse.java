package br.edu.ifpr.eslmanager.api.dto;

import br.edu.ifpr.eslmanager.domain.Produto;
import java.math.BigDecimal;

public record ProdutoResponse(String codigoBarras, String nome, BigDecimal preco) {
    public static ProdutoResponse from(Produto produto) {
        return new ProdutoResponse(produto.getCodigoBarras(), produto.getNome(), produto.getPreco());
    }
}
