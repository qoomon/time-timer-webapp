describe('Original Time Timer screenshot', () => {
  it('takes a full-page screenshot of the original', () => {
    cy.visit('http://localhost:3000')
    cy.wait(800)
    cy.screenshot('original-timer-app', { capture: 'fullPage' })
  })
})
