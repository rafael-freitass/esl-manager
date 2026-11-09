package br.edu.ifpr.eslmanager.service;

import br.edu.ifpr.eslmanager.api.dto.RegistroDispositivoRequest;
import br.edu.ifpr.eslmanager.api.dto.RegistroDispositivoResponse;
import java.util.Locale;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DispositivoService {
    private final EtiquetaService etiquetaService;
    private final ApplicationEventPublisher eventos;

    public DispositivoService(EtiquetaService etiquetaService, ApplicationEventPublisher eventos) {
        this.etiquetaService = etiquetaService;
        this.eventos = eventos;
    }

    @Transactional
    public RegistroDispositivoResponse registrar(RegistroDispositivoRequest request) {
        var etiqueta = etiquetaService.buscarPorCodigoParaAtualizar(request.codigoDispositivo());
        etiqueta.registrarContato(request.host().trim().toLowerCase(Locale.ROOT), request.porta());
        eventos.publishEvent(new SincronizacaoEtiquetaSolicitada(etiqueta.getId(), etiqueta.getVersaoAtualizacao()));
        return new RegistroDispositivoResponse(etiqueta.getCodigoDispositivo(), etiqueta.getHost(), etiqueta.getPorta());
    }
}
