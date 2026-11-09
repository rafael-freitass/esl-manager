package br.edu.ifpr.eslmanager.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.DynamicUpdate;

@Entity
@Table(name = "etiquetas")
@DynamicUpdate // As mutações também exigem bloqueio de linha no serviço.
public class Etiqueta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 24)
    private String nome;

    @Column(name = "codigo_dispositivo", nullable = false, unique = true, length = 64)
    private String codigoDispositivo;

    @Column(length = 45)
    private String host;

    private Integer porta;

    @ManyToOne
    @JoinColumn(name = "produto_id")
    private Produto produto;

    @Column(name = "versao_atualizacao", nullable = false)
    private long versaoAtualizacao;

    @Column(name = "versao_confirmada", nullable = false)
    private long versaoConfirmada;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_atualizacao", nullable = false, length = 16)
    private StatusAtualizacao statusAtualizacao = StatusAtualizacao.PENDENTE;

    @Enumerated(EnumType.STRING)
    @Column(name = "erro_atualizacao", length = 32)
    private ErroAtualizacao erroAtualizacao;

    protected Etiqueta() {}

    public Etiqueta(String nome, String codigoDispositivo) {
        this.nome = nome;
        this.codigoDispositivo = codigoDispositivo;
        this.versaoAtualizacao = 1;
    }

    public void atualizar(String nome, String codigoDispositivo) {
        if (!this.codigoDispositivo.equals(codigoDispositivo)) {
            host = null;
            porta = null;
            marcarAtualizacaoPendente();
        }
        this.nome = nome;
        this.codigoDispositivo = codigoDispositivo;
    }

    public void registrarContato(String host, int porta) {
        this.host = host;
        this.porta = porta;
        // Cada registro exige novo ACK, inclusive no mesmo endereço após reinício.
        marcarAtualizacaoPendente();
    }

    public boolean associar(Produto produto) {
        if (this.produto != null && this.produto.getCodigoBarras().equals(produto.getCodigoBarras())) return false;
        this.produto = produto;
        marcarAtualizacaoPendente();
        return true;
    }

    public boolean desassociar() {
        if (produto == null) return false;
        this.produto = null;
        marcarAtualizacaoPendente();
        return true;
    }

    public void marcarAtualizacaoPendente() {
        versaoAtualizacao++;
        statusAtualizacao = StatusAtualizacao.PENDENTE;
        erroAtualizacao = null;
    }

    public boolean isPendente() {
        return versaoConfirmada <= 0 || versaoAtualizacao != versaoConfirmada;
    }

    public boolean isAguardandoRegistro() {
        return host == null || host.isBlank() || porta == null;
    }

    public boolean isPodeExcluir() {
        boolean inicial = produto == null && host == null && porta == null
            && versaoAtualizacao == 1 && versaoConfirmada == 0;
        return inicial || (produto == null && statusAtualizacao == StatusAtualizacao.ATUALIZADA
            && !isPendente());
    }

    public String getMotivoBloqueioExclusao() {
        if (isPodeExcluir()) return null;
        if (produto != null) return "Desassocie o produto e aguarde a confirmação de limpeza antes de excluir a etiqueta ou trocar seu código.";
        if (statusAtualizacao == StatusAtualizacao.ERRO)
            return "A limpeza não foi confirmada. Registre novamente o dispositivo para solicitar uma nova tentativa antes de excluir ou trocar o código.";
        return "Aguarde a confirmação de limpeza antes de excluir a etiqueta ou trocar seu código.";
    }

    public StatusAtualizacao getStatusAtualizacao() { return statusAtualizacao; }
    public ErroAtualizacao getErroAtualizacao() { return erroAtualizacao; }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getCodigoDispositivo() { return codigoDispositivo; }
    public String getHost() { return host; }
    public Integer getPorta() { return porta; }
    public Produto getProduto() { return produto; }
    public long getVersaoAtualizacao() { return versaoAtualizacao; }
    public long getVersaoConfirmada() { return versaoConfirmada; }
}
