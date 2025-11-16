/// <reference types="cypress" />
import 'cypress-map'
import { LoginPage } from "../pages/loginPage";
import { InventoryPage } from '../pages/inventoryPage';
const { _ } = Cypress

const sessionId = `User-Session-${Date.now()}`;
const standardUser = Cypress.env('users').standard

if (!standardUser) {
  throw new Error('Missing the standard user')
}

describe('Product Inventory Item Test', () => {
  context('Viewing Cart Checkout Items', { testIsolation: true }, () => {
    beforeEach(() => {
      LoginPage.sessionLogin(sessionId, standardUser.username, standardUser.password)
      cy.visit('/inventory.html')
      cy.get('.inventory_list')
        .should('be.visible')
        .find('.inventory_item')
        .should('have.length.greaterThan', 3)
    })

    it('Test Cart Page Items - Version1', () => {
      const items = [
        'Sauce Labs Bike Light',
        'Sauce Labs Bolt T-Shirt',
        'Sauce Labs Onesie',
      ]

      InventoryPage.getCartBadge().should('not.exist')
      items.forEach((item, index) => {
        InventoryPage.addInventoryItemToCart(item)
        InventoryPage.checkCartBadgeNumbers(index + 1).should('be.visible')
      })
      cy.get('.inventory_item:contains("Remove")').should('have.length', 3)
      cy.get('a.shopping_cart_link').click();

      cy.location('pathname').should('equal', "/cart.html");
      cy.get('.title').should('have.text', 'Your Cart')

      cy.get('.cart_list')
        .within(() => {
          cy.get('.cart_item').should('have.length', 3)
          cy.get('.cart_item').each(($el, index) => {
            expect($el.find('.cart_quantity').text()).to.equal('1')
            expect($el.find('.inventory_item_name').text()).to.equal(items[index])
          })
        })
    })

    it('Test Cart Page Items - Version2', () => {
      const items = [
        'Sauce Labs Bike Light',
        'Sauce Labs Bolt T-Shirt',
        'Sauce Labs Onesie',
      ]

      items.forEach(InventoryPage.addInventoryItemToCart)
      InventoryPage.getCartBadge().should('have.text', items.length)
        .scrollIntoView().click()

      cy.location('pathname').should('equal', "/cart.html");
      cy.get('.title').should('have.text', 'Your Cart')

      items.forEach((item, index) => {

        cy.get('.cart_list .cart_item')
          .should('have.length', 3)
          .eq(index)
          .within(() => {
            cy.contains('.cart_quantity', 1)
            cy.contains('.inventory_item_name', item)
          })
      })

    })
  })
})