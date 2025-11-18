/// <reference types="cypress" />
import 'cypress-map'
import { LoginPage } from "../pages/loginPage";
import { InventoryPage } from '../pages/inventoryPage';
import inventoryData from '../fixtures/inventoryList.json';
import { InventoryData } from '../../src/utils/InventoryData';

const { _ } = Cypress

const sessionId = `User-Session-${Date.now()}`;
const standardUser = Cypress.env('users').standard

if (!standardUser) {
  throw new Error('Missing the standard user')
}

describe('Product Inventory Item Checkout Test', () => {
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

    it('Test Cart Page Items - Version2 - fixture data', () => {
      const items = [
        'Sauce Labs Bike Light',
        'Sauce Labs Bolt T-Shirt',
        'Sauce Labs Onesie',
      ]

      const selectedIds = _.chain(inventoryData)
        .filter((inventory) => items.includes(inventory.name))
        .map('id')
        .value()

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

      cy.window().its('localStorage')
        .invoke('getItem', 'cart-contents')
        .should('exist') // since we are not sure when application set the item, good to ensure application to set item.
        .then(JSON.parse)
        .should('deep.equal', selectedIds);
    })

    it('Test Cart Page Set Items using localstorage - Ver3 - existing source code', () => {
      const items = [
        'Sauce Labs Bike Light',
        'Sauce Labs Bolt T-Shirt',
        'Sauce Labs Onesie',
      ]

      const selectedIds = items.map((name) => _.find(InventoryData, { name })?.id)
      window.localStorage.setItem('cart-contents', JSON.stringify(selectedIds))

      cy.window().its('localStorage')
        .invoke('getItem', 'cart-contents')
        .should('exist') // since we are not sure when application set the item, good to ensure application to set item.
        .then(JSON.parse)
        .should('deep.equal', selectedIds);

      cy.get('.shopping_cart_link').click()

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

    it('Test Complete Checkout Process - Detail (My) Version', () => {
      const items = [
        'Sauce Labs Bike Light',
        'Sauce Labs Bolt T-Shirt',
        'Sauce Labs Onesie',
      ]

      const selectedIds = items.map((name) => _.find(InventoryData, { name })?.id)
      window.localStorage.setItem('cart-contents', JSON.stringify(selectedIds))
      cy.window().its('localStorage')
        .invoke('getItem', 'cart-contents')
        .should('exist') // since we are not sure when application set the item, good to ensure application to set item.
        .then(JSON.parse)
        .should('deep.equal', selectedIds);

      cy.get('.shopping_cart_link').click()
      cy.location('pathname').should('equal', "/cart.html");
      items.forEach((item, index) => {
        cy.get('.cart_list .cart_item')
          .should('have.length', 3)
          .eq(index)
          .within(() => {
            cy.contains('.cart_quantity', 1)
            cy.contains('.inventory_item_name', item)
          })
      })

      cy.get('[data-test="checkout"]').click()  // Click checkout button 
      cy.location('pathname').should('equal', "/checkout-step-one.html");
      cy.get('[data-test="firstName"]').type('Michael').should('have.value', 'Michael')
      cy.get('[data-test="lastName"]').type('Jordan').should('have.value', 'Jordan')
      cy.get('[data-test="postalCode"]').type('90210').should('have.value', '90210')
      cy.get('[data-test="continue"]').click()

      cy.location('pathname').should('equal', "/checkout-step-two.html");
      items.forEach((item, index) => {
        cy.get('.cart_list .cart_item')
          .should('have.length', 3)
          .eq(index)
          .within(() => {
            cy.contains('.cart_quantity', 1)
            cy.contains('.inventory_item_name', item)
          })
      })
      cy.get('[data-test="finish"]').click()

      cy.location('pathname').should('equal', "/checkout-complete.html");
      cy.get('h2.complete-header').should('have.text', 'THANK YOU FOR YOUR ORDER')
      cy.get('#checkout_complete_container').within(() => {
        cy.get('img').should('have.attr', 'alt').and('include', 'Pony Express')
      })

      cy.window().its('localStorage')
        .invoke('getItem', 'cart-contents')
        .should('not.exist')
    })

    it('Test Complete Checkout Process - concise version with all Ids', () => {
      // Grab the id property from each item in the InventoryData array
      const ids = _.map(InventoryData, 'id')
      window.localStorage.setItem('cart-contents', JSON.stringify(ids))

      cy.visit('/cart.html')
      cy.get('.cart_list .cart_item').should('have.length', InventoryData.length)
      cy.contains('button', 'Checkout').click()
      cy.location('pathname').should('equal', "/checkout-step-one.html");
      cy.get('.checkout_info_wrapper').within(() => {
        cy.get('[data-test="firstName"]').type('Michael').should('have.value', 'Michael')
        cy.get('[data-test="lastName"]').type('Jordan').should('have.value', 'Jordan')
        cy.get('[data-test="postalCode"]').type('90210').should('have.value', '90210')
        cy.get('input[type=submit]').should('have.attr', 'value', 'Continue').click()
      })
      cy.location('pathname').should('equal', "/checkout-step-two.html");
      cy.get('.cart_list .cart_item').should('have.length', InventoryData.length)
      cy.contains('[data-test=finish]', 'Finish').click()
      cy.location('pathname').should('equal', "/checkout-complete.html");

      cy.get('#checkout_complete_container').should('be.visible')
      cy.window().its('localStorage')
        .invoke('getItem', 'cart-contents')
        .should('not.exist')
    })

  })
})