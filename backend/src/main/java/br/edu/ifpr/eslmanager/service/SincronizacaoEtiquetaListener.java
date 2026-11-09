package br.edu.ifpr.eslmanager.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.task.TaskExecutor;
import org.springframework.core.task.TaskRejectedException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class SincronizacaoEtiquetaListener {
    private static final Logger log = LoggerFactory.getLogger(SincronizacaoEtiquetaListener.class);
    private final SincronizacaoEtiquetaService sincronizacao;
    private final TaskExecutor executor;

    public SincronizacaoEtiquetaListener(SincronizacaoEtiquetaService sincronizacao,
            @Qualifier("etiquetaExecutor") TaskExecutor executor) {
        this.sincronizacao = sincronizacao;
        this.executor = executor;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void solicitar(SincronizacaoEtiquetaSolicitada evento) {
        try {
            executor.execute(() -> {
                try {
                    sincronizacao.sincronizar(evento.etiquetaId(), evento.versao());
                } catch (RuntimeException exception) {
                    log.warn("Etiqueta {}: falha na tarefa de envio ({}).",
                        evento.etiquetaId(), exception.getClass().getSimpleName());
                }
            });
        } catch (TaskRejectedException exception) {
            try {
                sincronizacao.envioNaoAgendado(evento.etiquetaId(), evento.versao());
            } catch (RuntimeException falha) {
                log.warn("Etiqueta {}: não foi possível persistir a rejeição do executor ({}).",
                    evento.etiquetaId(), falha.getClass().getSimpleName());
            }
            log.warn("Etiqueta {}: executor indisponível, envio não agendado.", evento.etiquetaId());
        }
    }
}
