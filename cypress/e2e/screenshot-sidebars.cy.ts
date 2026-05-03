describe('Sidebars screenshots', () => {
  it('screenshots alarm list sidebar open', () => {
    cy.visit('http://localhost:5180')
    cy.get('svg[aria-label="Timer dial"]').should('be.visible')
    cy.get('button[aria-label="Open alarms list"]').click()
    cy.wait(400)
    cy.screenshot('sidebars-list-open', { capture: 'fullPage' })
  })

  it('screenshots alarm set sidebar open', () => {
    cy.visit('http://localhost:5180')
    cy.get('svg[aria-label="Timer dial"]').should('be.visible')
    cy.get('button[aria-label="Set new alarm"]').click()
    cy.wait(400)
    cy.screenshot('sidebars-set-open', { capture: 'fullPage' })
  })

  it('screenshots both sidebars open', () => {
    cy.visit('http://localhost:5180')
    cy.get('svg[aria-label="Timer dial"]').should('be.visible')
    cy.get('button[aria-label="Open alarms list"]').click()
    cy.get('button[aria-label="Set new alarm"]').click()
    cy.wait(400)
    cy.screenshot('sidebars-both-open', { capture: 'fullPage' })
  })
})
