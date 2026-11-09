package br.edu.ifpr.eslmanager.repository;

import br.edu.ifpr.eslmanager.domain.Etiqueta;
import br.edu.ifpr.eslmanager.domain.ErroAtualizacao;
import java.util.List;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EtiquetaRepository extends JpaRepository<Etiqueta, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Etiqueta e where e.produto.id = :produtoId order by e.id")
    List<Etiqueta> findAllByProdutoId(@Param("produtoId") Long produtoId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Etiqueta e where e.id = :id")
    Optional<Etiqueta> buscarParaAtualizar(@Param("id") Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from Etiqueta e where lower(e.codigoDispositivo) = lower(:codigo)")
    Optional<Etiqueta> buscarPorCodigoParaAtualizar(@Param("codigo") String codigo);
    boolean existsByProdutoId(Long produtoId);
    Optional<Etiqueta> findByCodigoDispositivoIgnoreCase(String codigoDispositivo);
    boolean existsByCodigoDispositivoIgnoreCase(String codigoDispositivo);
    boolean existsByCodigoDispositivoIgnoreCaseAndIdNot(String codigoDispositivo, Long id);

    @Modifying
    @Query("update Etiqueta e set e.versaoConfirmada = :versao, e.statusAtualizacao = 'ATUALIZADA', e.erroAtualizacao = null where e.id = :id " +
        "and e.codigoDispositivo = :codigo and e.versaoAtualizacao = :versao " +
        "and e.statusAtualizacao = 'ENVIANDO' and e.host = :host and e.porta = :porta and e.versaoConfirmada <= :versao and :versao > 0")
    int confirmarSeAtual(@Param("id") Long id, @Param("codigo") String codigo, @Param("versao") long versao,
        @Param("host") String host, @Param("porta") int porta);

    @Modifying
    @Query("update Etiqueta e set e.statusAtualizacao = 'ENVIANDO', e.erroAtualizacao = null " +
        "where e.id = :id and e.versaoAtualizacao = :versao and e.statusAtualizacao = 'PENDENTE' " +
        "and e.host is not null and e.porta is not null")
    int iniciarEnvio(@Param("id") Long id, @Param("versao") long versao);

    @Modifying
    @Query("update Etiqueta e set e.statusAtualizacao = 'ERRO', e.erroAtualizacao = :erro " +
        "where e.id = :id and e.codigoDispositivo = :codigo and e.versaoAtualizacao = :versao " +
        "and e.host = :host and e.porta = :porta and e.statusAtualizacao = 'ENVIANDO'")
    int falharSeAtual(@Param("id") Long id, @Param("codigo") String codigo, @Param("versao") long versao,
        @Param("host") String host, @Param("porta") int porta,
        @Param("erro") ErroAtualizacao erro);

    @Modifying
    @Query("update Etiqueta e set e.statusAtualizacao = 'ERRO', e.erroAtualizacao = 'ENVIO_NAO_AGENDADO' " +
        "where e.id = :id and e.versaoAtualizacao = :versao and e.statusAtualizacao = 'PENDENTE' " +
        "and e.host is not null and e.porta is not null")
    int envioNaoAgendado(@Param("id") Long id, @Param("versao") long versao);

    @Modifying
    @Query("update Etiqueta e set e.statusAtualizacao = 'ERRO', e.erroAtualizacao = 'ENVIO_INTERROMPIDO' " +
        "where e.statusAtualizacao = 'ENVIANDO'")
    int interromperEnvios();

    @Query("select e from Etiqueta e where lower(e.nome) like lower(concat('%', :busca, '%')) " +
        "or lower(e.codigoDispositivo) like lower(concat('%', :busca, '%'))")
    List<Etiqueta> buscar(@Param("busca") String busca);
}
