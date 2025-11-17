/// <reference types="cypress" />

import { LoginPage } from "../pages/loginPage";
import { InventoryPage } from '../pages/inventoryPage';
const { _ } = Cypress

const sessionId = `User-Session-${Date.now()}`;
const standardUser = Cypress.env('users').standard

if (!standardUser) {
  throw new Error('Missing the standard user')
}

describe('Accessibility Test for each page', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it('Accessibility Test - Login Page', () => {
    // Ensure all elements are visible for analysis
    cy.checkAccessibility();
  })

  it('Accessibility Test - Inventory Page', () => {
    LoginPage.login(standardUser.username, standardUser.password)
    cy.get('.inventory_list')
      .should('be.visible')
      .find('.inventory_item')
      .should('have.length.greaterThan', 3)
     
      cy.checkAccessibility();
  });

})