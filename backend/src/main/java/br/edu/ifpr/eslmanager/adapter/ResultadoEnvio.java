package br.edu.ifpr.eslmanager.adapter;

import br.edu.ifpr.eslmanager.domain.ErroAtualizacao;

public record ResultadoEnvio(ErroAtualizacao erro) {
    public boolean confirmado() { return erro == null; }
    public static ResultadoEnvio sucesso() { return new ResultadoEnvio(null); }
    public static ResultadoEnvio falha(ErroAtualizacao erro) {
        return new ResultadoEnvio(java.util.Objects.requireNonNull(erro));
    }
}
