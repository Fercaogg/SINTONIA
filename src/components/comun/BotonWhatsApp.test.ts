import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BotonWhatsApp from './BotonWhatsApp.vue'

describe('botón de WhatsApp', () => {
  it('sin número no aparece', () => {
    expect(mount(BotonWhatsApp, { props: { numero: '' } }).find('a').exists()).toBe(false)
  })

  it('con número enlaza a wa.me con el mensaje preparado, en otra pestaña', () => {
    const a = mount(BotonWhatsApp, { props: { numero: '34600000000' } }).get('a')
    expect(a.attributes('href')).toBe('https://wa.me/34600000000?text=' + encodeURIComponent('Hola, os escribo desde la web de SINTONÍA.'))
    expect(a.attributes('rel')).toContain('noopener')
    expect(a.text()).toContain('WhatsApp')
  })
})
