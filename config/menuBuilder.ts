import { MenuBuilder, type MenuItemConfig } from '@menu/index'
import { CircleDollarSign } from 'lucide-vue-next'

/**
 * Currency Menu Builder
 * Builds the currency management menu structure
 */
export class CurrencyMenuBuilder extends MenuBuilder {
  build(menu: MenuItemConfig, menuName: string): MenuItemConfig {
    if (menuName === 'admin') {
      return this.buildMainMenu(menu)
    }
    return menu
  }

  /**
   * Build admin menu items
   */
  private buildMainMenu(menu: MenuItemConfig): MenuItemConfig {
    this.addMenuItem(menu, {
      id: 'currency',
      title: 'Deviza',
      path: '/admin/currency',
      icon: CircleDollarSign,
      order: 50,
      permission: 'currency'
    })

    return menu
  }
}

// Export singleton instance
export const currencyMenuBuilder = new CurrencyMenuBuilder()


