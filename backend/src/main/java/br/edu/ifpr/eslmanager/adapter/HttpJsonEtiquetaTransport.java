package br.edu.ifpr.eslmanager.adapter;

import jakarta.annotation.PreDestroy;
import static br.edu.ifpr.eslmanager.domain.ErroAtualizacao.*;
import static br.edu.ifpr.eslmanager.adapter.ResultadoEnvio.*;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.DeserializationFeature;

@Component
public class HttpJsonEtiquetaTransport implements EtiquetaTransport {
    private static final Logger log = LoggerFactory.getLogger(HttpJsonEtiquetaTransport.class);
    private final JsonMapper json;
    private final Duration timeout;
    private final HttpClient client;

    public HttpJsonEtiquetaTransport(JsonMapper json,
            @Value("${esl.transporte.http.timeout:7s}") Duration timeout) {
        if (timeout.isNegative() || timeout.isZero())
            throw new IllegalArgumentException("O timeout HTTP deve ser positivo.");
        this.json = json.rebuild().enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS).build();
        this.timeout = timeout;
        this.client = HttpClient.newBuilder().connectTimeout(timeout)
            .followRedirects(HttpClient.Redirect.NEVER).build();
    }

    @Override
    public ResultadoEnvio enviar(String host, int porta, ConteudoDispositivo conteudo) {
        if (host == null || host.isBlank()) return falha(FALHA_COMUNICACAO);
        try {
            URI uri = new URI("http", null, host, porta, "/display", null, null);
            HttpRequest request = HttpRequest.newBuilder(uri).timeout(timeout)
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(conteudo)))
                .build();
            var pendente = client.sendAsync(request, HttpResponse.BodyHandlers.ofString());
            HttpResponse<String> response;
            try {
                // Limita também a leitura de um corpo cuja transmissão fique parada.
                response = pendente.get(timeout.toNanos(), TimeUnit.NANOSECONDS);
            } catch (InterruptedException | TimeoutException exception) {
                pendente.cancel(true);
                throw exception;
            }
            if (response.statusCode() != 200) {
                log.warn("Etiqueta {}: HTTP {}, versão não confirmada.", conteudo.codigoDispositivo(), response.statusCode());
                return falha(RESPOSTA_HTTP_INVALIDA);
            }
            String tipo = response.headers().firstValue("Content-Type").orElse("").split(";", 2)[0].trim();
            if (!tipo.equalsIgnoreCase("application/json")) return ackInvalido(conteudo);
            var ack = json.readTree(response.body());
            if (ack == null || !ack.isObject()) return ackInvalido(conteudo);
            var codigo = ack.path("codigoDispositivo");
            var versao = ack.path("versao");
            var aplicada = ack.path("aplicada");
            if (!codigo.isString() || !conteudo.codigoDispositivo().equals(codigo.asString())
                    || !versao.isIntegralNumber() || !versao.canConvertToLong()
                    || versao.longValue() != conteudo.versao()
                    || !aplicada.isBoolean() || !aplicada.booleanValue()) return ackInvalido(conteudo);
            return sucesso();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            return falha(ENVIO_INTERROMPIDO);
        } catch (TimeoutException exception) {
            return falha(TIMEOUT);
        } catch (ExecutionException exception) {
            return falha(exception.getCause() instanceof java.net.http.HttpTimeoutException
                ? TIMEOUT : FALHA_COMUNICACAO);
        } catch (JacksonException exception) {
            return falha(ACK_INVALIDO);
        } catch (URISyntaxException | IllegalArgumentException exception) {
            return falha(FALHA_COMUNICACAO);
        }
    }

    private ResultadoEnvio ackInvalido(ConteudoDispositivo conteudo) {
        log.warn("Etiqueta {}: confirmação inválida para versão {}.", conteudo.codigoDispositivo(), conteudo.versao());
        return falha(ACK_INVALIDO);
    }

    @PreDestroy
    public void fechar() { client.close(); }
}
