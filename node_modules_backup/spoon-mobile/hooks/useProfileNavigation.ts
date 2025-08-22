import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { ProfileStackParamList } from '../navigation/types'

type ProfileNavigationProp = StackNavigationProp<ProfileStackParamList>

export const useProfileNavigation = () => {
  const navigation = useNavigation<ProfileNavigationProp>()
  
  return {
    navigateToEditProfile: () => navigation.navigate('EditProfile'),
    navigateToSecurity: () => navigation.navigate('Security'),
    navigateToChangePassword: () => navigation.navigate('ChangePassword'),
    navigateToNotifications: () => navigation.navigate('Notifications'),
    navigateToPrivacy: () => navigation.navigate('Privacy'),
    navigateToPreferences: () => navigation.navigate('Preferences'),
    navigateToHelp: () => navigation.navigate('Help'),
    navigateToContactSupport: () => navigation.navigate('ContactSupport'),
    navigateToAbout: () => navigation.navigate('About'),
    navigateToPrivacyPolicy: () => navigation.navigate('PrivacyPolicy'),
    navigateToTermsConditions: () => navigation.navigate('TermsConditions'),
    navigateToConnections: () => navigation.navigate('Connections'),
    goBack: () => navigation.goBack(),
  }
}
