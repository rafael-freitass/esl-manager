package br.edu.ifpr.eslmanager.api.dto;

import br.edu.ifpr.eslmanager.domain.Etiqueta;
import br.edu.ifpr.eslmanager.domain.StatusAtualizacao;
import br.edu.ifpr.eslmanager.domain.ErroAtualizacao;
import br.edu.ifpr.eslmanager.domain.StatusEtiqueta;

public record EtiquetaResponse(
        Long id,
        String nome,
        String codigoDispositivo,
        StatusEtiqueta status,
        String codigoBarrasProduto,
        StatusAtualizacao statusAtualizacao,
        ErroAtualizacao erroAtualizacao,
        boolean aguardandoRegistro,
        boolean podeExcluir,
        String motivoBloqueioExclusao
) {
    public static EtiquetaResponse from(Etiqueta etiqueta) {
        return new EtiquetaResponse(etiqueta.getId(), etiqueta.getNome(), etiqueta.getCodigoDispositivo(),
            etiqueta.getProduto() == null ? StatusEtiqueta.DISPONIVEL : StatusEtiqueta.ASSOCIADA,
            etiqueta.getProduto() == null ? null : etiqueta.getProduto().getCodigoBarras(),
            etiqueta.getStatusAtualizacao(), etiqueta.getErroAtualizacao(), etiqueta.isAguardandoRegistro(),
            etiqueta.isPodeExcluir(), etiqueta.getMotivoBloqueioExclusao());
    }
}
