package br.edu.ifpr.eslmanager.api.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.net.InetAddress;
import java.net.Inet6Address;

public record RegistroDispositivoRequest(
    @NotBlank @Size(max = 64) String codigoDispositivo,
    @NotBlank @Size(max = 45) String host,
    @NotNull @Min(1) @Max(65535) Integer porta
) {
    @AssertTrue(message = "Informe localhost, um IP de loopback ou um IP privado de rede local.")
    public boolean isHostLocalValido() {
        if (host == null || host.isBlank()) return true; // Validado por @NotBlank.
        String endereco = host.trim();
        if (endereco.equalsIgnoreCase("localhost")) return true;
        // Apenas IP literal: nenhuma consulta DNS nem URL, escopo IPv6 ou porta embutida.
        if (endereco.contains("%") || endereco.contains("[") || endereco.contains("]")) return false;
        try {
            InetAddress ip = InetAddress.ofLiteral(endereco);
            if (ip.isLoopbackAddress()) return true;
            if (ip instanceof Inet6Address) return (ip.getAddress()[0] & 0xfe) == 0xfc; // fc00::/7.
            return ip.isSiteLocalAddress(); // 10/8, 172.16/12 e 192.168/16.
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }
}
