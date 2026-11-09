package br.edu.ifpr.eslmanager.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "produtos")
public class Produto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_barras", nullable = false, unique = true, length = 32)
    private String codigoBarras;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    protected Produto() {}

    public Produto(String codigoBarras, String nome, BigDecimal preco) {
        this.codigoBarras = codigoBarras;
        this.nome = nome;
        this.preco = preco;
    }

    public Long getId() { return id; }
    public String getCodigoBarras() { return codigoBarras; }
    public String getNome() { return nome; }
    public BigDecimal getPreco() { return preco; }

    public void atualizar(String nome, BigDecimal preco) {
        this.nome = nome.trim();
        this.preco = preco;
    }
}
