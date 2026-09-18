const createWebStorage = () => {
  return {
    getItem: (key) => {
      return Promise.resolve(localStorage.getItem(key))
    },

    setItem: (key, value) => {
      localStorage.setItem(key, value)
      return Promise.resolve(value)
    },

    removeItem: (key) => {
      localStorage.removeItem(key)
      return Promise.resolve()
    },
  }
}

const storage = createWebStorage()

export default storage