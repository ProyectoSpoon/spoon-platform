const React = require('react')
const { View, Text } = require('react-native')

function AppNavigator() {
  return React.createElement(View, 
    { style: { flex: 1, justifyContent: 'center', alignItems: 'center' } },
    React.createElement(Text, null, 'Spoon App - Require Test')
  )
}

module.exports = AppNavigator
