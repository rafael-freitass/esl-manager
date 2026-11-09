package br.edu.ifpr.eslmanager.service;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

// MVP com uma única instância: tentativas de um processo anterior não continuam ativas.
@Component
public class RecuperacaoSincronizacao implements ApplicationRunner {
    private final SincronizacaoEtiquetaService sincronizacao;
    public RecuperacaoSincronizacao(SincronizacaoEtiquetaService sincronizacao) {
        this.sincronizacao = sincronizacao;
    }
    @Override
    public void run(ApplicationArguments args) { sincronizacao.interromperEnvios(); }
}
