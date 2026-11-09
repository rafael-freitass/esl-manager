import { Icon } from '../components/Icon.tsx'
import { Link } from 'react-router'
import { pages } from '../config/pages.ts'

type HomePageProps = {
  counts: { total: number; available: number; associated: number }
}

export function HomePage({ counts }: HomePageProps) {
  return (
    <div className="home-page">
      <section className="welcome">
        <span className="eyebrow">VISÃO GERAL</span>
        <h2>Olá, administrador. Bem-vindo ao ESL Manager.</h2>
        <p>
          Gerencie suas etiquetas eletrônicas e mantenha os produtos
          organizados.
        </p>
      </section>

      <section className="summary-grid" aria-label="Resumo de etiquetas">
        <article className="summary-card">
          <div className="summary-icon blue">
            <Icon name="tag" size={20} />
          </div>
          <div>
            <span>Total de etiquetas</span>
            <strong>{counts.total}</strong>
          </div>
        </article>
        <article className="summary-card">
          <div className="summary-icon gray">
            <Icon name="tag" size={20} />
          </div>
          <div>
            <span>Etiquetas disponíveis</span>
            <strong>{counts.available}</strong>
          </div>
        </article>
        <article className="summary-card">
          <div className="summary-icon green">
            <Icon name="link" size={20} />
          </div>
          <div>
            <span>Etiquetas associadas</span>
            <strong>{counts.associated}</strong>
          </div>
        </article>
      </section>

      <section className="shortcuts">
        <div className="section-heading">
          <h3>Acesso rápido</h3>
          <p>Acesse as principais áreas do sistema.</p>
        </div>
        <div className="shortcut-grid">
          <Link
            className="shortcut-card primary-shortcut"
            to={pages.labels.path}
          >
            <div className="shortcut-icon">
              <Icon name="tag" size={22} />
            </div>
            <div>
              <strong>Gerenciar etiquetas</strong>
              <span>Crie, edite e associe etiquetas a produtos.</span>
            </div>
            <Icon name="arrowRight" />
          </Link>
          <Link className="shortcut-card" to={pages.products.path}>
            <div className="shortcut-icon">
              <Icon name="package" size={22} />
            </div>
            <div>
              <strong>Ver produtos</strong>
              <span>Consulte os produtos disponíveis no catálogo.</span>
            </div>
            <Icon name="arrowRight" />
          </Link>
        </div>
      </section>
    </div>
  )
}
