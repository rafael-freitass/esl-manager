package br.edu.ifpr.eslmanager.adapter;

public interface EtiquetaTransport {
    // Sucesso somente após ACK válido para o código e a versão enviados.
    ResultadoEnvio enviar(String host, int porta, ConteudoDispositivo conteudo);
}
