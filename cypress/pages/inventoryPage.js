// @ts-check
/// <reference types="cypress" />

export const InventoryPage = {
    // querying the shopping cart element 

    // adding an item by name to the cart from the spec
    /**
     * 
     * @param {*} productName 
     */
    addInventoryItemToCart(productName) {
        cy.contains('.inventory_item', productName).within(() => {
            cy.contains('button', 'Add to cart').click()
            cy.contains('button', 'Add to cart').should('not.exist')
            cy.contains('button', 'Remove')
        })
    },

    // Chain Assertion in the test - specific to my test
    /**
     * 
     * @param {*} number 
     * @returns 
     */
    checkCartBadgeNumbers(number) {
        return cy.contains('.shopping_cart_badge', number).scrollIntoView()
    },

    getCartBadge() {
        return cy.get('.shopping_cart_link').find('.shopping_cart_badge')
    }
}