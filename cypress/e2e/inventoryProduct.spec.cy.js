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
  context('Viewing Product Items', { testIsolation: false }, () => {
    before(() => {
      LoginPage.sessionLogin(sessionId, standardUser.username, standardUser.password)
      cy.visit('/inventory.html')
      cy.get('.inventory_list')
        .should('be.visible')
        .find('.inventory_item')
        .should('have.length.greaterThan', 3)
    })

    it("Test Selected Product Inventory Item with id number & attribute name & value ", () => {
      const productName = 'Sauce Labs Fleece Jacket'
      const productPrice = '$49.99'

      // my initial selector - attribute - Lesson 21
      cy.get('.inventory_item')   //.should('have.attr','data-itemid')
        .invoke('attr', 'data-itemid')
        .should('be.a', 'string')
        .and('not.be.empty')

      // solution - attribute - Lesson 21  
      cy.contains('.inventory_item', productName)
        .should('have.attr', 'data-itemid')
        .should('be.a', 'string')
        .then((itemId) => {

          // My Initial Selector: - Lesson20  
          //cy.contains('.inventory_item_name',`${productName}`).click();
          // Solution Selector: - Lesson20
          cy.contains('.inventory_item', productName).find('.inventory_item_label a')
            // item_5_title_link
            .should('have.attr', 'id', `item_${itemId}_title_link`)
            .click()

          cy.location('pathname').should('equal', "/inventory-item.html");
          cy.location('search').should('match', /id=\d+/);
          cy.location('search').should('include', `id=${itemId}`);

          cy.get('#inventory_item_container .inventory_details')
            .should('be.visible')
            .within(() => {
              cy.contains('.inventory_details_name.large_size', productName)
              cy.contains('.inventory_details_price', productPrice)
            })

          // My Initial Assertion: - Lesson20  
          cy.get('[class="inventory_details_name large_size"]').should('have.text', productName)
          cy.get('.inventory_details_price').should('have.text', productPrice)
          cy.get('.inventory_details_img').should('be.visible')

          cy.get('[data-test="back-to-products"]').click();
          cy.location('pathname').should('contain', "/inventory.html");
        })
    })

    it("Test Inventory Items unique Id using Set", () => {
      cy.get('.inventory_item')
        .then($elements => {
          // 1. Extract all 'data-itemid' values using the .map() function
          //    .map() is a jQuery function available on the $elements collection
          const itemIds = $elements
            .map((index, el) => Cypress.$(el).attr('data-itemid'))
            .get(); // .get() converts the jQuery object back into a standard JavaScript array

          // Log the extracted IDs for visibility in the Cypress command log
          cy.log('Extracted Item IDs:', itemIds);

          // 2. Create a JavaScript Set from the array
          //    A Set only stores unique values, automatically filtering out duplicates.
          const uniqueIdsSet = new Set(itemIds);

          // 3. Perform the uniqueness assertion
          const arrayLength = itemIds.length;
          const setSize = uniqueIdsSet.size;

          // Assert that the number of elements in the array (total items)
          // is equal to the number of elements in the Set (unique items)
          expect(arrayLength,
            `Expected ${arrayLength} item IDs to be unique, found ${setSize} unique IDs.`
          ).to.equal(setSize);
        });

    })

    it("Test Inventory Items unique Ids with JS map method", () => {
      cy.get('.inventory_item')
        .invoke('toArray')
        .then((itemArray) => itemArray.map((e1) => e1.getAttribute('data-itemid')))
        .then((dataIds) => {
          const uniqArray = _.uniq(dataIds)  // loadash to retun uniqua array
          expect(dataIds).to.deep.equal(uniqArray)
        })
    })

    it("Test Inventory Items unique Ids with loadash map method", () => {
      cy.get('.inventory_item')
        .then(($itemList) => {
          const attributeValues = _.map($itemList, (el) => el.getAttribute('data-itemid'))
          const uniqueAttValues = new Set(attributeValues);
          expect(attributeValues.length).to.equal(uniqueAttValues.size)
        })
    })

    it("Test Inventory Items unique Ids with jQuery method", () => {
      cy.get('.inventory_item')
        .then(($itemList) => {
          const attributeValues = _.map($itemList, (el) => Cypress.$(el).attr('data-itemid'))
          const uniqueAttValues = new Set(attributeValues);
          expect(attributeValues.length).to.equal(uniqueAttValues.size)
        })
    })

    it("Test Inventory Items Attributes with map plugin", () => {
      cy.get('.inventory_item')
        .mapInvoke('getAttribute', 'data-itemid')
        .print('itemIds %o')
        .map(Number)
        .then((attributeValues) => {
          const uniqArray = _.uniq(attributeValues)
          expect(uniqArray).to.deep.equal(attributeValues)
        })
    })

    it("Test Unique Inventory Items Descriptions", () => {
      cy.get('#inventory_container .inventory_list')
        .within(() => {
          cy.get('.inventory_item_desc').should('have.length', 6)
            .and(($itemList) => {
              const txtDescription = _.map($itemList, 'innerText')
              const uniqueDesc = _.uniq(txtDescription)
              expect(uniqueDesc, 'all unique item description').to.have.length(txtDescription.length)
            })
        })
    })
  })

  context('Adding Items to the Cart', { viewportHeight: 1200 }, () => {
    beforeEach(() => {
      LoginPage.sessionLogin(sessionId, standardUser.username, standardUser.password)
      cy.visit('/inventory.html')
      cy.get('.inventory_list')
        .should('be.visible')
        .find('.inventory_item')
        .should('have.length.greaterThan', 3)
    })

    it('Adding & Verifying Items to the Cart', () => {
      const firstProductItem = 'Sauce Labs Bike Light'
      const secondProductItem = 'Sauce Labs Bolt T-Shirt'

      // nothing
      cy.get('.shopping_cart_link').children().should('have.length', 0)

      cy.get('[data-test="add-to-cart-sauce-labs-bike-light"]')
        .map('innerText')
        .print('%o')
        .should('match', /Add to cart/i)

      cy.get('[data-test="add-to-cart-sauce-labs-bike-light"]').click()

      cy.get('[data-test="remove-sauce-labs-bike-light"]')
        .map('innerText')
        .print('%o')
        .should('match', /Remove/i)

      cy.get('#shopping_cart_container').scrollIntoView()
      cy.get('.shopping_cart_link').children().should('have.length', 1)
      cy.get('.shopping_cart_badge').should('have.text', '1')

      cy.get('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]').click()
      cy.get('[data-test="remove-sauce-labs-bolt-t-shirt"]')
        .map('innerText')
        .print('%o')
        .should('match', /Remove/i)

      cy.get('#shopping_cart_container').scrollIntoView()
      cy.get('.shopping_cart_badge').should('have.text', '2')
      cy.get('button:contains("Remove")').should('have.length', 2)
    })
    it('Test Adding Items to the Cart', () => {
      const firstProductItem = 'Sauce Labs Bike Light'
      const secondProductItem = 'Sauce Labs Bolt T-Shirt'
      cy.get('.shopping_cart_link').find('.shopping_cart_badge').should('not.exist')

      cy.contains('.inventory_item', firstProductItem).within(() => {
        cy.contains('button', 'Add to cart').click()
        cy.contains('button', 'Add to cart').should('not.exist')
        cy.contains('button', 'Remove')
      })

      cy.contains('.shopping_cart_badge', 1).scrollIntoView().should('be.visible')

      cy.contains('.inventory_item', secondProductItem).within(() => {
        cy.contains('button', 'Add to cart').click()
        cy.contains('button', 'Add to cart').should('not.exist')
        cy.contains('button', 'Remove')
      })

      cy.contains('.shopping_cart_badge', 2).scrollIntoView().should('be.visible')
      cy.get('.inventory_item:contains("Remove")').should('have.length', 2)
    })

    it('Test Adding Items using PO then remove 1 item - V1', () => {
      const firstProductItem = 'Sauce Labs Bike Light'
      const secondProductItem = 'Sauce Labs Bolt T-Shirt'
      InventoryPage.getCartBadge().should('not.exist')

      InventoryPage.addInventoryItemToCart(firstProductItem)
      InventoryPage.checkCartBadgeNumbers(1).should('be.visible')

      InventoryPage.addInventoryItemToCart(secondProductItem)
      InventoryPage.checkCartBadgeNumbers(2).should('be.visible')
      cy.get('.inventory_item:contains("Remove")').should('have.length', 2)

      InventoryPage.getCartBadge().click()
      cy.location('pathname').should('equal', "/cart.html");

      cy.get('.cart_item').should('have.length', 2)
      cy.contains('.cart_item', 'Bike Light').should('exist').contains('button', 'Remove').click()
      cy.contains('.cart_item', 'Bike Light').should('not.exist')
      cy.get('.cart_item').should('have.length', 1)
      cy.get('.inventory_item_name').should('contain.text', 'Bolt T-Shirt')
      InventoryPage.checkCartBadgeNumbers(1).should('be.visible')
    })

    it('Test Adding Items using PO then remove 1 item - V2 concise', () => {
      const firstProductItem = 'Sauce Labs Bike Light'
      const secondProductItem = 'Sauce Labs Bolt T-Shirt'
      InventoryPage.getCartBadge().should('not.exist')

      InventoryPage.addInventoryItemToCart(firstProductItem)
      InventoryPage.checkCartBadgeNumbers(1).should('be.visible')

      InventoryPage.addInventoryItemToCart(secondProductItem)
      InventoryPage.checkCartBadgeNumbers(2).should('be.visible')

      InventoryPage.getCartBadge().should('have.text', 2).click()
      cy.location('pathname').should('equal', "/cart.html");
      cy.get('.cart_list .cart_item').should('have.length', 2)
      cy.contains('.cart_list .cart_item', 'Bike Light').should('exist').contains('button', 'Remove').click()
      cy.get('.cart_list .cart_item').should('have.length', 1).contains('Bolt T-Shirt')
      InventoryPage.getCartBadge().should('have.text', 1)
    })
  })

  context('Product Item Images Check', () => {
    beforeEach(() => {
      LoginPage.sessionLogin(sessionId, standardUser.username, standardUser.password)
      cy.visit('/inventory.html')
      cy.get('.inventory_list')
        .should('be.visible')
        .find('.inventory_item')
        .should('have.length.greaterThan', 3)
    })

    it('Ensure each product image has the alt and its corresponding value', () => {
      const productNames = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt', 'Sauce Labs Fleece Jacket', 'Sauce Labs Onesie', 'Test.allTheThings() T-Shirt (Red)']    
      cy.get('.inventory_list').within(() => {
        cy.get('img')
          .each(($img, k) => {
            expect($img, `image ${k}`).to.have.attr('alt').to.be.eq(productNames[k])
          })
      })
    })
  })
})