package br.edu.ifpr.eslmanager.repository;

import br.edu.ifpr.eslmanager.domain.Produto;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    Optional<Produto> findByCodigoBarras(String codigoBarras);
    boolean existsByCodigoBarras(String codigoBarras);
    List<Produto> findAllByOrderByNomeAsc();
}
