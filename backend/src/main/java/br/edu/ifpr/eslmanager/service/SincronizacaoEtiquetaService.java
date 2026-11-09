package br.edu.ifpr.eslmanager.service;

import br.edu.ifpr.eslmanager.adapter.ConteudoDispositivo;
import br.edu.ifpr.eslmanager.adapter.EtiquetaTransport;
import br.edu.ifpr.eslmanager.adapter.ResultadoEnvio;
import br.edu.ifpr.eslmanager.domain.ErroAtualizacao;
import br.edu.ifpr.eslmanager.api.dto.ProdutoResponse;
import br.edu.ifpr.eslmanager.repository.EtiquetaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

@Service
public class SincronizacaoEtiquetaService {
    private static final Logger log = LoggerFactory.getLogger(SincronizacaoEtiquetaService.class);
    private final EtiquetaRepository etiquetas;
    private final EtiquetaTransport transporte;
    private final TransactionTemplate transacao;

    public SincronizacaoEtiquetaService(EtiquetaRepository etiquetas, EtiquetaTransport transporte,
            PlatformTransactionManager transactionManager) {
        this.etiquetas = etiquetas;
        this.transporte = transporte;
        transacao = new TransactionTemplate(transactionManager);
        transacao.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    // A reivindicação e a leitura ocorrem juntas; nenhuma transação acompanha o HTTP.
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public boolean sincronizar(Long etiquetaId, long versao) {
        Envio envio = transacao.execute(status -> {
            if (etiquetas.iniciarEnvio(etiquetaId, versao) != 1) return null;
            var etiqueta = etiquetas.findById(etiquetaId).orElseThrow();
            var produto = etiqueta.getProduto();
            return new Envio(etiqueta.getHost(), etiqueta.getPorta(),
                new ConteudoDispositivo(etiqueta.getCodigoDispositivo(), versao,
                    produto == null ? null : ProdutoResponse.from(produto)));
        });
        if (envio == null) return false;
        ResultadoEnvio resultado;
        try {
            resultado = transporte.enviar(envio.host(), envio.porta(), envio.conteudo());
            if (resultado == null) resultado = ResultadoEnvio.falha(ErroAtualizacao.FALHA_INTERNA);
        } catch (RuntimeException exception) {
            log.warn("Etiqueta {}: falha interna no transporte ({}).", etiquetaId, exception.getClass().getSimpleName());
            resultado = ResultadoEnvio.falha(ErroAtualizacao.FALHA_INTERNA);
        }
        var finalResultado = resultado;
        var conteudo = envio.conteudo();
        try {
            Integer alteradas = transacao.execute(status -> finalResultado.confirmado()
                ? etiquetas.confirmarSeAtual(etiquetaId, conteudo.codigoDispositivo(), conteudo.versao(), envio.host(), envio.porta())
                : etiquetas.falharSeAtual(etiquetaId, conteudo.codigoDispositivo(), conteudo.versao(), envio.host(), envio.porta(), finalResultado.erro()));
            return finalResultado.confirmado() && Integer.valueOf(1).equals(alteradas);
        } catch (RuntimeException exception) {
            log.warn("Etiqueta {}: não foi possível persistir o resultado ({}).", etiquetaId, exception.getClass().getSimpleName());
            return false;
        }
    }

    public void envioNaoAgendado(Long id, long versao) {
        transacao.executeWithoutResult(status -> etiquetas.envioNaoAgendado(id, versao));
    }

    public void interromperEnvios() {
        transacao.executeWithoutResult(status -> etiquetas.interromperEnvios());
    }

    private record Envio(String host, int porta, ConteudoDispositivo conteudo) {}
}
