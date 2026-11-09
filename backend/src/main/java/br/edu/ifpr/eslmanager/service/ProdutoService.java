package br.edu.ifpr.eslmanager.service;

import br.edu.ifpr.eslmanager.domain.Produto;
import br.edu.ifpr.eslmanager.repository.EtiquetaRepository;
import br.edu.ifpr.eslmanager.repository.ProdutoRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProdutoService {
    private final ProdutoRepository produtoRepository;
    private final EtiquetaRepository etiquetaRepository;
    private final ApplicationEventPublisher eventos;

    public ProdutoService(ProdutoRepository produtoRepository, EtiquetaRepository etiquetaRepository,
            ApplicationEventPublisher eventos) {
        this.produtoRepository = produtoRepository;
        this.etiquetaRepository = etiquetaRepository;
        this.eventos = eventos;
    }
    public List<Produto> listar() { return produtoRepository.findAllByOrderByNomeAsc(); }

    @Transactional
    public Produto cadastrar(String codigoBarras, String nome, BigDecimal preco) {
        String codigo = codigoBarras.trim();
        if (produtoRepository.existsByCodigoBarras(codigo))
            throw new ConflictException("Já existe um produto com este código de barras.");

        try {
            return produtoRepository.saveAndFlush(new Produto(codigo, nome.trim(), preco));
        } catch (DataIntegrityViolationException exception) {
            // A restrição do banco também protege cadastros concorrentes do mesmo código.
            throw new ConflictException("Já existe um produto com este código de barras.");
        }
    }

    @Transactional
    public void excluir(String codigoBarras) {
        Produto produto = produtoRepository.findByCodigoBarras(codigoBarras)
            .orElseThrow(() -> new NotFoundException("Produto não encontrado."));
        if (etiquetaRepository.existsByProdutoId(produto.getId()))
            throw new ConflictException("Desassocie as etiquetas antes de excluir o produto.");

        try {
            produtoRepository.delete(produto);
            produtoRepository.flush();
        } catch (DataIntegrityViolationException exception) {
            // Uma associação concorrente continua protegida pela chave estrangeira.
            throw new ConflictException("Desassocie as etiquetas antes de excluir o produto.");
        }
    }

    @Transactional
    public Produto atualizarPreco(String codigoBarras, BigDecimal preco) {
        Produto produto = produtoRepository.findByCodigoBarras(codigoBarras)
            .orElseThrow(() -> new NotFoundException("Produto não encontrado."));
        return atualizar(produto, produto.getNome(), preco);
    }

    @Transactional
    public Produto atualizarProduto(String codigoBarras, String nome, BigDecimal preco) {
        Produto produto = produtoRepository.findByCodigoBarras(codigoBarras)
            .orElseThrow(() -> new NotFoundException("Produto não encontrado."));
        return atualizar(produto, nome, preco);
    }

    private Produto atualizar(Produto produto, String nome, BigDecimal preco) {
        String nomeNormalizado = nome.trim();
        boolean nomeAlterado = !produto.getNome().equals(nomeNormalizado);
        boolean precoAlterado = produto.getPreco().compareTo(preco) != 0;
        if (!nomeAlterado && !precoAlterado) return produto;

        produto.atualizar(nomeNormalizado, preco);
        etiquetaRepository.findAllByProdutoId(produto.getId())
            .forEach(etiqueta -> {
                etiqueta.marcarAtualizacaoPendente();
                eventos.publishEvent(new SincronizacaoEtiquetaSolicitada(etiqueta.getId(), etiqueta.getVersaoAtualizacao()));
            });
        return produto;
    }
}
