// @ts-check
/// <reference types="cypress" />

export const LoginPage = {
  getUsername() {
    return cy.get('[data-test="username"]')
  },

  getPassword() {
    return cy.get('[data-test="password"]')
  },

  clickLoginButton() {
    cy.get('[data-test="login-button"]').click()
  },

  login(username, password) {
    LoginPage.getUsername().type(username);
    LoginPage.getPassword().type(password);
    LoginPage.clickLoginButton();
  },

  sessionLogin(sessionId, username, password) {
    cy.session(`${username} Session` + "-" +sessionId, () => {
        cy.visit('/')
        this.login(username, password)
        cy.location('pathname').should('equal', "/inventory.html");
        cy.getCookie('session-username')
          .should('exist')
      },
      {
        validate() {
          cy.log('Validate...')
          cy.visit('/inventory.html')
          cy.location('pathname').should('equal', "/inventory.html");
        },
      },
    )
  },

  getError() {
    return cy.get('[data-test="error"]')
  },

  getLoginErrorButton() {
    return cy.get('[data-test="error"] button.error-button')
  },

  showError(errorMsg) {
    LoginPage.getUsername().should('have.class', 'error');
    LoginPage.getPassword().should('have.class', 'error');
    cy.contains('[data-test=error]', errorMsg).should('be.visible');
  },

  noErrors() {
    cy.log('**errors go away**')
    LoginPage.getError().should('not.exist')
    LoginPage.getUsername().should('not.have.class', 'error');
    LoginPage.getPassword().should('not.have.class', 'error');
  }
}