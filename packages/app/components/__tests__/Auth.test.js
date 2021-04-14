import { useApi } from '@skolplattformen/api-hooks'
import { render } from '../../utils/testHelpers'
import React from 'react'
import { Auth } from '../auth.component'
import { useAsyncStorage } from 'use-async-storage'
import { findBestAvailableLanguage } from 'react-native-localize'

jest.mock('@skolplattformen/api-hooks')
jest.mock('use-async-storage')
jest.mock('react-native-localize')

const setup = (lang = 'sv') => {
  useApi.mockReturnValue({
    api: { on: jest.fn(), off: jest.fn() },
    isLoggedIn: false,
  })

  findBestAvailableLanguage.mockReturnValue({
    languageTag: lang,
    isRTL: false,
  })

  const navigation = {
    navigate: jest.fn(),
  }

  useAsyncStorage.mockReturnValue(['ssn', jest.fn()])

  return render(<Auth navigation={navigation} />)
}

test('renders a random fun argument state', () => {
  const screen = setup()

  expect(screen.getByText(/öppna skolplattformen/i)).toBeTruthy()
  expect(screen.getByText(/det [a-zåäö]+ alternativet/i)).toBeTruthy()
})

describe('english translations of auth', () => {
  let screen

  beforeAll(() => {
    screen = setup('en')
  })

  test('renders a random fun argument state in english', () => {
    expect(screen.getByText(/öppna skolplattformen/i)).toBeTruthy()
    expect(screen.getByText(/the [a-zåäö]+ alternative/i)).toBeTruthy()
  })
})
