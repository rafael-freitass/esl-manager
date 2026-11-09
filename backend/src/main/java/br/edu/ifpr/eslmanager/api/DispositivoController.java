package br.edu.ifpr.eslmanager.api;

import br.edu.ifpr.eslmanager.api.dto.RegistroDispositivoRequest;
import br.edu.ifpr.eslmanager.api.dto.RegistroDispositivoResponse;
import br.edu.ifpr.eslmanager.service.DispositivoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dispositivos")
public class DispositivoController {
    private final DispositivoService dispositivoService;

    public DispositivoController(DispositivoService dispositivoService) {
        this.dispositivoService = dispositivoService;
    }

    @PostMapping("/registro")
    public RegistroDispositivoResponse registrar(@Valid @RequestBody RegistroDispositivoRequest request) {
        return dispositivoService.registrar(request);
    }
}
