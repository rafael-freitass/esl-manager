package br.edu.ifpr.eslmanager.api;

import br.edu.ifpr.eslmanager.api.dto.PrecoProdutoRequest;
import br.edu.ifpr.eslmanager.api.dto.ProdutoAtualizacaoRequest;
import br.edu.ifpr.eslmanager.api.dto.ProdutoRequest;
import br.edu.ifpr.eslmanager.api.dto.ProdutoResponse;
import br.edu.ifpr.eslmanager.domain.Produto;
import br.edu.ifpr.eslmanager.service.ProdutoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {
    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @GetMapping
    public List<ProdutoResponse> listar() {
        return produtoService.listar().stream().map(ProdutoResponse::from).toList();
    }

    @PostMapping
    public ResponseEntity<ProdutoResponse> cadastrar(@Valid @RequestBody ProdutoRequest request) {
        ProdutoResponse response = ProdutoResponse.from(
            produtoService.cadastrar(request.codigoBarras(), request.nome(), request.preco())
        );
        var location = UriComponentsBuilder.fromPath("/api/produtos/{codigoBarras}")
            .encode().buildAndExpand(response.codigoBarras()).toUri();
        return ResponseEntity.created(location).body(response);
    }

    @DeleteMapping("/{codigoBarras}")
    public ResponseEntity<Void> excluir(@PathVariable String codigoBarras) {
        produtoService.excluir(codigoBarras);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{codigoBarras}/preco")
    public ProdutoResponse atualizarPreco(
        @PathVariable String codigoBarras,
        @Valid @RequestBody PrecoProdutoRequest request
    ) {
        Produto produto = produtoService.atualizarPreco(codigoBarras, request.preco());
        return ProdutoResponse.from(produto);
    }

    @PatchMapping("/{codigoBarras}")
    public ProdutoResponse atualizarProduto(
        @PathVariable String codigoBarras,
        @Valid @RequestBody ProdutoAtualizacaoRequest request
    ) {
        Produto produto = produtoService.atualizarProduto(
            codigoBarras, request.nome(), request.preco()
        );
        return ProdutoResponse.from(produto);
    }
}
