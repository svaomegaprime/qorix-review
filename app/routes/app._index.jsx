import { useNavigation } from 'react-router';
import { Text } from '@shopify/polaris';
import SetupGuide from '../components/pages/dashboard/SetupGuide';
import ReviewBreakdown from '../components/pages/dashboard/ReviewBreakdown';
import Loader from '../components/essentials/Loader';
import AppEmbedStatus from '../components/essentials/AppEmbedStatus';
import Analytics from '../components/essentials/Analytics';
import FAQ from '../components/pages/dashboard/FAQ';
import Help from '../components/pages/dashboard/Help';

export default function Index() {
  // Start----Default CSR loading state checking for navigation
  const navigation = useNavigation();
  if (navigation.state === 'loading') {
    return <Loader />;
  }
  // End----Default CSR loading state checking for navigation
  return (
    <s-page>
      <s-stack direction='inline' gap='base' justifyContent='space-between' alignItems='center' paddingBlockEnd='base'>
        <Text as='h2'>Welcome to Qorix review 👋</Text>
        <s-grid gridTemplateColumns='auto auto' gap='base'>
          <s-button variant='secondary' icon='plus'>
            Request reviews
          </s-button>
          <s-button variant='primary' icon='store'>
            View store
          </s-button>
        </s-grid>
      </s-stack>

      <SetupGuide /> 
      <AppEmbedStatus
        isAppEnabled={false}
      />
      <Analytics />
      <ReviewBreakdown />
      <s-stack paddingBlockStart='base'><FAQ /></s-stack>
      <s-stack paddingBlockStart='base'><Help /></s-stack>
      <s-stack alignItems='center' paddingBlockStart='large'>
        <s-paragraph color='subdued'>
          Powered by Qorix Shopify - All rights reserved
        </s-paragraph>
      </s-stack>
    </s-page>
  );
}