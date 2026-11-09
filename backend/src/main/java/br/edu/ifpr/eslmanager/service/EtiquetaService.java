package br.edu.ifpr.eslmanager.service;

import br.edu.ifpr.eslmanager.api.dto.EtiquetaRequest;
import br.edu.ifpr.eslmanager.domain.Etiqueta;
import br.edu.ifpr.eslmanager.domain.StatusEtiqueta;
import br.edu.ifpr.eslmanager.repository.EtiquetaRepository;
import br.edu.ifpr.eslmanager.repository.ProdutoRepository;
import java.util.List;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EtiquetaService {
    private final EtiquetaRepository etiquetaRepository;
    private final ProdutoRepository produtoRepository;
    private final ApplicationEventPublisher eventos;

    public EtiquetaService(EtiquetaRepository etiquetaRepository, ProdutoRepository produtoRepository,
            ApplicationEventPublisher eventos) {
        this.etiquetaRepository = etiquetaRepository;
        this.produtoRepository = produtoRepository;
        this.eventos = eventos;
    }

    public Etiqueta cadastrar(EtiquetaRequest request) {
        validarUnicidade(request, null);
        return etiquetaRepository.save(new Etiqueta(normalizarNome(request.nome()), normalizarCodigo(request.codigoDispositivo())));
    }

    @Transactional(readOnly = true)
    public List<Etiqueta> listar(String busca, StatusEtiqueta status) {
        String buscaNormalizada = normalizarBusca(busca);
        List<Etiqueta> etiquetas = buscaNormalizada == null
            ? etiquetaRepository.findAll()
            : etiquetaRepository.buscar(buscaNormalizada);
        return etiquetas.stream()
            .filter(etiqueta -> status == null || status(etiqueta) == status).toList();
    }

    @Transactional(readOnly = true)
    public Etiqueta buscar(Long id) {
        return etiquetaRepository.findById(id).orElseThrow(() -> new NotFoundException("Etiqueta não encontrada."));
    }

    @Transactional(readOnly = true)
    public Etiqueta buscarPorCodigoDispositivo(String codigoDispositivo) {
        String codigo = normalizarCodigo(codigoDispositivo);
        return etiquetaRepository.findByCodigoDispositivoIgnoreCase(codigo)
            .orElseThrow(() -> new NotFoundException("Etiqueta não encontrada para o código informado."));
    }

    public Etiqueta atualizar(Long id, EtiquetaRequest request) {
        Etiqueta etiqueta = buscarParaAtualizar(id);
        validarUnicidade(request, id);
        if (!etiqueta.getCodigoDispositivo().equals(normalizarCodigo(request.codigoDispositivo())))
            validarLimpeza(etiqueta);
        etiqueta.atualizar(normalizarNome(request.nome()), normalizarCodigo(request.codigoDispositivo()));
        return etiqueta;
    }

    public void excluir(Long id) {
        Etiqueta etiqueta = buscarParaAtualizar(id);
        validarLimpeza(etiqueta);
        etiquetaRepository.delete(etiqueta);
    }

    private void validarLimpeza(Etiqueta etiqueta) {
        if (!etiqueta.isPodeExcluir()) throw new ConflictException(etiqueta.getMotivoBloqueioExclusao());
    }

    public Etiqueta buscarParaAtualizar(Long id) {
        return etiquetaRepository.buscarParaAtualizar(id)
            .orElseThrow(() -> new NotFoundException("Etiqueta não encontrada."));
    }

    public Etiqueta buscarPorCodigoParaAtualizar(String codigo) {
        return etiquetaRepository.buscarPorCodigoParaAtualizar(normalizarCodigo(codigo))
            .orElseThrow(() -> new NotFoundException("Etiqueta não encontrada para o código informado."));
    }

    public Etiqueta associar(Long id, String codigoBarras) {
        Etiqueta etiqueta = buscarParaAtualizar(id);
        var produto = produtoRepository.findByCodigoBarras(codigoBarras)
            .orElseThrow(() -> new NotFoundException("Produto não encontrado para o código de barras informado."));
        if (etiqueta.associar(produto))
            eventos.publishEvent(new SincronizacaoEtiquetaSolicitada(etiqueta.getId(), etiqueta.getVersaoAtualizacao()));
        return etiqueta;
    }

    public Etiqueta desassociar(Long id) {
        Etiqueta etiqueta = buscarParaAtualizar(id);
        if (etiqueta.desassociar())
            eventos.publishEvent(new SincronizacaoEtiquetaSolicitada(etiqueta.getId(), etiqueta.getVersaoAtualizacao()));
        return etiqueta;
    }

    private void validarUnicidade(EtiquetaRequest request, Long id) {
        String codigo = normalizarCodigo(request.codigoDispositivo());
        boolean codigoDuplicado = id == null
            ? etiquetaRepository.existsByCodigoDispositivoIgnoreCase(codigo)
            : etiquetaRepository.existsByCodigoDispositivoIgnoreCaseAndIdNot(codigo, id);
        if (codigoDuplicado) throw new ConflictException("Já existe uma etiqueta com este código de dispositivo.");
    }

    private static StatusEtiqueta status(Etiqueta etiqueta) {
        return etiqueta.getProduto() == null ? StatusEtiqueta.DISPONIVEL : StatusEtiqueta.ASSOCIADA;
    }

    private static String normalizarNome(String nome) { return nome.trim(); }
    private static String normalizarCodigo(String codigo) { return codigo.trim().toUpperCase(); }
    private static String normalizarBusca(String busca) { return busca == null || busca.isBlank() ? null : busca.trim(); }
}
