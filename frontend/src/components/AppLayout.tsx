import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router'
import { pages } from '../config/pages'
import { Icon } from './Icon'

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const currentPage =
    Object.values(pages).find((page) => page.path === location.pathname) ??
    pages.home

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <span />
            <span />
            <span />
          </div>
          <div>
            <strong>ESL</strong>
            <span>Manager</span>
          </div>
        </div>

        <nav className="main-nav" aria-label="Navegação principal">
          <span className="nav-label">NAVEGAÇÃO</span>
          {Object.entries(pages).map(([pageId, item]) => (
            <NavLink
              key={pageId}
              to={item.path}
              end={pageId === 'home'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon name={item.icon} size={19} />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="version">ESL Manager · v1.0</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>{currentPage.title}</h1>
            <p>{currentPage.description}</p>
          </div>
          <div className="profile">
            <div className="profile-copy">
              <strong>Rafael Freitas</strong>
              <span>Operador da loja</span>
            </div>
            <div className="avatar" aria-label="Perfil de Rafael Freitas">
              RF
            </div>
          </div>
        </header>

        <div className="page-content">{children}</div>
      </main>
    </div>
  )
}
