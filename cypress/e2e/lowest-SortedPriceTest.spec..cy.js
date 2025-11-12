// enables intelligent code completion for Cypress commands
// https://on.cypress.io/intelligent-code-completion
/// <reference types="cypress" />
import 'cypress-map'
import { LoginPage } from "../pages/loginPage";
const { _ } = Cypress
chai.use(require('chai-sorted'))
const sessionId = `User-Session-${Date.now()}`;
const standardUser = Cypress.env('users').standard

// Consider These Functions to Custom Function
/**
 * 
 * @param {az|za|lowhi|hilo} sortOrder 
 */
function selectSortByNamesPrices(sortOrder) {
  cy.get('[data-test="product_sort_container"]').select(sortOrder)  // select option value 
  cy.get('select[data-test="product_sort_container"]').should('have.value', sortOrder)
}

function getPrices() {
  return cy.get('.inventory_item_price').should('have.length.greaterThan', 3)
    .map('innerText')
    .print('Price Lists %o')
    .mapInvoke('slice', 1)
    .print('Price Lists without$ %o')
    .map(Number)
    .print('Price Lists: %o')
}

function getNames() {
  return cy.get('.inventory_item_name').should('have.length.greaterThan', 3)
    .map('innerText')
    .print('Name Lists %o')
}

// Disable Test Isolation: each test is isolated automatically => Default Blank Page 
// Use this where test don't change state.
describe('Store Test', {testIsolation: false},() => {
  before(() => {
    LoginPage.sessionLogin(sessionId, standardUser.username, standardUser.password)
    cy.visit('/inventory.html')
    cy.get('.inventory_list')
      .should('be.visible')
      .find('.inventory_item')
      .should('have.length.greaterThan', 3)
  })

  context('Lowest Price Item Test', () => {
    it('Test the Lowest Price Item selected - My Version', () => {
      cy.get('select[data-test="product_sort_container"]')
        .contains('Price (low to high)')
        .invoke('index')
        .then((index) => {
          cy.get(('select[data-test="product_sort_container"]')).select(index)
        })
      cy.get('select[data-test="product_sort_container"]').should('have.value', 'lohi')
      cy.get('.inventory_item').should('have.length.greaterThan', 1)
        .find('.inventory_item_price:first').should('contain.text', '7.99')
        .parent('.pricebar').prev('.inventory_item_label:first').should('exist')
        .find('.inventory_item_name').should('have.text', 'Sauce Labs Onesie')
    })

    it('Verify Lowest Price without plugin', () => {
      cy.get('.inventory_list').should('be.visible')
        .find('.inventory_item_price').should('have.length.greaterThan', 3)
        .then((list) => _.map(list, 'innerText')) // only inner text
        .then(console.log)  // lists of prices including $ at the beginning
        .then((list) => _.map(list, (str) => str.substr(1))) // only string number
        .then(console.log)
        .then((list) => _.map(list, Number))  // convert to number
        .then(console.log)
        .then((list) => _.min(list))
        .then(console.log)
        .should('equal', 7.99)
    })

    it('Verify Lowest Price with plugin', () => {
      cy.get('.inventory_list').should('be.visible')
        .find('.inventory_item_price').should('have.length.greaterThan', 3)
        .map('innerText')
        .print('Price Lists %o')
        .mapInvoke('slice', 1)
        .print('Price Lists without$ %o')
        .map(Number)
        .print('Price Lists: %o')
        .apply(_.min)
        .should('equal', 7.99)
    })
  })

  context('Sorted Price Item Test - Ascending - Practice Purpose', () => {
    beforeEach(() => {
      // Simple Version
      // cy.get('[data-test="product_sort_container"]').select('lohi')  // select option value 
      cy.get('select[data-test="product_sort_container"]')
        .contains('Price (low to high)')
        .invoke('index')
        .then((index) => {
          cy.get(('select[data-test="product_sort_container"]')).select(index)
        })
      cy.get('select[data-test="product_sort_container"]').should('have.value', 'lohi')
    });

    it('Verify Sorted Prices using loadash', () => {
      cy.get('.inventory_list').should('be.visible')
        .find('.inventory_item_price').should('have.length.greaterThan', 3)
        .map('innerText')
        .print('Price Lists %o')
        .mapInvoke('slice', 1)
        .print('Price Lists without$ %o')
        .map(Number)
        .print('Price Lists: %o')
        .should((prices) => {
          const sortedPrices = _.sortBy(prices)
          expect(prices, 'sorted prices in asending order').to.deep.equal(sortedPrices)
        });
    });

    it('Verify Sorted Prices using chai sorted', () => {
      cy.get('.inventory_list').should('be.visible')
        .find('.inventory_item_price').should('have.length.greaterThan', 3)
        .map('innerText')
        .print('Price Lists %o')
        .mapInvoke('slice', 1)
        .print('Price Lists without$ %o')
        .map(Number)
        .print('Price Lists: %o')
        .should('be.sorted')
        .and('be.ascending')
    });
  })

  context('Sorted Price Item Test', () => {
    it('Verify Sorted Prices in Ascending order', () => {
      selectSortByNamesPrices('lohi')
      getPrices().should('be.ascending')
    })

    it('Verify Sorted Prices in Descending order', () => {
      selectSortByNamesPrices('hilo')
      getPrices().should('be.descending')
    })
  })

  context('Sort Item Names Tests', () => {
    it('Verify Sorted Names in Ascending order', () => {
      selectSortByNamesPrices('az')
      getNames().should('be.ascending')
    })

    it('Verify Sorted Names in Descending order', () => {
      selectSortByNamesPrices('za')
      getNames().should('be.descending')
    })
  })

  context('Inventory Items List Test', () => {
    it('Inventory Item Details Check Test', () => {
      cy.fixture('inventoryList').then((inventoryList) => {
        inventoryList.forEach((inventory) => {
          cy.contains('.inventory_item_description', inventory.name).within(() => {
            cy.contains('.inventory_item_name', inventory.name)
            cy.contains('.inventory_item_desc', inventory.desc)
            cy.contains('.inventory_item_price', inventory.price)
          })
        })
      })
    })
  })
})