// @ts-check
/// <reference types="cypress" />

import { LoginPage } from "../pages/loginPage";

const standardUser = Cypress.env('users').standard
const lockedUser   = Cypress.env('users').lockedOut


describe('Login Test Scenario', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  context('Postive - User Login and Logout Test Case', () => {
    it('Standar User Login and Logout Test', () => {
      LoginPage.login(standardUser.username, standardUser.password)
      cy.location('pathname').should('equal', "/inventory.html");

      cy.contains('button', 'Open Menu').click();
      cy.get('.bm-menu').should('be.visible');
      cy.contains('a', 'Logout').click();

      cy.location('pathname').should('equal', '/')
      cy.visit('/inventory.html')
      LoginPage.showError(
        "Epic sadface: You can only access '/inventory.html' when you are logged in."
      )
    })
  })

  context('Negative - Error Login Test Case', () => {
    it('Locked out user test - ensure error msg display', () => {
      LoginPage.getUsername().type(lockedUser.username);
      LoginPage.getPassword().type(lockedUser.password);
      LoginPage.clickLoginButton();

      LoginPage.showError('locked out')
      LoginPage.getLoginErrorButton().should('be.visible').click();

      LoginPage.noErrors();
      LoginPage.getUsername().should('have.value', 'locked_out_user');
      LoginPage.getPassword().should('have.value', 'secret_sauce');
    })

    it('Empty username - ensure error msg display', () => {
      LoginPage.clickLoginButton();
      LoginPage.showError('Username is required')
    })

    it('Empty password - ensure error msg display', () => {
      LoginPage.getUsername().type('test');
      LoginPage.clickLoginButton();
      LoginPage.showError('Password is required')
    })

    it('Direct access to inventory page - ensure error msg display', () => {
      cy.visit('/inventory.html')
      cy.location('pathname').should('equal', '/')
      LoginPage.showError('You can only access \'/inventory.html\' when you are logged in')
    })
  })
})