describe('Time Timer screenshot', () => {
  it('takes a full-page screenshot', () => {
    cy.visit('http://localhost:5180')
    cy.get('svg[aria-label="Timer dial"]').should('be.visible')
    cy.wait(500)
    cy.screenshot('timer-app', { capture: 'fullPage' })
  })
})
