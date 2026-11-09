package br.edu.ifpr.eslmanager.api;

import br.edu.ifpr.eslmanager.api.dto.AssociacaoRequest;
import br.edu.ifpr.eslmanager.api.dto.EtiquetaRequest;
import br.edu.ifpr.eslmanager.api.dto.EtiquetaResponse;
import br.edu.ifpr.eslmanager.domain.StatusEtiqueta;
import br.edu.ifpr.eslmanager.service.EtiquetaService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/etiquetas")
public class EtiquetaController {
    private final EtiquetaService etiquetaService;

    public EtiquetaController(EtiquetaService etiquetaService) {
        this.etiquetaService = etiquetaService;
    }

    @PostMapping
    public ResponseEntity<EtiquetaResponse> cadastrar(@Valid @RequestBody EtiquetaRequest request) {
        var response = EtiquetaResponse.from(etiquetaService.cadastrar(request));

        return ResponseEntity.created(URI.create("/api/etiquetas/" + response.id())).body(response);
    }

    @GetMapping
    public List<EtiquetaResponse> listar(@RequestParam(required = false) String busca,
                                         @RequestParam(required = false) StatusEtiqueta status) {
        return etiquetaService.listar(busca, status).stream().map(EtiquetaResponse::from).toList();
    }

    @GetMapping("/{id}")
    public EtiquetaResponse buscar(@PathVariable Long id) {
        return EtiquetaResponse.from(etiquetaService.buscar(id));
    }

    @PutMapping("/{id}")
    public EtiquetaResponse atualizar(@PathVariable Long id, @Valid @RequestBody EtiquetaRequest request) {
        return EtiquetaResponse.from(etiquetaService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        etiquetaService.excluir(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/produto")
    public EtiquetaResponse associar(@PathVariable Long id, @Valid @RequestBody AssociacaoRequest request) {
        return EtiquetaResponse.from(etiquetaService.associar(id, request.codigoBarras()));
    }

    @DeleteMapping("/{id}/produto")
    public EtiquetaResponse desassociar(@PathVariable Long id) {
        return EtiquetaResponse.from(etiquetaService.desassociar(id));
    }
}
