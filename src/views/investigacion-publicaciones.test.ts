// "Publicaciones y difusión" está oculta mientras no hay ninguna y aparece
// sola al añadir la primera entrada en src/contenido/investigacion.ts.
import { describe, expect, it, vi } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'

vi.stubGlobal('__VERSION_SINTONIA__', '0.0.0')

async function montar() {
  const { default: Vista } = await import('./InvestigacionPublicaView.vue')
  return mount(Vista, {
    global: {
      stubs: { RouterLink: RouterLinkStub, LayoutPublico: { template: '<div><slot /></div>' } },
    },
  })
}

describe('Publicaciones y difusión', () => {
  it('no aparece si la lista está vacía', async () => {
    vi.resetModules()
    const w = await montar()
    expect(w.find('#publicaciones').exists()).toBe(false)
    expect(w.text()).not.toContain('Publicaciones y difusión')
  })

  it('aparece sola, también en el índice, con la primera entrada', async () => {
    vi.resetModules()
    vi.doMock('@/contenido/investigacion', async (original) => ({
      ...(await original<typeof import('@/contenido/investigacion')>()),
      PUBLICACIONES: [{ cita: 'Martín Vaquero, F. (2027). Ejemplo de comunicación.', fecha: '2027-06-01' }],
    }))
    const w = await montar()
    expect(w.find('#publicaciones').exists()).toBe(true)
    expect(w.text()).toContain('Ejemplo de comunicación')
    expect(w.find('a[href="#publicaciones"]').exists()).toBe(true)
    vi.doUnmock('@/contenido/investigacion')
  })
})
