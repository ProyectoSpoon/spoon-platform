// Mock temporal para clipboard
export default {
  setString: async (text) => {
    console.log('Clipboard mock: ', text)
  },
  getString: async () => {
    return 'mock clipboard text'
  }
}
