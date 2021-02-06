import React from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import { ApiProvider } from './provider'
import { useUser } from './hooks'
import store from './store'
import init from './__mocks__/@skolplattformen/embedded-api'
import createStorage from './__mocks__/AsyncStorage'

const pause = (ms = 0) => new Promise(r => setTimeout(r, ms))

describe('useUser()', () => {
  let api
  let storage
  let result
  const wrapper = ({ children }) => (
    <ApiProvider api={api} storage={storage}>{children}</ApiProvider>
  )
  beforeEach(() => {
    result = { id: 1 }
    api = init()
    api.getUser.mockImplementation(() => (
      new Promise((res) => {
        setTimeout(() => res(result), 50)
      })
    ))
    storage = createStorage({
      user: { id: 2 }
    }, 2)
  })
  afterEach(async () => {
    await act(async () => {
      await pause(70)
      store.dispatch({ entity: 'ALL', type: 'CLEAR' })
    })
  })
  it('returns correct initial value', () => {
    const { result } = renderHook(() => useUser(), { wrapper })

    expect(result.current.status).toEqual('pending')
  })
  it('calls api', async () => {
    await act(async () => {
      api.isLoggedIn = true
      const { waitForNextUpdate } = renderHook(() => useUser(), { wrapper })

      await waitForNextUpdate()
      await waitForNextUpdate()

      expect(api.getUser).toHaveBeenCalled()
    })
  })
  it('only calls api once', async () => {
    await act(async () => {
      api.isLoggedIn = true
      renderHook(() => useUser(), { wrapper })
      const { waitForNextUpdate } = renderHook(() => useUser(), { wrapper })

      await waitForNextUpdate()
      renderHook(() => useUser(), { wrapper })
      await waitForNextUpdate()
      renderHook(() => useUser(), { wrapper })
      await waitForNextUpdate()

      const { result } = renderHook(() => useUser(), { wrapper })

      expect(api.getUser).toHaveBeenCalledTimes(1)
      expect(result.current.status).toEqual('loaded')
    })
  })
  it('calls cache', async () => {
    await act(async () => {
      api.isLoggedIn = true
      const { result, waitForNextUpdate } = renderHook(() => useUser(), { wrapper })

      await waitForNextUpdate()
      await waitForNextUpdate()

      expect(result.current.data).toEqual({ id: 2 })
    })
  })
  it('updates status to loading', async () => {
    await act(async () => {
      api.isLoggedIn = true
      const { result, waitForNextUpdate } = renderHook(() => useUser(), { wrapper })

      await waitForNextUpdate()
      await waitForNextUpdate()

      expect(result.current.status).toEqual('loading')
    })
  })
  it('updates status to loaded', async () => {
    await act(async () => {
      api.isLoggedIn = true
      const { result, waitForNextUpdate } = renderHook(() => useUser(), { wrapper })

      await waitForNextUpdate()
      await waitForNextUpdate()
      await waitForNextUpdate()

      expect(result.current.status).toEqual('loaded')
    })
  })
  it('stores in cache if not fake', async () => {
    await act(async () => {
      api.isLoggedIn = true
      api.isFake = false

      const { waitForNextUpdate } = renderHook(() => useUser(), { wrapper })

      await waitForNextUpdate()
      await waitForNextUpdate()
      await waitForNextUpdate()
      await pause(20)

      expect(storage.cache['user']).toEqual('{"id":1}')
    })
  })
  it('does not store in cache if fake', async () => {
    await act(async () => {
      api.isLoggedIn = true
      api.isFake = true

      const { waitForNextUpdate } = renderHook(() => useUser(), { wrapper })

      await waitForNextUpdate()
      await waitForNextUpdate()
      await waitForNextUpdate()
      await pause(20)

      expect(storage.cache['user']).toEqual('{"id":2}')
    })
  })
})
